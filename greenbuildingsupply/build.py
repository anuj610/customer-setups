import sys

sys.path.append('../conversion')

from conversion import Unbxd_Feed_Generator, Unbxd_Feed_Uploader, UNBXD_MAIN

import fieldmap

import csv
import json
import paramiko

class GBS_Unbxd_Feed_Generator(Unbxd_Feed_Generator):
    image_cdn_url = '//res.cloudinary.com/greenbuildingsupply/image/upload/f_auto,t_small/small/'
    
    special_variant_category_list = [   'Bamboo Flooring', 
                                        'Cork Flooring', 
                                        'Hardwood Flooring', 
                                        'Natural Linoleum Flooring', 
                                        'Carpet', 
                                        'Tile', 
                                        'Area Rugs'
                                    ]

    sample_class = 'Samples'    

    length_brackets = [
        {'threshold' : 12, 'range' : '0" - 12"'},
        {'threshold' : 24, 'range' : '13" - 24"'},
        {'threshold' : 36, 'range' : '25" - 36"'},
        {'threshold' : 48, 'range' : '37" - 48"'},
        {'threshold' : 60, 'range' : '49" - 60"'},
        {'threshold' : 72, 'range' : '61" - 72"'},
        {'threshold' : 84, 'range' : '73" - 84"'},
        {'threshold' : 96, 'range' : '85" - 96"'},
        {'threshold' : 100000, 'range' : 'Longer than 97"'}
    ]
    
    width_brackets = [
        {'threshold' : 3, 'range' : '0" - 3"'},
        {'threshold' : 5, 'range' : '4" - 5"'},
        {'threshold' : 6, 'range' : '5" - 6"'},
        {'threshold' : 7, 'range' : '6" - 7"'},
        {'threshold' : 8, 'range' : '7" - 8"'},
        {'threshold' : 9, 'range' : '8" - 9"'},
        {'threshold' : 100000, 'range' : 'Wider than 9"'}
    ]
    
    #gets files from sftp location
    def _get_remote_file(self, p_file_name):
        #download file from FTP: sftp.unbxdapi.com
        host = 'sftp.unbxdapi.com'
        port = 22
        transport = paramiko.Transport((host, port))
        
        username = 'gbs_unbxd'
        password = 'gbs#)06!^'
        
        transport.connect(username = username, password = password)
        
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        local_loc = 'remote/' + p_file_name
        
        sftp.get(p_file_name, local_loc)
        sftp.close()
        transport.close()
        
        file_data = self._read_file_data(local_loc)

        return file_data
    
    
    def _read_file_data(self, p_file_name):
        if p_file_name.endswith('csv'):
            return csv.DictReader(open(p_file_name))
        elif p_file_name.endswith('json'):
            return json.load(open(p_file_name))
            
        return false
    
    
    def _get_raw_feed(self):
        input_files = []
        input_data = {}
        
        #input_files.append(self._read_file_data("remote/customsearch1846.json"))
        #input_files.append(self._read_file_data("remote/customsearch1847.json"))
        #input_files.append(self._read_file_data("remote/customsearch1848.json"))
        #input_files.append(self._read_file_data("remote/customsearch1863.json"))
        #input_files.append(self._read_file_data("remote/customsearch1892.json"))
        
        input_files.append(self._get_remote_file("customsearch1846.json"))
        input_files.append(self._get_remote_file("customsearch1847.json"))
        input_files.append(self._get_remote_file("customsearch1848.json"))
        input_files.append(self._get_remote_file("customsearch1863.json"))
        input_files.append(self._get_remote_file("customsearch1892.json"))
        
        #print input_files[0][0]
        #sys.exit(1)
        
        for input_file in input_files :
            for row in input_file :
                #assumed that first column in every file will always be internal id
                internalid = row[0]['text']
                for column in row :
                    fld_name = self._get_column_name(column)
                    
                    if internalid not in input_data :
                        input_data[internalid] = {fld_name : {'text' : column['text']}}
                    else :
                        input_data[internalid][fld_name] = {'text' : column['text']}
                        
                    if 'value' in column :
                        input_data[internalid][fld_name].update({'value' : column['value']})

        return input_data
    
    
    def _get_column_name(self, pObj):
        if 'label' in pObj and pObj['label']:
            return pObj['label']
        else :
            return pObj['internalName']


    def add_unbxd_rating(self, product):
        temp_dict = product
        if "average_rating_display" in temp_dict and "submitted_reviews" in temp_dict:
            temp_dict['unbxd_rating'] = float(temp_dict['average_rating_display']) * 100 \
                         + float(temp_dict['submitted_reviews'])
        elif "average_rating_display" in temp_dict:
            temp_dict['unbxd_rating'] = float(temp_dict['average_rating_display']) * 100
        else:
            temp_dict['unbxd_rating'] = float(temp_dict['submitted_reviews'])
        return temp_dict


    def _get_reviews(self):
        reviews_file = self._get_remote_file('reviews.csv')
        
        reviews_data = {}
        for row in reviews_file :
            temp_dict = {}
            for key, val in row.iteritems() :
                formatted_key = self._format_field_name(key)
                val = val.strip()
                if formatted_key == 'page_id':
                    page_id = val
                    reviews_data[val] = temp_dict
                elif formatted_key == 'product_name' :
                    pass
                elif formatted_key == 'submitted_reviews' and val:
                    temp_dict[formatted_key] = val
                    temp_dict['submitted_reviews_str'] = val + ' reviews' \
                                            if int(val) > 1 else val+' review'
                elif formatted_key == 'average_rating' and val:
                    temp_dict['average_rating'] = float(val)
                    decimal_part = float(val) % 1
                    if decimal_part < 0.25 :
                        decimal_part = 0
                    elif decimal_part < 0.75 :
                        decimal_part = 0.5
                    else :
                        decimal_part = 1
                        
                    temp_dict['average_rating_display_numeric'] = int(float(val)) + decimal_part
                    temp_dict['average_rating_display'] = str(temp_dict['average_rating_display_numeric'])
                else :
                    temp_dict[formatted_key] = val
            
            reviews_data[page_id] = self.add_unbxd_rating(reviews_data[page_id])
            
        return reviews_data
    
    
    def _correct_key_val(self, p_key, p_val):
        m = fieldmap.FIELDMAP
        
        ret_key = m[p_key] if p_key in m else p_key
        
        if p_key == 'parent' and 'value' in p_val :
            ret_val = p_val['value']['internalid'] if 'internalid' in p_val['value'] else ''
        elif 'value' in p_val and isinstance(p_val['value'], list) and \
          len(p_val['value']) and isinstance(p_val['value'][0], dict) :
            ret_val = [ x['name'] \
                            if 'name' in x \
                            else '' 
                            for x in p_val['value'] ]
        elif 'text' in p_val and p_val['text'] is not None :
            ret_val = p_val['text']
        elif 'value' in p_val and isinstance(p_val['value'], dict) :
            ret_val = p_val['value']['name'] if 'name' in p_val['value'] else ''
        else :
            ret_val = p_val['value'] if 'value' in p_val else ''
                            
        if ret_val == 'TRUE' or ret_val == 'T' or ret_val == 'Yes' :
            ret_val = True
            
        if ret_val == 'FALSE' or ret_val == 'F' or ret_val == 'No' :
            ret_val = False
                            
        return ret_key, ret_val


    def _format_field_name(self, p_field_name):
        formatted_name = ''.join(temp for temp in p_field_name if temp.isalnum() or temp == ' ')
        formatted_name = formatted_name.strip().replace(' ', '_').lower()
        return formatted_name
    
    
    def _get_discount(self, pPrice, pSellPrice):
        savedAmt = float(pPrice) - float(pSellPrice)    
        price = float(pSellPrice)
        if savedAmt <= 0 :
            return ''
        
        discountPerc = (savedAmt / (price + savedAmt)) * 100

        discountPerc = round(discountPerc)

        return discountPerc
    
    
    # For certain categories the data is such that client wants to show child 
    # variants as main products and doesn't want to show parent records.
    # This function will omit parent records.
    def _remove_parents(self, p_product_data, p_spcl_parents_dict):
        p_product_data[:] = [row for row in p_product_data 
                                if row['uniqueId'] not in p_spcl_parents_dict]
    
    
    #create child item as a dictionary with key as parent's sku
    def _handle_child_items(self, p_product_data, p_child_dict):
        parent_sku = p_product_data['parent_internal_id_final']
        if parent_sku :
            if parent_sku in p_child_dict and isinstance(p_child_dict[parent_sku], list) :
                p_child_dict[parent_sku].append(p_product_data)
            else:
                p_child_dict[parent_sku] = []
                p_child_dict[parent_sku].append(p_product_data)
                
            
    def _push_variant(self, p_parent_data, p_field, p_val):
        if p_field not in p_parent_data :
            p_parent_data[p_field] = p_val if isinstance(p_val, list) else [p_val]
        elif isinstance(p_val, list) :
            p_parent_data[p_field] += p_val
        else :
            p_parent_data[p_field].append(p_val)

    def __addingCustomPrice__(self, product_list):
        for row in product_list:
            if 'dontshowprice' in row and row['dontshowprice'] == 1 and 'price' in row:
                row['nonCustomPrice'] = row['price']
            else:
                row['customPrice'] = row['price']
        return product_list            

    def _get_variant_data(self, p_children_data, p_parent_data):
        min_price = 0
        
        replace_parent_props = 0
        
        if 'parent_internal_id_final' in p_children_data[0] \
            and p_children_data[0]['parent_internal_id_final'] :
                replace_parent_props = 1
                p_parent_data['coverage'] = []
                p_parent_data['width_final'] = []
                p_parent_data['thickness_final'] = []
                p_parent_data['length_final'] = []
                p_parent_data['length'] = []
                p_parent_data['width'] = []
                p_parent_data['total_weight'] = []
                p_parent_data['square_feet__box_square_feet'] = []
        
        for child_data in p_children_data:
            try :
                min_price = child_data['price'] \
                if min_price == 0 or float(child_data['price']) < float(min_price) else min_price
            except Exception :
                pass
            
            if "sample_id" in child_data and (p_parent_data['sample_id'] == "" or "sample_id" not in p_parent_data):
                p_parent_data.pop("sample_price", None)
                if "sample_price" in p_parent_data:
                    p_parent_data["sample_price"] = ""
                p_parent_data['sample_id'] = child_data['sample_id']

            if 'faux_option_name' in child_data and child_data['faux_option_name'] :
                self._push_variant(p_parent_data, 'faux_option_name_variants', child_data['faux_option_name'])
            
            if 'price' in child_data and child_data['price'] :
                self._push_variant(p_parent_data, 'price_variants', child_data['price'])

            if 'imageUrl' in child_data and child_data['imageUrl'] :
                self._push_variant(p_parent_data, 'image_url_variants', child_data['imageUrl'])
                p_parent_data['image_url_variants_clean'] = list(set(p_parent_data['image_url_variants']))
                if 'imageUrl' in p_parent_data and p_parent_data['imageUrl'] in p_parent_data['image_url_variants_clean'] :
                    p_parent_data['image_url_variants_clean'].remove(p_parent_data['imageUrl'])
                    
            if replace_parent_props == 1 :
                if 'coverage' in child_data and child_data['coverage'] :
                    self._push_variant(p_parent_data, 'coverage', child_data['coverage'])
                    
                if 'width_final' in child_data and child_data['width_final'] :
                    self._push_variant(p_parent_data, 'width_final', child_data['width_final'])
                    
                if 'thickness_final' in child_data and child_data['thickness_final'] :
                    self._push_variant(p_parent_data, 'thickness_final', child_data['thickness_final'])
                    
                if 'length_final' in child_data and child_data['length_final'] :
                    self._push_variant(p_parent_data, 'length_final', child_data['length_final'])
                    
                if 'length' in child_data and child_data['length'] :
                    self._push_variant(p_parent_data, 'length', child_data['length'])
                    
                if 'width' in child_data and child_data['width'] :
                    self._push_variant(p_parent_data, 'width', child_data['width'])
                    
                if 'total_weight' in child_data and child_data['total_weight'] :
                    self._push_variant(p_parent_data, 'total_weight', child_data['total_weight'])
                    
                if 'square_feet__box_square_feet' in child_data and child_data['square_feet__box_square_feet'] :
                    self._push_variant(p_parent_data, 'square_feet__box_square_feet', child_data['square_feet__box_square_feet'])

        return min_price

    
    def _add_variants(self, p_product_list, p_child_dict):
        for row in p_product_list :
            row['has_variants'] = 0
            min_price = 0
            children_data_list = []
            if row["uniqueId"] not in p_child_dict:
                continue
                
            row['has_variants'] = 1
            children_data_list = p_child_dict[row["uniqueId"]]
            
            #if there is only one variant, treat it as a single product(Client's request)
            if len(children_data_list) == 1 :
                row['uniqueId'] = children_data_list[0]['uniqueId']
                row['price'] = children_data_list[0]['price']
                row['has_variants'] = 0
                continue
                
            min_price = self._get_variant_data(children_data_list, row)
            row['price'] = min_price if min_price > 0 else row['price']
            
            
    def _get_range(self, p_val, p_bracket):
        range = 'Random'
        
        for bracket in p_bracket :
            val = p_val.strip().rstrip('"')
            try :
                if float(val) < bracket['threshold'] :
                    range = bracket['range']
                    break
            except Exception:
                continue

        return range
    
    
    def __parse__(self):

        input_data = self._get_raw_feed()
        #input_file = self._get_remote_file('feed.csv');

        reviews_data = self._get_reviews()
        
        child_items = {}
        spcl_parents_dict = {}

        unbxd_array = []
        for item_id,row in input_data.iteritems():
            products = {}
            products['is_sample_available'] = 'Please Call'
            products['is_discontinued'] = "No"
            products['unbxd_availability'] = "true"
            
            if 'class' not in row :
                continue
                
            for key,value in row.iteritems():
                ckey, cvalue = self._correct_key_val(key, value)
                formatted_key = self._format_field_name(ckey)

                if formatted_key == "internal_id":
                    products['uniqueId'] = cvalue
                    products['netsuite_pid'] = cvalue
                    #add reviews to product if reviews exist
                    if cvalue in reviews_data :
                        products.update(reviews_data[cvalue])
                    else:
                        products['average_rating_display'] = '0'
                    
                elif formatted_key == "display_name":
                    products['title'] = cvalue
                        
                elif formatted_key == "pricing_2__price_online_price" :
                    products['price'] = cvalue
                    if 'original_online_price' in products and products['original_online_price'] and cvalue :
                        products['discount_percent'] = self._get_discount(products['original_online_price'], cvalue)
                        
                elif formatted_key == 'original_online_price' and cvalue :
                    products[formatted_key] = cvalue
                    if 'price' in products and products['price'] :
                        products['discount_percent'] = self._get_discount(cvalue, products['price'])
                    
                elif formatted_key == "site_category_1__site_category" and cvalue :
                    products['category_raw'] = cvalue
                        
                elif formatted_key == "discontinued" and cvalue :
                    products['is_discontinued'] = "Yes"
                    products['unbxd_availability'] = "false"
                        
                elif formatted_key == "class" :
                    #products with class "samples" are unavailable
                    if cvalue == self.sample_class :
                        products['unbxd_availability'] = "false"
                    products['category'] = []
                    products['class'] = cvalue
                    cat_list = cvalue.split(':')
                    cntr = 1
                    for i in cat_list:
                        products['category'].append(i.strip())
                        products["catlevel"+str(cntr)+"Name"] = i.strip()
                        cntr += 1
                        
                elif formatted_key == "categorypreferred" :
                    products[formatted_key] = cvalue
                    products['categorypreferredlist'] = cvalue.split(' > ')
                    products['categorypreferredlist'].pop(0)
                        
                elif formatted_key == "thickness_mm" :
                    if cvalue:                    
                        products[formatted_key] = cvalue.rstrip('mm') + 'mm'
                        products['thickness_final'] = [cvalue.rstrip('mm') + 'mm']
                    
                elif formatted_key == "thicknessheight" :
                    if cvalue:
                        products[formatted_key] = cvalue.rstrip('"') + '"'
                        products['thickness_final'] = [cvalue.rstrip('"') + '"']
                    
                elif formatted_key == "width" :
                    if cvalue :
                        products[formatted_key] = cvalue.rstrip('"') + '"'
                        products[formatted_key] = products[formatted_key].split('|')
                        products[formatted_key] = map(lambda x : \
                            self._get_range(x, self.width_brackets), products[formatted_key])
                        products['width_final'] = [cvalue.rstrip('"') + '"']
                    
                elif formatted_key == "width_mm" :
                    if cvalue:
                        products[formatted_key] = cvalue.rstrip('mm') + 'mm'
                        
                #this is overriden below, in case of faux matrix child items
                elif formatted_key == "real_url_component" :
                    products['productUrl'] = cvalue
                    
                elif formatted_key == "vendor_item" :
                    products['sku'] = cvalue
                    
                elif formatted_key == 'sm_image_0' and cvalue :
                    products['imageUrl'] = self.image_cdn_url + cvalue
                    
                elif formatted_key == 'sm_image_1' and cvalue :
                    products['imageUrlAlt1'] = self.image_cdn_url + cvalue
                    if 'imageUrl' not in products :
                        products['imageUrl'] = products['imageUrlAlt1']
                    
                elif formatted_key == 'sample_id' and cvalue:
                    products['sample_id'] = cvalue
                    products['is_sample_available'] = 'Available'
                    products['shop_by'] = products['shop_by'] + ['Sample Available'] \
                        if 'shop_by' in products else ['Sample Available']
                    
                elif formatted_key == 'grade_installation' and cvalue :
                    products['grade_installation'] = map(lambda x: x.title() + ' Grade', cvalue) \
                            if isinstance(cvalue, list) else str(cvalue) + ' Grade'
                    
                elif formatted_key == 'strips__plank_strips__plank' and cvalue :
                    products['strips_per_plank'] = map(lambda x: x + '-strip', cvalue)
                    
                elif formatted_key == 'parent' and cvalue :
                    products[formatted_key] = cvalue
                    products['parent_internal_id_final'] = cvalue
                    
                elif formatted_key == 'fauxparent_internal_id' and cvalue :
                    products[formatted_key] = cvalue
                    products['parent_internal_id_final'] = cvalue
                    
                elif formatted_key == 'shade_1_light__7_dark' and cvalue :
                    products[formatted_key] = cvalue
                    cvalue = cvalue.strip()
                    if float(cvalue) <= 2 :
                        products['shade'] = 'Light'
                    elif float(cvalue) > 2 and float(cvalue) <= 5 :
                        products['shade'] = 'Medium'
                    elif float(cvalue) > 5 :
                        products['shade'] = 'Dark'
                        
                elif formatted_key == 'janka_hardness_rating' and cvalue :
                    products[formatted_key] = cvalue
                    try:
                        cvalue = float(cvalue.strip())
                    except Exception:
                        continue
                    if float(cvalue) <= 1500 :
                        products['hardness'] = 'Soft'
                    elif float(cvalue) > 1500 and float(cvalue) <= 3000 :
                        products['hardness'] = 'Medium'
                    elif float(cvalue) > 3000 and float(cvalue) <= 4500 :
                        products['hardness'] = 'Hard'
                    elif float(cvalue) > 4500 :
                        products['hardness'] = 'Extremely Hard'
                        
                elif formatted_key == 'material' and cvalue :
                    products['material_raw'] = cvalue if isinstance(cvalue, list) else [cvalue]
                    products[formatted_key] = cvalue
                    
                elif formatted_key == 'installation' and cvalue:
                    products[formatted_key] = cvalue if isinstance(cvalue, list) else [cvalue]
                    
                elif formatted_key == 'surface_treatment' :
                    products[formatted_key] = cvalue if isinstance(cvalue, list) else [cvalue]
                    
                elif formatted_key == 'surface_texture' :
                    products[formatted_key] = cvalue if isinstance(cvalue, list) else [cvalue]
                    
                elif formatted_key == 'finish' :
                    cvalue = cvalue if isinstance(cvalue, list) else [cvalue]
                    for index, val in enumerate(cvalue):
                        if val == None :
                            cvalue.pop(index)
                        val = str(val)
                        
                    products[formatted_key] = cvalue if isinstance(cvalue, list) else [cvalue]

                elif formatted_key == 'edge' :
                    products[formatted_key] = cvalue if isinstance(cvalue, list) else [cvalue]
                    
                elif formatted_key == 'free_shipping__must_change_in_ship_item' :
                    products[formatted_key] = 1 if cvalue == True else 0
                    if cvalue :
                        products['free_shipping'] = 'Yes'
                        products['shop_by'] = products['shop_by'] + ['Free Shipping'] \
                            if 'shop_by' in products else ['Free Shipping']
                    else :
                        products['free_shipping'] = 'No'
                        
                elif formatted_key == 'length' :
                    if cvalue :
                        products[formatted_key] = cvalue.rstrip('"') + '"'
                        products[formatted_key] = products[formatted_key].split('|')
                        products[formatted_key] = map(lambda x : \
                            self._get_range(x, self.length_brackets), products[formatted_key])
                        products['length_final'] = [cvalue.rstrip('"') + '"']
                    
                elif formatted_key == 'length_mm' :
                    if cvalue :
                        products[formatted_key] = cvalue.rstrip('mm') + 'mm'
                    
                elif formatted_key == 'best_seller' :
                    products[formatted_key] = 'Yes' if cvalue else 'No'
                    if cvalue :
                        products['shop_by'] = products['shop_by'] + ['Best Seller'] \
                            if 'shop_by' in products else ['Best Seller']
                    
                elif formatted_key == 'on_sale' :
                    products[formatted_key] = 'Yes' if cvalue else 'No'
                    if cvalue :
                        products['shop_by'] = products['shop_by'] + ['On Sale'] \
                            if 'shop_by' in products else ['On Sale']
                    
                elif formatted_key == 'new_item' :
                    products[formatted_key] = 'Yes' if cvalue else 'No'
                    if cvalue :
                        products['shop_by'] = products['shop_by'] + ['New Item'] \
                            if 'shop_by' in products else ['New Item']
                            
                elif formatted_key == 'outlet_item' :
                    if cvalue :
                        products['shop_by'] = products['shop_by'] + ['Outlet Item'] \
                            if 'shop_by' in products else ['Outlet Item']
                    
                elif formatted_key in ['energy_factor', 'tufts_per_sq_in', 'max_btuh', 'gpm_max'] :
                    products[formatted_key] = str(cvalue)
                    
                elif formatted_key == 'chemically_sensitive_safe' :
                    if cvalue :
                        products['eco_features'] = products['eco_features'] + ['Chemically Sensitive Safe'] \
                            if 'eco_features' in products else ['Chemically Sensitive Safe']
                            
                elif formatted_key == 'radiant_heat_generally_possible' :
                    if cvalue :
                        products['eco_features'] = products['eco_features'] + ['OK Over Radiant Heat'] \
                            if 'eco_features' in products else ['OK Over Radiant Heat']
                            
                elif formatted_key == 'custitemcolorrenderingindex' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' CRI'
                        
                elif formatted_key == 'custitemdeliveredlumens' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' Lumens'
                        
                elif formatted_key == 'custitemcolortemperature' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' K'
                        
                elif formatted_key == 'custitemequivalentwattage' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' W'
                        
                elif formatted_key == 'custiteminputwattage' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' W'
                        
                elif formatted_key == 'custitemlifehrs' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' Hours'
                        
                elif formatted_key == 'custitemefficacy' :
                    if cvalue :
                        products[formatted_key] = str(cvalue) + ' Lumens/Watt'
                        
                elif formatted_key == 'fsccertified_content' :
                    if cvalue :
                        products[formatted_key] = str(cvalue).rstrip('%') + '%'
                        
                elif formatted_key == 'custitemenergysavings' :
                    if cvalue :
                        products[formatted_key] = str(cvalue).rstrip('%') + '%'
                        
                elif formatted_key == 'eco_replacement_for' or \
                    formatted_key == 'leed_qualifications_new' or \
                    formatted_key == 'application_method' or \
                    formatted_key == 'web_collection_store' or \
                    formatted_key == 'recycling_or_disposal' or \
                    formatted_key == 'room_recommendation' or \
                    formatted_key == 'certifications' or \
                    formatted_key == 'fsc_certifications' or \
                    formatted_key == 'ingredients' or \
                    formatted_key == 'finish_sheen' or \
                    formatted_key == 'storage' or \
                    formatted_key == 'interior_or_exterior' or \
                    formatted_key == 'custitemfinishfacet' or \
                    formatted_key == 'bamboo_construction' or \
                    formatted_key == 'grading' or \
                    formatted_key == 'cleans_up_with' or \
                    formatted_key == 'radiant_heat' or \
                    formatted_key == 'finish_type' or \
                    formatted_key == 'use_on_material__condition' or \
                    formatted_key == 'square_feet__box_square_feet' or \
                    formatted_key == 'coverage' or \
                    formatted_key == 'total_weight' or \
                    formatted_key == 'base':
                    products[formatted_key] = cvalue if isinstance(cvalue, list) else [cvalue]
                    
                elif formatted_key == 'lin_feet_per_pallet_lin_feetu00a0' or \
                    formatted_key == 'rolls_per_pallet_rollsu00a0' or \
                    formatted_key == 'lin_feet_per_bundle_lin_feetu00a0' or \
                    formatted_key == 'tiles_per_bundle_tilesu00a0' or \
                    formatted_key == 'bundles_per_pallet_bundlesu00a0' or \
                    formatted_key == 'lbs_per_pallet_poundsu00a0' or \
                    formatted_key == 'lbs_per_roll_poundsu00a0' or \
                    formatted_key == 'squares_per_roll_squaresu00a0' or \
                    formatted_key == 'lbs_per_bundle_pounds' or \
                    formatted_key == 'lbs_per_square_712_exposure_poundsu00a0' or \
                    formatted_key == 'lbs_per_square_7_exposure_poundsu00a0' or \
                    formatted_key == 'lbs_per_square_6_exposure_poundsu00a0' or \
                    formatted_key == 'lbs_per_square_8_exposure_poundsu00a0' or \
                    formatted_key == 'tiles_per_lin_foot_tilesu00a0' :
                    continue
                        
                elif formatted_key == 'resistance_to_insect_pests' or \
                    formatted_key == 'coordinating_border' or \
                    formatted_key == 'moth_resistance' or \
                    formatted_key == 'static' :
                    products[formatted_key] = str(cvalue)
                    
                else:
                    if isinstance(cvalue, bool):
                        cvalue = 1 if cvalue == True else 0
                    products[formatted_key] = cvalue
                    
            #client's hack to fetch product urls for child items due to bad data
            if 'fauxmatrix_type' in products and products['fauxmatrix_type'] in ['FauxChild', 'MixedChild'] \
            and 'fauxchild_url_component' in products and products['fauxchild_url_component'] :
                products['productUrl'] = str(products['fauxchild_url_component'])
                
            elif 'is_matrix_child' in products and products['is_matrix_child'] \
            and 'matrix_child_url_component' in products and products['matrix_child_url_component'] :
                products['productUrl'] = str(products['matrix_child_url_component'])
                    
            #if product is a child item (i.e. it's parent property is truthy), add to child items dictionary
            if 'parent_internal_id_final' in products and products['catlevel1Name'] not in self.special_variant_category_list:
                self._handle_child_items(products, child_items)
            else:
                unbxd_array.append(products)

            if 'parent_internal_id_final' in products and products['catlevel1Name'] in self.special_variant_category_list:
                #add reviews to product if reviews exist
                if products['parent_internal_id_final'] in reviews_data :
                    products.update(reviews_data[products['parent_internal_id_final']])
                spcl_parents_dict[products['parent_internal_id_final']] = 1

        self._add_variants(unbxd_array, child_items)

        self._remove_parents(unbxd_array, spcl_parents_dict)

        unbxd_array = self.__addingCustomPrice__(unbxd_array)

        return unbxd_array


