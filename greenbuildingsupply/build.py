import sys

sys.path.append('../conversion')

from conversion import Unbxd_Feed_Generator, Unbxd_Feed_Uploader, UNBXD_MAIN

import csv
import paramiko

class GBS_Unbxd_Feed_Generator(Unbxd_Feed_Generator):
    image_cdn_url = '//res.cloudinary.com/greenbuildingsupply/image/upload/f_auto,t_small/small/'
    
    special_variant_category = 'Flooring'
    sample_class = 'Samples'
    
    #gets files from sftp location
    def _get_remote_file(self, p_file_name):
        #download file from FTP: sftp.unbxdapi.com
        host = 'sftp.unbxdapi.com'
        port = 22
        transport = paramiko.Transport((host, port))
        
        username = 'greenbuildingsupply'
        password = 'gbs#)06!^'
        
        transport.connect(username = username, password = password)
        
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        sftp.get(p_file_name, p_file_name)
        sftp.close()
        transport.close()
        
        input_file = csv.DictReader(open(p_file_name))
        
        return input_file
    
    
    def _get_raw_feed(self):
        input_files = []
        input_data = {}
        input_files.append(csv.DictReader(open("/Users/anuj/Downloads/GBS1.csv")))
        input_files.append(csv.DictReader(open("/Users/anuj/Downloads/GBS2.csv")))
        input_files.append(csv.DictReader(open("/Users/anuj/Downloads/GBS3.csv")))
        input_files.append(csv.DictReader(open("/Users/anuj/Downloads/GBS4.csv")))
        input_files.append(csv.DictReader(open("/Users/anuj/Downloads/GBS5.csv")))
        
        for input_file in input_files :
            for row in input_file :
                if 'Internal ID' not in row or row['Internal ID'] is None :
                    continue
                    
                if row['Internal ID'] not in input_data :
                    input_data[row['Internal ID']] = row
                else :
                    input_data[row['Internal ID']].update(row)
                    
        return input_data
    
    
    def _get_reviews(self):
        reviews_file = self._get_remote_file('reviews.csv')
        
        reviews_data = {}
        for row in reviews_file :
            temp_dict = {}
            for key, val in row.iteritems() :
                formatted_key = self._format_field_name(key)
                val = val.strip()
                if formatted_key == 'page_id' :
                    reviews_data[val] = temp_dict
                elif formatted_key == 'product_name' :
                    pass
                elif formatted_key == 'submitted_reviews' and val:
                    temp_dict[formatted_key] = val
                    temp_dict['submitted_reviews_str'] = val + ' reviews' \
                                            if int(val) > 1 else val+' review'
                elif formatted_key == 'average_rating' and val:
                    temp_dict['average_rating'] = float(val)
                    decimal_part = float(val) % 1;
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
                    
        return reviews_data


    def _format_field_name(self, p_field_name):
        formatted_name = ''.join(temp for temp in p_field_name if temp.isalnum() or temp == ' ')
        formatted_name = formatted_name.strip().replace(' ', '_').lower()
        return formatted_name
    
    
    def _get_discount(self, pPrice, pSellPrice):
        savedAmt = float(pPrice) - float(pSellPrice);
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
            p_parent_data[p_field] = [p_val]
        else :
            p_parent_data[p_field].append(p_val)
                
    
    def _get_variant_data(self, p_children_data, p_parent_data):
        min_price = 0;
        for child_data in p_children_data :
            try :
                min_price = child_data['price'] \
                if min_price == 0 or float(child_data['price']) < float(min_price) else min_price
            except Exception :
                pass
            
            if 'faux_option_name' in child_data and child_data['faux_option_name'] :
                self._push_variant(p_parent_data, 'faux_option_name_variants', child_data['faux_option_name'])
            
            if 'price' in child_data and child_data['price'] :
                self._push_variant(p_parent_data, 'price_variants', child_data['price'])

            if 'imageUrl' in child_data and child_data['imageUrl'] :
                self._push_variant(p_parent_data, 'image_url_variants', child_data['imageUrl'])

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
            min_price = self._get_variant_data(children_data_list, row)
            row['price'] = min_price if min_price > 0 else row['price']
    
    
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
            
            for key,value in row.iteritems():
                formatted_key = self._format_field_name(key)

                if formatted_key == "internal_id":
                    products['uniqueId'] = value
                    #add reviews to product if reviews exist
                    if value in reviews_data :
                        products.update(reviews_data[value])
                    
                elif formatted_key == "display_name":
                    products['title'] = value
                        
                elif formatted_key == "pricing_2__price_online_price" :
                    products['price'] = value
                    if 'original_online_price' in products and products['original_online_price'] :
                        products['discount_percent'] = self._get_discount(products['original_online_price'], value)
                        
                elif formatted_key == 'original_online_price' and value :
                    products[formatted_key] = value
                    if 'price' in products :
                        products['discount_percent'] = self._get_discount(value, products['price'])
                    
                elif formatted_key == "site_category_1__site_category" and value :
                    products['category_raw'] = value
                        
                elif formatted_key == "discontinued" and value == "Yes" :
                    products['is_discontinued'] = "Yes"
                    products['unbxd_availability'] = "false"
                        
                elif formatted_key == "class" :
                    #products with class "samples" are unavailable
                    if value == self.sample_class :
                        products['unbxd_availability'] = "false"
                    products['category'] = []
                    products['class'] = value
                    cat_list = value.split(':')
                    cntr = 1
                    for i in cat_list:
                        products['category'].append(i.strip())
                        products["catlevel"+str(cntr)+"Name"] = i.strip()
                        cntr += 1
                        
                elif formatted_key == "thickness_mm" :
                    products[formatted_key] = value
                    products['thickness_final'] = value + 'mm'
                    
                elif formatted_key == "thicknessheight" :
                    products[formatted_key] = value
                    products['thickness_final'] = value
                    
                elif formatted_key == "width" :
                    products[formatted_key] = value
                    products['width_final'] = value
                        
                #this is overriden below, in case of faux matrix child items
                elif formatted_key == "real_url_component" :
                    products['productUrl'] = value
                    
                elif formatted_key == "vendor_item" :
                    products['sku'] = value
                    
                elif formatted_key == 'sm_image_0' and value :
                    products['imageUrl'] = self.image_cdn_url + value
                    
                elif formatted_key == 'sm_image_1' and value :
                    products['imageUrlAlt1'] = self.image_cdn_url + value
                    if 'imageUrl' not in products :
                        products['imageUrl'] = products['imageUrlAlt1']
                    
                elif formatted_key == 'custom_sample_id' and value:
                    products['custom_sample_id'] = value
                    products['is_sample_available'] = 'Available'
                    
                elif formatted_key == 'grade_installation' and value :
                    products['grade_installation'] = map(lambda x: x.title() + ' Grade', value.split(','))
                    
                elif formatted_key == 'strips__plank_strips__plank' and value :
                    products['strips_per_plank'] = map(lambda x: x + '-strip', value.split(','))
                    
                elif formatted_key == 'parent_internal_id' and value :
                    products[formatted_key] = value
                    products['parent_internal_id_final'] = value
                    
                elif formatted_key == 'fauxparent_internal_id' and value :
                    products[formatted_key] = value
                    products['parent_internal_id_final'] = value
                    
                elif formatted_key == 'shade_1_light__7_dark' and value :
                    products[formatted_key] = value
                    value = value.strip()
                    if float(value) <= 2 :
                        products['shade'] = 'Light'
                    elif float(value) > 2 and float(value) <= 5 :
                        products['shade'] = 'Medium'
                    elif float(value) > 5 :
                        products['shade'] = 'Dark'
                        
                elif formatted_key == 'janka_hardness_rating' and value :
                    products[formatted_key] = value
                    try:
                        value = float(value.strip())
                    except Exception:
                        continue
                    if float(value) <= 1500 :
                        products['hardness'] = 'Soft'
                    elif float(value) > 1500 and float(value) <= 3000 :
                        products['hardness'] = 'Medium'
                    elif float(value) > 3000 and float(value) <= 4500 :
                        products['hardness'] = 'Hard'
                    elif float(value) > 4500 :
                        products['hardness'] = 'Extremely Hard'
                        
                elif formatted_key == 'material' and value :
                    products['material_raw'] = value
                    value = value.split(',')
                    products[formatted_key] = value
                    
                elif formatted_key == 'installation' and value:
                    products['installation_raw'] = value
                    value = value.split(',')
                    products[formatted_key] = map(lambda x: x.strip(), value)
                    
                elif formatted_key == 'surface_treatment' :
                    value = value.split(',')
                    products[formatted_key] = map(lambda x: x.strip(), value)
                    
                elif formatted_key == 'surface_texture' :
                    value = value.split(',')
                    products[formatted_key] = map(lambda x: x.strip(), value)
                    
                elif formatted_key == 'finish' :
                    value = value.split(',')
                    products[formatted_key] = map(lambda x: x.strip(), value)

                elif formatted_key == 'edge' :
                    value = value.split(',')
                    products[formatted_key] = map(lambda x: x.strip(), value)
                    
                elif formatted_key == 'free_shipping__must_change_in_ship_item' :
                    if value == 'Yes' :
                        products['free_shipping'] = 'Yes'
                    else :
                        products['free_shipping'] = 'No'

                else:
                    products[formatted_key] = value
                    
            #client's hack for child items due to bad data
            if 'fauxmatrix_type' in products and products['fauxmatrix_type'] in ['FauxChild', 'MixedChild'] \
            and 'fauxchild_url_component' in products and products['fauxchild_url_component'] :
                products['productUrl'] = products['fauxchild_url_component']
            elif 'is_matrix_child' in products and products['is_matrix_child'] == "Yes" \
            and 'matrix_child_url_component' in products and products['matrix_child_url_component'] :
                products['productUrl'] = products['matrix_child_url_component']
                    
            #if product is a child item (i.e. it's parent property is truthy), add to child items dictionary
            if 'parent_internal_id_final' in products and products['catlevel1Name'] != self.special_variant_category:
                self._handle_child_items(products, child_items)
            else:
                unbxd_array.append(products)

            if 'parent_internal_id_final' in products and products['catlevel1Name'] == self.special_variant_category:
                spcl_parents_dict[products['parent_internal_id_final']] = 1

        self._add_variants(unbxd_array, child_items)

        self._remove_parents(unbxd_array, spcl_parents_dict);

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
                "multiValue": "false",
                "autoSuggest": "false"
            },
            "finish_sheen" :{
                "fieldName" : "finish_sheen",
                "dataType" : "text",
                "multiValue": "false",
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
                "multiValue": "false",
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
                "multiValue": "false",
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
                "multiValue": "false",
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
            }
        };
        
        self.GLOBAL_CONFIG = {  
            # Possible Values are info/debug/error
            # Provide full path of logfile
            # "mailer":  "dl-monitor@unbxd.com", # sample value is "user@unbxd.com,user2@unbxd.com,user3@unbxd.com"
            # If empty i.e. ""  then it saves in the same directory as script
            'verbosity': 'debug',
            'log': '../greenbuildingsupply/feedconverter.log',
            'mailer': '',
            'folder': '../greenbuildingsupply/'
        }

    def Start(self):
        self.__main__()
        GBS_Unbxd_Feed_Generator(self.path).Run()
        Unbxd_Feed_Uploader(self.path, self.API).Run()

GBS_Main().Start()