class GBS_Main(UNBXD_MAIN):
    def __init__(self):
        UNBXD_MAIN.__init__(self)
        self.UNBXD_API_KEY = 'f48559aa04886d683e2f2c82976fc908'
        self.UNBXD_SITEKEY = 'greenbuildingsupply_com-u1465975266578'
        self.UNBXD_UNIQUE_ID_FIELD = "uniqueId"
        self.FIELD_SCHEMA_MAPPING = {
            "material" :{
                "fieldName" : "material",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "web_collection_store" :{
                "fieldName" : "web_collection_store",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "finish_sheen" :{
                "fieldName" : "finish_sheen",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "template_type" :{
                "fieldName" : "template_type",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "room_recommendation" :{
                "fieldName" : "room_recommendation",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "manufacturer" :{
                "fieldName" : "manufacturer",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "installation" :{
                "fieldName" : "installation",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "certifications" :{
                "fieldName" : "certifications",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "construction" :{
                "fieldName" : "construction",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "surface_texture" :{
                "fieldName" : "surface_texture",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "surface_treatment" :{
                "fieldName" : "surface_treatment",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "average_rating_display" :{
                "fieldName" : "average_rating_display",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "average_rating_display_numeric" :{
                "fieldName" : "average_rating_display_numeric",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "finish" :{
                "fieldName" : "finish",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "base" :{
                "fieldName" : "base",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "edge" :{
                "fieldName" : "edge",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "strips_per_plank" :{
                "fieldName" : "strips_per_plank",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "unbxd_availability" :{
                "fieldName" : "unbxd_availability",
                "dataType" : "bool",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "unbxd_rating" :{
                "fieldName" : "unbxd_rating",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "price_variants" :{
                "fieldName" : "price_variants",
                "dataType" : "decimal",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            "mfg_advertised_price_map" :{
                "fieldName" : "mfg_advertised_price_map",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "available" :{
                "fieldName" : "available",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "markup" :{
                "fieldName" : "markup",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "mfg_suggested_retail_price_msrp" :{
                "fieldName" : "mfg_suggested_retail_price_msrp",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "purchase_price" :{
                "fieldName" : "purchase_price",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "categorypreferredlist" :{
                "fieldName" : "categorypreferredlist",
                "dataType" : "text",
                "multiValue": "true",
                "autoSuggest": "false"
            },
            'lin_feet_per_bundle_lin_feet' :{
                "fieldName" : "lin_feet_per_bundle_lin_feet",
                "dataType" : "decimal",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            'resistance_to_insect_pests' :{
                "fieldName" : "resistance_to_insect_pests",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            'coordinating_border' :{
                "fieldName" : "coordinating_border",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            'moth_resistance' :{
                "fieldName" : "moth_resistance",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            'static' :{
                "fieldName" : "static",
                "dataType" : "text",
                "multiValue": "false",
                "autoSuggest": "false"
            },
            'netsuite_pid' :{
                "fieldName" : "netsuite_pid",
                "dataType" : "sku",
                "multiValue": "false",
                "autoSuggest": "false"
            }
        }
        
        self.GLOBAL_CONFIG = {  
            # Possible Values are info/debug/error
            # Provide full path of logfile
            # "mailer":  "dl-monitor@unbxd.com", # sample value is "user@unbxd.com,user2@unbxd.com,user3@unbxd.com"
            # If empty i.e. ""  then it saves in the same directory as script
            'verbosity': 'debug',
            # 'log': '../greenbuildingsupply/feedconverter.log',
            # 'mailer': '',
            # 'folder': '../greenbuildingsupply/'
        }

    def Start(self):
        self.__main__()
        GBS_Unbxd_Feed_Generator(self.path).Run()
        Unbxd_Feed_Uploader(self.path, self.API).Run()

GBS_Main().Start()
