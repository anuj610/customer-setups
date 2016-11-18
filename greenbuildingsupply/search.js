(function($) {

    var relative_url = window.location.origin;
    var relative_search_url = relative_url + window.location.pathname;

    //function for all event handlers
    var eventHandlers = function() {};

    var eh = new eventHandlers();

    //copy eventHandlers.prototype to another variable
    var eventActions = eventHandlers.prototype;

    var UnbxdSiteName = "greenbuildingsupply_com-u1465975266578"
    , UnbxdApiKey = "f48559aa04886d683e2f2c82976fc908"
    , searchObjDesktop = {}
    , facetDisplayState = {}
    , defaultProdImg
    , facet_threshold = 8
    , unbxd_min = 0
    , unbxd_max = 0
    , slider_min = 0
    , slider_max = 0;

    //on DOMContentLoaded
    $(document).ready(initLoadSetup);

    //for initialization before dom load
    initPreLoadSetup();

    //fired as soon as js is loaded
    function initPreLoadSetup() {
        configureSearchObj();
    }

    //fired after dom ready
    function initLoadSetup() {
        initialize();
        registerHandlebarHelpers();
        bindEvents();
    }

    //get page ready on initial load
    var initialize = function() {
        var unbxd_html = '';

        unbxd_html += [
            '<div class="did-you-mean"></div>'
            , '<div class="unbxd-search-head">'
            , '<div class="title-wrapper">'
            , '<span class="unbxd-searchval"></span>'
            , '<span class="unbxd-total"></span>'
            , '</div><!-- title-wrapper ends -->'
            , '<div class="utility-wrapper1">'
            , '<div class="unbxd-sort-by"></div>'
            , '<div class="unbxd-view-type"></div>'
            , '</div><!-- .utility-wrapper1 ends -->'
            , '</div><!-- .unbxd-search-head ends -->'
            , '<div class="unbxd-results-container">'
            , '<div class="unbxd-filters"></div>'
            , '<div class="unbxd-products-list-container">'
            , '<div class="unbxd-selected-facets"></div>'
            , '<div class="unbxd-products-list"></div>'
            , '<div class="unbxd_pagination_contanier"></div>'
            , '</div> <!-- unbxd-products-list-container ends -->'
            , '</div> <!-- unbxd-results-container ends -->'
            , '<div class="unbxd-loader-container">'
            , '<div class="unbxd-loader-overlay">'
            , '<div class="unbxd-loader">'
            , '</div>'
            , '</div>'
            , '</div>'
        ].join('');

        $('#unbxd-main').html(unbxd_html);

        window.searchobj = new Unbxd.setSearch(searchObjDesktop);
    };

    //bind all events for the page
    var bindEvents = function() {
        $('#unbxd-main').on('click', '.facet-title', eh.toggleFacetwiseDisplay);

        $('#unbxd-main').on('mouseover', '.variant-item', eh.changeProdThumbnail);

        //$('#unbxd-main').on('click', '.prod-thumb', eh.getView);

        $('#unbxd-main').on('mouseover', '.unbxd_cell-inner', eh.changeImg);

        $('#unbxd-main').on('mouseout', '.unbxd_cell-inner', eh.reverseImg);

        $('#unbxd-main').on('keypress', '.unbxd_price_input_box', eh.onsimpleEnter);

        $('#unbxd-main').on('click', '.unbxd-price-button', eh.onPriceChange);

        $('#unbxd-main').on('click', '.facet-option', eh.onFacetClick);

        $('#unbxd-main').on('click', '.unbxd-price-spcl', eh.removePriceFltr);

        $('#unbxd-main').on('click', 'div.prod-cell', eh.addGAClick);

        $('#unbxd-main').on('click', '.text_facets li.show_more.unbxd-less', eh.integerParse);

        $('#unbxd-main').on('click', '.text_facets li.show_more.unbxd-more', eh.alphabeticalParse);

        $('#unbxd-main').on('click', '.show_more', eh.getView);

        $('#unbxd-main').on('click', '.unbxd-remove-filter', eh.removeSelectedFilter);
    };

    eventActions.integerParse =  function(event){
        var notApplicable = ["Face_Pile_Weight_fq", "Width_fq", "Thickness_fq", "Length_fq", "FSC_Certified_Content_fq",
        "Pile_Height_High_fq", "Recommended_No_of_Coats_fq", "Stitches_Per_Inch_fq", "Color_Rendering_Index_fq",
        "Color_Temperature_fq", "Delivered_Lumens_fq", "Input_Wattage_fq", "Equivalent_Wattage_fq", "Life_fq",
        "Recycled_Content_fq", "Strips_per_Plank_fq", "Efficacy_fq", "Energy_Savings_fq",
         "Warranty_fq", "Customer_Ratings_fq", "Shade_fq"]
        if(notApplicable.indexOf(jQuery(jQuery(this).parent()).attr("unbxdparam_facetname")) < 0){
            $(jQuery(this).siblings().andSelf()).sort(sort_li).appendTo(jQuery(this).parent());
        	function sort_li(a, b){
        		var _a = jQuery(a).find("input");
        		var _b = jQuery(b).find("input");
        	    return (parseInt(jQuery(_a).attr("unbxdparam_facetcount"))) < (parseInt(jQuery(_b).attr("unbxdparam_facetcount"))) ? 1 : -1;
        	}
        }
    };

    eventActions.alphabeticalParse = function(event){
        var notApplicable = ["Face_Pile_Weight_fq", "Width_fq", "Thickness_fq", "Length_fq", "FSC_Certified_Content_fq",
        "Pile_Height_High_fq", "Recommended_No_of_Coats_fq", "Stitches_Per_Inch_fq", "Color_Rendering_Index_fq",
        "Color_Temperature_fq", "Delivered_Lumens_fq", "Input_Wattage_fq", "Equivalent_Wattage_fq", "Life_fq",
        "Recycled_Content_fq", "Strips_per_Plank_fq", "Efficacy_fq", "Energy_Savings_fq",
         "Warranty_fq", "Customer_Ratings_fq", "Shade_fq"]
        if(notApplicable.indexOf(jQuery(jQuery(this).parent()).attr("unbxdparam_facetname")) < 0){
            $(jQuery(this).siblings().andSelf()).sort(sort_li).appendTo(jQuery(this).parent());
        	function sort_li(a, b){
        		var _a = jQuery(a).find("input");
        		var _b = jQuery(b).find("input");
        	    return (jQuery(_a).attr("unbxdParam_facetValue")) > (jQuery(_b).attr("unbxdParam_facetValue")) ? 1 : -1;
        	}
        }
    };

    eventActions.addGAClick = function(event){
        var _this = $(this);
        if( $(event.target).hasClass('unbxd_add_to_cart_button') ) {
            ga("ec:addProduct", {
                'name': $(_this).attr("unbxdparam_title"),
                'id': jQuery(_this).attr("unbxdparam_sku"),
                'price': jQuery(_this).attr("unbxdparam_price"),
                'brand': jQuery(_this).attr("unbxdparam_brand"),
                'category': jQuery(_this).attr("unbxdparam_category"),
                // 'variant': productObj.variant,
                'position': jQuery(_this).attr("unbxdparam_prank"),
                'quantity': 1
            });
            ga("ec:setAction", "add");
            ga("send", "event", "detail view", "click", "addToCart");
        }
        else if( $(event.target).hasClass('unbxd_add_sample') ) {
            if( $(event.target).attr('sampleid') && $(event.target).attr('sampleprice') ) {
                ga("ec:addProduct", {
                    'name': $(_this).attr("unbxdparam_title"),
                    'id': $(event.target).attr('sampleid'),
                    'price': $(event.target).attr('sampleprice'),
                    'brand': $(_this).attr("unbxdparam_brand"),
                    'category': $(_this).attr("unbxdparam_category"),
                    // 'variant': productObj.variant,
                    'position': $(_this).attr("unbxdparam_prank"),
                    'quantity': 1
                });
                ga("ec:setAction", "add");
                ga("send", "event", "detail view", "click", "addToCart");
            }
        }
        else{
            ga('ec:addProduct', {
                'name': jQuery(_this).attr("unbxdparam_title"),
                'id': jQuery(_this).attr("unbxdparam_sku"),
                'price': jQuery(_this).attr("unbxdparam_price"),
                'brand': jQuery(_this).attr("unbxdparam_brand"),
                'category': jQuery(_this).attr("unbxdparam_category"),
                'position': jQuery(_this).attr("unbxdparam_prank")
            });

            ga('ec:setAction', 'click', {       // click action.
                'list': 'Search Results'          // Product list (string).
            });

            ga('send', 'event', 'UX', 'click', 'Results', {
                hitCallback: function() {
                    document.location = jQuery(_this).attr("unbxdparam_productUrl");
                }
            });
         }
    };
    eventActions.onsimpleEnter = function(event) {
        if(event.keyCode === 13) {
            priceBoxChange();
        }
    };

    eventActions.onPriceChange = function() {
        priceBoxChange();
    };

    eventActions.removePriceFltr = function() {
        //searchobj.removeRangeFilter("Price_fq", slider_min, slider_max);
    };

    var priceBoxChange = function() {
        var min = unbxd_min;
        var max = unbxd_max;

        if(parseFloat($("#unbxd_min_box").val()) !== NaN) {
            min = parseFloat($("#unbxd_min_box").val());
        }

        if(parseFloat($("#unbxd_max_box").val()) !== NaN) {
            max = parseFloat($("#unbxd_max_box").val());
        }

        searchobj.clearRangeFiltes().addRangeFilter("Price_fq", String(min), String(max));
        window.location = window.location.origin + '/?' + searchobj.url().query;
    };

    eventActions.onFacetClick = function() {
        
    };

    eventActions.toggleFacetwiseDisplay = function() {
        var facet_icon = $(this).find('.facet-icon');
        var attr = $(this).parents('.facet-container').attr('unbxdParam_facetName');

        if (facet_icon.hasClass('unbxd-collapse')) {
            $(this).parents('.facet-container').find('.facet-option-list').slideUp();
            facet_icon.removeClass('unbxd-collapse').addClass('unbxd-expand');
            //update facet state
            facetDisplayState[attr] = 0;
        } else {
            $(this).parents('.facet-container').find('.facet-option-list').slideDown();
            facet_icon.removeClass('unbxd-expand').addClass('unbxd-collapse');
            //update facet state
            facetDisplayState[attr] = 1;
        }
    };

    eventActions.changeProdThumbnail = function() {
        var variant_src = $(this).attr('src');
        var prod_thumb = $(this).parents('.unbxd_cell-inner').find('.prod-thumb');
        var main_img_src = $(this).parent().children().first().attr('src');

        if( !variant_src ) {
            return;
        }

        prod_thumb.attr('src', variant_src);

        if( variant_src != main_img_src ) {
            $(this).parents('.unbxd_cell-inner').find('.prod-thumb-sub').show();
        } else {
            $(this).parents('.unbxd_cell-inner').find('.prod-thumb-sub').hide();
        }
    };

    eventActions.scrollToTopOfSearch = function() {
        scrollToTopOfSearch();
    };

    //open/close facets based on facet state stored
    var prepareFacetDisplay = function() {
        var attr = '';
        $('.unbxd-filters .facet-container').each(function() {
            attr = $(this).attr('unbxdParam_facetName');
            if( !facetDisplayState.hasOwnProperty(attr) || facetDisplayState[attr] ) {
                $(this).find('.facet-option-list').show();
                $(this).find('.unbxd-expand').removeClass('unbxd-expand').addClass('unbxd-collapse');
            } else {
                $(this).find('.facet-option-list').hide();
                $(this).find('.unbxd-collapse').removeClass('unbxd-collapse').addClass('unbxd-expand');
            }
        });
    };

    var scrollToTopOfSearch = function() {
        $('html, body').animate({
            scrollTop: $('#unbxd-main').offset().top - 40
        }, 'slow');
    };

    eventActions.getView = function () {
        if ( $(this).hasClass('unbxd-more') ) {
            $(this).removeClass('unbxd-more');
            $(this).addClass('unbxd-less');
            //$(this).parent().css({'max-height': '210px', 'overflow': 'auto'});
            $(this).find('.unbxd-plus').html('-');
            $(this).find('.show-more-text').html('Show Less');
            $(this).css({'width': '100%'});
            var display_array = jQuery(this).siblings();
            for (i = 0; i < display_array.length; i++) {
                if ($(display_array[i]).css('display') === "none") {
                    $(display_array[i]).css('display', 'block');
                }
            }
        } else {
            $(this).removeClass('unbxd-less');
            $(this).addClass('unbxd-more');
            $(this).parent().css({'max-height': 'none', 'overflow': 'visible'});
            $(this).find('.unbxd-plus').html('+');
            $(this).find('.show-more-text').html('Show More');
            $(this).css({'width': '100%'});
            var display_array = $(this).siblings();
            for (i = facet_threshold; i < display_array.length; i++){
                $(display_array[i]).css('display', 'none');
            }
        }
    };

    eventActions.changeImg = function() {
        var imgAlt = $(this).find('.prod-link .prod-thumb-alt');

        if ( !imgAlt.size() ) {
            return;
        }

        imgAlt.addClass('over-alt');
    };

    eventActions.reverseImg = function() {
        var imgAlt = $(this).find('.prod-link .prod-thumb-alt');

        if ( !imgAlt.size() ) {
            return;
        }

        imgAlt.removeClass('over-alt');
    };
    
    eventActions.removeSelectedFilter = function() {
        var facet_name = $(this).attr('unbxdparam_facetname');
        var facet_value = $(this).attr('unbxdparam_facetvalue');
        
        if(facet_name === "Price_fq") {
            var vals = facet_value.split(' TO ');
            window.searchobj.removeRangeFilter(facet_name, vals[0], vals[1]);
        } else {
            window.searchobj.removeFilter(facet_name, facet_value);
        }
        
        window.searchobj.setPage(1);
        window.searchobj.callResults(searchobj.paintResultSet, !0);
    };

    var removePaginationIfSingular = function() {
        $('.unbxd_pagination_contanier').each(function() {
            if( $(this).find('.unbxd_page').size() <= 1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
    };

    function configureSearchObj() {
        searchObjDesktop = {
            siteName: UnbxdSiteName
            , APIKey: UnbxdApiKey
            , type: 'search'
            , deferInitRender: []
            , inputSelector: '#search2'
            , searchButtonSelector: '#srhImg'
            ,heightDiffToTriggerNextPage : 80
            , spellCheck: '.did-you-mean'
            , spellCheckTemp: 'Did you mean \'<a href = "{{{getSuggestionUrl suggestion}}}" target="_self">{{suggestion}}</a>\'?'
            , searchQueryDisplay: '.unbxd-searchval'
            , searchQueryDisplayTemp: 'Search results for: {{query}}'
            , pageSize: 45
            , sortContainerSelector: '.unbxd-sort-by'
            , isClickNScroll: false
            , isAutoScroll: false
            ,isPagination : true
            ,paginationTemp: [
                '<span class="unbxd_text">Page</span>',
                '{{#if hasPrev}}',
                    '<span class="unbxd_prev" unbxdaction="prev"></span>',
                '{{/if}}',
                '{{#pages}}',
                    '{{#if current}}',
                        '<span class="unbxd_page highlight"> {{page}} </span>',
                    '{{else}}',
                        '<span class="unbxd_page" unbxdaction="{{page}}"> {{page}} </span>',
                    '{{/if}}',
                '{{/pages}}',
                '{{#lastPageNotVisible this}}',
                '<span class="unbxd_pageof"> ... </span>',
                '<span class="unbxd_totalPages" unbxdaction="{{totalPages}}">{{totalPages}}</span>',
                '{{/lastPageNotVisible}}',
                '{{#if hasNext}}',
                    '<span class="unbxd_next" unbxdaction="next"></span>',
                '{{/if}}'
            ].join('')
            ,paginationContainerSelector : ".unbxd_pagination_contanier"
            , sortOptions: [{
                    name: 'Relevancy'
                }, {
                    name: 'Reviews',
                    field: 'unbxd_rating',
                    order: 'desc'
                }, {
                    name: 'Newest Items',
                    field: 'new_item',
                    order: 'desc'
                }, {
                    name: 'Bestselling',
                    field: 'best_seller',
                    order: 'desc'
                }, {
                    name: 'On Sale',
                    field: 'on_sale',
                    order: 'desc'
                }, {
                    name: 'Alphabetical: A-Z',
                    field: 'title',
                    order: 'asc'
                }, {
                    name: 'Alphabetical: Z-A',
                    field: 'title',
                    order: 'desc'
                }, {
                    name: 'Price: Low-High',
                    field: 'price',
                    order: 'asc'
                }, {
                    name: 'Price: High-Low',
                    field: 'price',
                    order: 'desc'
                }]
            , viewTypes: ['grid', 'list']
            , viewTypeContainerSelector: '.unbxd-view-type'
            , viewTypeContainerTemp:
                    '<span>VIEW</span>'
                    + '{{#options}}'
                    + '<a id="unbxd-{{value}}_result_layout" title="{{value}} View" class="unbxd-{{value}}_result_layout {{#if selected}}high{{else}}low{{/if}}" href="javascript:void(0)" {{#unless selected}} unbxdviewtype="{{value}}"{{/unless}} ></a>'
                    + '{{/options}}'
            , sortContainerType: 'select'
            , sortContainerTemp: [
        		'<label>SORT BY&nbsp;</label>',
                        '<select>',
                        '{{#options}}',
                        '{{#if selected}}',
        		'<option value="{{field}}-{{order}}" unbxdsortField="{{field}}" unbxdsortValue="{{order}}" selected>{{name}}</option>',
                        '{{else}}',
        		'<option value="{{field}}-{{order}}" unbxdsortField="{{field}}" unbxdsortValue="{{order}}">{{name}}</option>',
                        '{{/if}}',
                        '{{/options}}',
        		'</select>'
            ].join('')
            , searchResultSetTemp: {
                'grid': [
                        '{{#products}}',
                        '<div class="prod-cell ga-not-enabled" unbxdparam_title="{{title}}" ',
                        'unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}" ',
                        'unbxdparam_productUrl="{{productUrl}}" unbxdparam_price="{{price}}" ',
                        '{{#if class}}',
                            'unbxdparam_category="{{class}}" ',
                        '{{/if}}',
                        '{{#if manufacturer}}',
                            'unbxdparam_brand="{{manufacturer}}"',
                        '{{/if}}',
                         '>',
                        '<div class="prod-cell-inner unbxd_cell-inner">',
                        '<div class="prod-thumb-container" data-product="{{uniqueId}}">',
                        '<a href="{{productUrl}}" title="{{title}}" class="prod-link">',
                            '{{#if image_url_variants_clean}}',
                                '<img class="prod-thumb" src="{{getImageUrl this}}">',
                                '<img class="prod-thumb-sub" src="{{getImageUrl this}}">',
                            '{{else}}',
                                '{{#if imageUrlAlt1}}',
                                    '<img class="prod-thumb alternate_image" src="{{getImageUrl this}}">',
                                    '<img class="prod-thumb-alt" src="{{imageUrlAlt1}}">',
                                '{{else}}',
                                    '<img class="prod-thumb" src="{{getImageUrl this}}">',
                                    '<img class="prod-thumb-sub" src="{{getImageUrl this}}">',
                                '{{/if}}',
                            '{{/if}}',
                        '</a>',
                        '<div class="thumb-overlay {{getOverlayClass this}}">{{getOverlayText this}}</div>',
                        '</div> <!-- prod-thumb-container ends -->',
                        '{{#if image_url_variants_clean}}',
                        '<div class="variant-showcase">',
                        '<img class="variant-item" src="{{getImageUrl this}}"></img>',
                        '{{#image_url_variants_clean}}',
                        '<img class="variant-item" src="{{this}}"></img>',
                        '{{/image_url_variants_clean}}',
                        '</div>',
                        '{{/if}}',
                        '<div class="prod-name">',
                        '<a href="{{productUrl}}">{{title}}</a>',
                        '</div> <!-- prod-name ends -->',
                        '{{#has_web_collection_store web_collection_store}}<div class="collection-store">{{get_web_collection_store web_collection_store}} Collection</div>{{/has_web_collection_store}}',
                        '{{#if manufacturer}}',
                        '<div class="prod-manufacturer">by {{manufacturer}}</div>',
                        '{{/if}}',
                        '{{#if average_rating}}',
                        '<a href="{{productUrl}}" class="rating-wrapper">',
                        '<span class="unbxd-avg-rating" style="background-position: 0px {{getRatingPosition average_rating_display_numeric}}px;"></span>',
                        '{{#if submitted_reviews_str}}<span class="review-link">({{submitted_reviews_str}})<span>{{/if}}',
                        '</a><!-- .rating-wrapper ends -->',
                        '{{/if}}',
                        '<div class="prod-price-wrapper">',
                        '{{#if nonCustomPrice}}',
                            '<span class="prod-price">{{nopricemessage}}</span>',
                        '{{else}}',
                            '<span class="prod-price">{{getPrice price}}</span>',
                            '{{#checkSaleUnits sale_units price}}<span class="sale-units"> / {{sale_units}}</span>{{/checkSaleUnits}}',
                            '{{#if discount_percent}}',
                            '<div class="discount-details">',
                            'was <span class="original-price">${{original_online_price}}</span><span class="discount-perc"> Save {{discount_percent}}%</span>',
                            '</div>',
                            '{{/if}}',
                        '{{/if}}',
                        '</div> <!-- prod-price-wrapper ends -->',
                        '{{#isShippingFree this}}',
                        '<div class="shipping-info">Free Shipping</div>',
                        '{{#if free_shipping_text}}<div class="shipping-info-text">({{decodeHtml free_shipping_text}})</div>{{/if}}',
                        '{{/isShippingFree}}',
                        '{{#if short_item_description}}<div class="short-desc">{{short_item_description}}</div>{{/if}}',
                        '{{getProdFeatures this}}',
                        '<ul class="unbxd-custom-list">',
                        '{{#customfeatures}}',
                        '<li class="custom-feature">{{{value}}}</li>',
                        '{{/customfeatures}}',
                        '</ul>',

                        '<div class="add-sample-wrapper">',
                            '{{#unless has_variants}}',
                                '<div class="unbxd_add_to_cart">',
                                    '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                    'additemtocart.nl?c=772072&n=1&qty={{#has_minqty minimumquantity}}{{minimumquantity}}{{else}}1{{/has_minqty}}&buyid={{uniqueId}}">',
                                        '<button type="button" class="unbxd_add_to_cart_button" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">Add to Cart</button>',
                                    '</a>',
                                '</div>',
                                '{{#if sample_id}}',
                                    '{{#if sample_price}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                            'additemtocart.nl?c=772072&n=1&qty=1&buyid={{sample_id}}">',
                                                '<button type="button" class="unbxd_add_sample" sampleprice="{{sample_price}}" sampleid="{{sample_id}}" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">Add Sample</button>',
                                            '</a>',
                                        '</div>',
                                        '<div class="sample-info">${{sample_price}} / Sample + Free Shipping</div>',
                                    '{{/if}}',
                                '{{/if}}',
                            '{{else}}',
                                '<div class="unbxd_add_to_cart">',
                                    '<a href="{{productUrl}}">',
                                        '<button type="button">Select Options</button>',
                                    '</a>',
                                '</div>',
                                '{{#if sample_id}}',
                                    '{{#if sample_price}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                            'additemtocart.nl?c=772072&n=1&qty=1&buyid={{sample_id}}">',
                                                '<button type="button" class="unbxd_add_sample" sampleprice="{{sample_price}}" sampleid="{{sample_id}}" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">Add Sample</button>',
                                            '</a>',
                                        '</div>',
                                        '<div class="sample-info">${{sample_price}} / Sample + Free Shipping</div>',
                                    '{{else}}',
                                    '<div class="unbxd_add_to_cart">',
                                        '<a href="{{productUrl}}">',
                                            '<button type="button">Select Sample</button>',
                                        '</a>',
                                    '</div>',
                                    '{{/if}}',
                                '{{/if}}',
                            '{{/unless}}',
                        '</div>',
                        '</div>',
                        '</div><!-- prod-cell ends -->',
                        '{{/products}}'
                    ].join(''),
                'list': [
                        '{{#products}}',
                        '<div class="list-prod-cell" unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}"ga-not-enabled" unbxdparam_title="{{title}}" ',
                        'unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}" ',
                        'unbxdparam_productUrl="{{productUrl}}" ',
                        '{{#if class}}',
                            'unbxdparam_category="{{class}}" ',
                        '{{/if}}',
                        '{{#if manufacturer}}',
                            'unbxdparam_brand="{{manufacturer}}"',
                        '{{/if}}',
                         '>',
                        '<div class="unbxd_cell-inner">',
                        '<div class="prod-thumb-container" data-product="{{uniqueId}}">',
                        '<a href="{{productUrl}}" title="{{title}}" class="prod-link">',
                            '{{#if image_url_variants_clean}}',
                                '<img class="prod-thumb" src="{{getImageUrl this}}">',
                                '<img class="prod-thumb-sub" src="{{getImageUrl this}}">',
                            '{{else}}',
                                '{{#if imageUrlAlt1}}',
                                    '<img class="prod-thumb alternate_image" src="{{getImageUrl this}}">',
                                    '<img class="prod-thumb-alt" src="{{imageUrlAlt1}}">',
                                '{{else}}',
                                    '<img class="prod-thumb" src="{{getImageUrl this}}">',
                                    '<img class="prod-thumb-sub" src="{{getImageUrl this}}">',
                                '{{/if}}',
                            '{{/if}}',
                        '</a>',
                        '<div class="thumb-overlay {{getOverlayClass this}}">{{getOverlayText this}}</div>',
                        '</div><!-- prod-thumb-container ends -->',
                        '<div class="prod-details">',
                        '<div class="prod-name">',
                        '<a href="{{productUrl}}">{{title}}</a>',
                        '</div> <!-- prod-name ends -->',
                        '<div class="prod-manufacturer">',
                        '{{#has_web_collection_store web_collection_store}}<span>{{get_web_collection_store web_collection_store}} Collection</span>{{/has_web_collection_store}}',
                        '{{#if manufacturer}} by {{manufacturer}}{{/if}}',
                        '</div>',
                        '{{#if average_rating}}',
                        '<a href="{{productUrl}}" class="rating-wrapper">',
                        '<span class="unbxd-avg-rating" style="background-position: 0px {{getRatingPosition average_rating_display_numeric}}px;"></span>',
                        '{{#if submitted_reviews_str}}<span class="review-link">({{submitted_reviews_str}})<span>{{/if}}',
                        '</a><!-- .rating-wrapper ends -->',
                        '{{/if}}',
                        '{{#if short_item_description}}<div class="short-desc">{{short_item_description}}</div>{{/if}}',
                        '{{getProdFeatures this}}',
                        '<ul class="unbxd-custom-list">',
                        '{{#customfeatures}}',
                        '<li class="custom-feature">{{{value}}}</li>',
                        '{{/customfeatures}}',
                        '</ul>',
                        '</div><!-- .prod-details ends -->',
                        '<div class="prod-selling-details">',
                        '{{#isShippingFree this}}',
                        '<div class="shipping-info">Free Shipping</div>',
                        '{{#if free_shipping_text}}<div class="shipping-info-text">({{decodeHtml free_shipping_text}})</div>{{/if}}',
                        '{{/isShippingFree}}',
                        '<div class="prod-price-wrapper">',
                        '{{#if nonCustomPrice}}',
                            '<span class="prod-price">{{nopricemessage}}</span>',
                        '{{else}}',
                            '<span class="prod-price">{{getPrice price}}</span>',
                            '{{#checkSaleUnits sale_units price}}<span class="sale-units"> / {{sale_units}}</span>{{/checkSaleUnits}}',
                            '{{#if discount_percent}}',
                            '<div class="discount-details">',
                            'was <span class="original-price">${{original_online_price}}</span><span class="discount-perc"> Save {{discount_percent}}%</span>',
                            '</div>',
                            '{{/if}}',
                        '{{/if}}',
                        '</div> <!-- prod-price-wrapper ends -->',
                        '<div class="add-sample-wrapper">',
                            '{{#unless has_variants}}',
                                '<div class="unbxd_add_to_cart">',
                                    '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                    'additemtocart.nl?c=772072&n=1&qty={{#has_minqty minimumquantity}}{{minimumquantity}}{{else}}1{{/has_minqty}}&buyid={{uniqueId}}">',
                                        '<button type="button" class="unbxd_add_to_cart_button" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">Add to Cart</button>',
                                    '</a>',
                                '</div>',
                                '{{#if sample_id}}',
                                    '{{#if sample_price}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                            'additemtocart.nl?c=772072&n=1&qty=1&buyid={{sample_id}}">',
                                                '<button type="button" class="unbxd_add_sample" sampleprice="{{sample_price}}" sampleid="{{sample_id}}" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">Add Sample</button>',
                                            '</a>',
                                        '</div>',
                                        '<div class="sample-info">${{sample_price}} / Sample + Free Shipping</div>',
                                    '{{/if}}',
                                '{{/if}}',
                            '{{else}}',
                                '<div class="unbxd_add_to_cart">',
                                    '<a href="{{productUrl}}">',
                                        '<button type="button">Select Options</button>',
                                    '</a>',
                                '</div>',
                                '{{#if sample_id}}',
                                    '{{#if sample_price}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                            'additemtocart.nl?c=772072&n=1&qty=1&buyid={{sample_id}}">',
                                                '<button type="button" class="unbxd_add_sample" sampleprice="{{sample_price}}" sampleid="{{sample_id}}" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">Add Sample</button>',
                                            '</a>',
                                        '</div>',
                                        '<div class="sample-info">${{sample_price}} / Sample + Free Shipping</div>',
                                    '{{else}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="{{productUrl}}">',
                                                '<button type="button">Select Sample</button>',
                                            '</a>',
                                        '</div>',
                                    '{{/if}}',
                                '{{/if}}',
                            '{{/unless}}',
                        '</div>',
                        '</div><!-- .prod-selling-details ends -->',
                        '{{#if image_url_variants_clean}}',
                            '<div class="variant-showcase">',
                                '<img class="variant-item" src="{{getImageUrl this}}"></img>',
                                '{{#image_url_variants_clean}}',
                                    '<img class="variant-item" src="{{this}}"></img>',
                                '{{/image_url_variants_clean}}',
                            '</div>',
                        '{{/if}}',
                        '</div>',
                        '</div><!-- prod-cell ends -->',
                        '{{/products}}'
                    ].join('')
            }
            , searchResultContainer: '.unbxd-products-list'
            , facetTemp: [
                        '<div class="unbxd-filter-title">FILTERS</div>',
                        '{{#facets}}',
                        '{{sortFacet this}}',
                        '{{setShowMoreFlag this}}',
                        '<div class="facet-container text_facets" unbxdparam_facetname="{{facet_name}}">',
                            '<div class="facet-title">',
                                '<span class="facet-icon unbxd-collapse"></span>',
                                '<span>{{prepareFacetNameCustom name}}</span>',
                            '</div>',
                            '<ul class="facet-option-list" unbxdparam_facetname="{{facet_name}}">',
                                '{{#unordered}}',
                                '{{#if ../showMoreFlag}}',
                                    '<li class="facet-option" style="{{#customgt @index}}display:none;{{/customgt}}">',
                                '{{else}}',
                                    '<li class="facet-option">',
                                '{{/if}}',
                                        '<label>',
                                            '<input {{#this.isSelected}}checked{{/this.isSelected}} type="checkbox" unbxdParam_facetName="{{../facet_name}}" ',
                                            'unbxdParam_facetValue="{{removeCurrency value ../facet_name}}" unbxdparam_facetcount="{{count}}" ',
                                            'id="{{../facet_name}}_{{value}}">',
                                            '{{#this.isSelected}}',
                                            '<span class="unbxd-chkbx chkd"></span>',
                                            '{{else}}',
                                            '<span class="unbxd-chkbx"></span>',
                                            '{{/this.isSelected}}',
                                            '{{#isRatingFacet ../facet_name}}',
                                            '<span class="facet-val">',
                                            '{{#isRated value}}',
                                                '<span class="unbxd-avg-rating" style="background-position: 0px ',
                                                '{{getRatingPosition value}}px;"></span>',
                                                '<span class="unbxd-avg-rating-up-txt {{#hideRatingText value}}unbxd-hidden{{/hideRatingText}}">',
                                                ' & Up</span>',
                                            '{{else}}',
                                                '<span>Not yet rated</span>',
                                            '{{/isRated}}',
                                            '</span>',
                                            '{{else}}',
                                            '<span class="facet-val">{{{prepareFacetValue value}}}</span>',
                                            '{{/isRatingFacet}}',
                                            '<span class="facet-count">({{count}})</span>',
                                        '</label>',
                                    '</li>',
                                '{{/unordered}}',
                                '{{#customview unordered.length}}',
                                    '{{#if ../showMoreFlag}}',
                                        '<li class="show_more unbxd-more"><input style="display:none;" unbxdParam_facetValue="zzzzzzzz" unbxdparam_facetcount="-1"><span class="unbxd-plus">',
                                        '+</span><span class="show-more-text">Show More</span></li>',
                                    '{{else}}',
                                        '<li class="show_more unbxd-less"><input style="display:none;" unbxdParam_facetValue="zzzzzzzz" unbxdparam_facetcount="-1"><span class="unbxd-plus">',
                                        '-</span><span class="show-more-text">Show Less</span></li>',
                                    '{{/if}}',
                                '{{/customview}}',
                            '</ul>',
                        '</div>',
                        '{{/facets}}',
                        '{{#rangefacets}}',
                        '{{setPriceLimits this}}',
                            '<div class="facet-container" unbxdparam_facetname="{{facet_name}}">',
                                '<div class="facet-title"><span class="facet-icon unbxd-collapse"></span><span>{{prepareFacetName name}}</span></div>',
                                '<ul class="facet-option-list">',
                                '{{#isPriceSelected}}',
                                    '<li class="facet-option unbxd-price-spcl">',
                                        '<label>',
                                            '<input type="checkbox" checked unbxdParam_facetName="{{facet_name}}" unbxdParam_facetValue="{{getMinPrice this}} TO {{getMaxPrice this}}" id="{{facet_name}}">',
                                            '<span class="unbxd-chkbx chkd"></span>',
                                            '<span class="facet-val">${{getMinPrice this}} - ${{getMaxPrice this}}</span>',
                                            '<span class="facet-count"></span>',
                                        '</label>',
                                    '</li>',
                                '{{else}}',
                                    '{{#unordered}}',
                                        '<li class="facet-option" style="{{#customgt @index}}display:none;{{/customgt}}">',
                                            '<label>',
                                                '<input type="checkbox" {{#this.isSelected}}checked{{/this.isSelected}}',
                                                ' unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{getFacetRange value}}" ',
                                                'id="{{../facet_name}}_{{value}}">',
                                                '{{#this.isSelected}}',
                                                '<span class="unbxd-chkbx chkd"></span>',
                                                '{{else}}',
                                                '<span class="unbxd-chkbx"></span>',
                                                '{{/this.isSelected}}',
                                                '<span class="facet-val">${{prepareFacetValue begin}} - ${{prepareFacetValue end}}</span>',
                                                '<span class="facet-count">({{count}})</span>',
                                            '</label>',
                                        '</li>',
                                    '{{/unordered}}',
                                    '{{#customview unordered.length}}',
                                        '<li class="show_more unbxd-more"><span class="unbxd-plus">+</span><span class="show-more-text">Show More</span></li>',
                                    '{{/customview}}',
                                '{{/isPriceSelected}}',
                                '</ul>',
                                '<div id="Price_boxes">',
                                    '<span style="display: inline-block;width: 6%;">$</span>',
                                    '<input id="unbxd_min_box" class="unbxd_price_input_box" placeholder="Min" value={{getMinPrice this}}>',
                                    '<span style="display: inline-block;width: 12%;text-align: center;">to</span>',
                                    '<input id="unbxd_max_box" class="unbxd_price_input_box" placeholder="Max" value={{getMaxPrice this}}>',
                                    '<button type="button" class="unbxd-price-button">Go</button>',
                                '</div>',
                                '<div id="Price_Category-selector">',
                                    '<div id="slider-range"></div>',
                                '</div>',
                            '</div>',
                        '{{/rangefacets}}'
                    ].join('')
            , facetContainerSelector: ".unbxd-filters"
            , facetCheckBoxSelector: "input[type='checkbox']"
            , noEncoding: true
            , facetElementSelector: "label"
            , facetOnSelect: function (el) {
            }
            , facetOnDeselect: function (el) {
            }
            , facetMultiSelect: true
            , selectedFacetTemp: [
                        '<div class="unbxd-selected-facets-container">'
                        , '{{#each filters}}'
                        , '{{#each this}}'
                        , '<div class="unbxd-selected-filter">'
                        , '<span class="unbxd-remove-filter" '
                        , 'unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">'
                        , '<img src="https://cdn.pbrd.co/images/6ER9PevDU.png">'
                        , '</span>'
                        , '{{#isRatingFacet this}}'
                            , '{{#isRated @key}}'
                                , '<span class="unbxd-selected-facet-name">{{prepareFacetValue @key}} star(s)</span>'
                            , '{{else}}'
                                , '<span class="unbxd-selected-facet-name">Not yet rated</span>'
                            , '{{/isRated}}'
                        , '{{else}}'
                        , '<span class="unbxd-selected-facet-name">{{{prepareFacetValue @key}}}</span>'
                        , '{{/isRatingFacet}}'
                        , '</div>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '{{#each ranges}}'
                        , '{{#each this}}'
                        , '<div class="unbxd-selected-filter">'
                        , '<span class="unbxd-remove-filter" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">'
                        , '<img src="https://cdn.pbrd.co/images/6ER9PevDU.png">'
                        , '</span>'
                        , '<span class="unbxd-selected-facet-name">{{addCurrency @key}}</span>'
                        , '</div>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '<div class="unbxd-clear-all">CLEAR ALL</div>'
                        , '</div>'
            ].join('')
            , selectedFacetContainerSelector: ".unbxd-selected-facets"
            , clearSelectedFacetsSelector: ".unbxd-clear-all"
            , removeSelectedFacetSelector: ""
            , selectedFacetHolderSelector: ""
            , loaderSelector: ".unbxd-loader-container"
            , onFacetLoad: function (obj) {
                $('.unbxd-total').html('(' + obj.response.numberOfProducts + ')');

                $('.unbxd-price-spcl .facet-count').html('(' + obj.response.numberOfProducts + ')');

                prepareFacetDisplay();

                if( $(window).scrollTop() > $('#unbxd-main').offset().top ) {
                    scrollToTopOfSearch();
                }

                removePaginationIfSingular();

                // adding productImpressions
                // addingProductImpressionGA();
            }
            , sanitizeQueryString: function (q) {
                return helpers.sanitizeSearchQuery(q);
            }
            , getFacetStats: "price"
            , processFacetStats: function (obj) {
                jQuery("#slider-range").slider({
                    range: !0
                    ,animate: !0
                    ,min: unbxd_min
                    ,max: unbxd_max
                    ,values: [slider_min, slider_max]
                    ,create: function() {}
                    ,slide: function(b, c) {
                        $("#unbxd_max_box").val(c.values[1]);
                        $("#unbxd_min_box").val(c.values[0]);
                    }
                    ,change: function(b, c) {
                        $("#unbxd_max_box").val(c.values[1]);
                        $("#unbxd_min_box").val(c.values[0]);
                        if(searchobj.params.ranges["Price_fq"]) {
                            searchobj.removeRangeFilter("Price_fq", slider_min, slider_max);
                        }

                        searchobj
                        .addRangeFilter("Price_fq", String(c.values[0]), String(c.values[1]))
                        .setPage(1)
                        .callResults(searchobj.paintResultSet,true);
                    }
                 });
            }
            , setDefaultFilters: function () {}
            , onIntialResultLoad: function (obj) {
                // addingProductImpressionGA();
            }
            , onPageLoad: function (obj) {
                if( $(window).scrollTop() > $('#unbxd-main').offset().top ) {
                    scrollToTopOfSearch();
                }
                // addingProductImpressionGA();
            }
            , onNoResult: function (obj) {
                $('#unbxd-main').html('<div class="unbxd-no-results" >No result found for your search of \'<span>' + helpers.encodeHtml(obj.searchMetaData.queryParams.q) + '\'</span>.</div><div id="unbxd_recommended_for_you" style="overflow:auto; width: 950px;"></div>');
            }
            , bannerSelector: ""
            , bannerTemp: ""
            , fields: ['*']
            , searchQueryParam: "search_query"
        };
    };

    var helpers = {
        encodeHtml: function (text) {
            var map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return text.replace(/[&<>"']/g, function (m) {
                return map[m];
            });
        },

        sanitizeSearchQuery: function (text) {
            return text;
        }
    };

    function addingProductImpressionGA(){
        jQuery(".prod-cell.ga-not-enabled").each(function(item){
            var _this = jQuery(this);
            _this.removeClass("ga-not-enabled");
            ga('ec:addImpression', {            // Provide product details in an impressionFieldObject.
                'name': jQuery(_this).attr("unbxdparam_title"),       // Name or ID is required.
                'id': jQuery(_this).attr("unbxdparam_sku"),
                'price': jQuery(_this).attr("unbxdparam_price"),
                'brand': jQuery(_this).attr("unbxdparam_brand"),
                'category': jQuery(_this).attr("unbxdparam_category"),
                // 'variant': productObj.variant,
                'list': 'Search Results',
                'position': jQuery(_this).attr("unbxdparam_prank")           // Custom dimension (string).
            });
            ga('send', 'pageview');
            _this.addClass("ga-enabled");
        });
    };

    var registerHandlebarHelpers = function() {

        Handlebars.registerHelper('getPrice',function(pPrice) {
            if( !isNaN(pPrice) ) {
                return '$' + pPrice.toFixed(2);
            } else {
                return 'Call for Price';
            }
        });

        Handlebars.registerHelper('isValidPrice', function(pPrice, options) {
            if( !isNaN(pPrice) ) {
                return options.fn(this);
            }

            return options.inverse(this);
        });
        
        Handlebars.registerHelper('lastPageNotVisible', function(pPageData, options) {
            if( !pPageData || !pPageData['pages'] || !pPageData['pages'].length || !pPageData['totalPages'] ) {
                return options.fn(this);
            }
            
            for( var i=0; i < pPageData['pages'].length; i++ ) {
                if(pPageData['pages'][i]['page'] === pPageData['totalPages'] ) {
                    return options.inverse(this);
                }
            }
            
            return options.fn(this);
        });

        Handlebars.registerHelper('customgt', function(index, options){
            return (index > (facet_threshold - 1)) ? options.fn(this): options.inverse(this);
        });

        Handlebars.registerHelper('customview', function(index, options){
            return (index > facet_threshold) ? options.fn(this): options.inverse(this);
        });

        Handlebars.registerHelper('checkSaleUnits', function(pSaleUnits, pPrice, options) {
            if( !isNaN(pPrice) && !!pSaleUnits ) {
                return options.fn(this);
            }

            return options.inverse(this);
        });

        Handlebars.registerHelper('addCurrency',function(pKey) {
            pKey = pKey.split(' ');
            return '$'+ pKey[0] + ' TO ' + '$' + pKey[2];
        });

        Handlebars.registerHelper('removeCurrency', function(pValue, pFacetName) {
            if(pFacetName === 'Price_fq') {
                return pValue.slice(1);
            } else {
                return pValue;
            }
        });

        Handlebars.registerHelper('unityDecrement',function(pValue) {
            return pValue - 1;
        });

        Handlebars.registerHelper('getFacetRange',function(pKey) {
            pKey = pKey.split(' ');
            return pKey[0] + ' TO ' + (pKey[2]);
        });

        Handlebars.registerHelper('getSuggestionUrl', function (pSuggestion) {
            return relative_search_url + '?search_query=' + encodeURI(pSuggestion);
        });

        Handlebars.registerHelper('allProductsDisplayed', function(options){
            return (searchobj.productEndIdx === searchobj.totalNumberOfProducts)? options.fn(this): options.inverse(this);
        });
        
        Handlebars.registerHelper('removeslashes', function(pStr){
            return pStr.replace(/\\/g, '');
        });

        Handlebars.registerHelper('isShippingFree', function(pData, options) {
            if( pData.hasOwnProperty('free_shipping') && pData['free_shipping'] === 'Yes' ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('isRatingFacet', function(pFacetName, options) {
            if( pFacetName === 'Customer_Ratings_fq' ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('hideRatingText', function(pVal, options) {
            return ( pVal == 5 ) ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('isRated', function(pVal, options) {
            return ( pVal != 0 ) ? options.fn(this) : options.inverse(this);
        });

        Handlebars.registerHelper('getJson', function(pData) {
            console.log(pData);
            return true;
        });

        Handlebars.registerHelper('decodeHtml', function(pData) {
            var decoded = $('<div/>').html(pData).text();
            return decoded;
        });

        Handlebars.registerHelper('has_web_collection_store', function(pCollection, options) {
            if( pCollection && pCollection.length && pCollection[0] ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('has_minqty', function(pMinQty, options) {
            var min_qty = parseInt(pMinQty);
            if( !isNaN(min_qty) && min_qty > 0 ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

        Handlebars.registerHelper('get_web_collection_store', function(pCollection) {
            if( pCollection && pCollection.length && pCollection[0] ) {
                return pCollection[0];
            }

            return '';
        });

        Handlebars.registerHelper('prepareFacetNameCustom', function(pName) {
            var name = pName.replace("_fq", "");
            name = pName.replace(/\_/g, ' ');
            if(name === "Can Be Indoor") {
                name = 'Can Be Indoor?';
            } else if(name === "Can Be Outdoor") {
                name = 'Can Be Outdoor?';
            } else if(name === "Coordinating Border") {
                name = 'Coordinating Border?';
            } else if(name === "Direct Vent") {
                name = 'Direct Vent?';
            } else if(name === "Easy Linkable") {
                name = 'Easy Linkable?';
            } else if(name === "Face Pile Weight") {
                name = 'Face/Pile Weight';
            } else if(name === "FSC Certified Content") {
                name = 'FSC-certified Content %';
            } else if(name === "GPM Max") {
                name = 'GPM (max)';
            } else if(name === "Max BTUH") {
                name = 'Max BTU/h';
            } else if(name === "Pile Height High") {
                name = 'Pile Height (High)';
            }else if(name === "Recommended No of Coats") {
                name = 'Recommended # of Coats';
            } else if(name === "Temperature Range With Remote"){
                name = "Temperature Range (with remote)";
            } else if(name === "Tufts Per Sq In"){
                name = "Tufts Per Sq. In.";
            }

            return name;
        });

        Handlebars.registerHelper('getImageUrl', function(pProductData) {
            if( !pProductData.hasOwnProperty('imageUrl') || !pProductData['imageUrl'] || !pProductData['imageUrl'].length ) {
                return defaultProdImg;
            } else {
                var imageUrl = pProductData['imageUrl'];
                imageUrl = (imageUrl.constructor === Array) ? imageUrl[0] : imageUrl;
                if( imageUrl.indexOf('http') === 0 && (imageUrl.indexOf('https') === -1 ||  imageUrl.indexOf('https') > 0) ) {
                    imageUrl = 'https' + imageUrl.slice(4);
                }
                return imageUrl;
            }
        });

        Handlebars.registerHelper('getProdFeatures', function(pData) {
            var f_arr = [];

            if(pData['class'] && pData['class'].toLowerCase() == "bamboo flooring"){
                if( getAttributeValue("construction::floortype") != "") {
                    f_arr.push({'value': getAttributeValue("construction::floortype")});
                }
                if( getAttributeValue("bambooconstruction") != "") {
                    f_arr.push({'value': getAttributeValue("bambooconstruction")});
                }
                if( getAttributeValue("installation") != "") {
                    f_arr.push({'value': getAttributeValue("installation")});
                }
                if( getAttributeValue("thickness::width::length") != "") {
                    f_arr.push({'value': getAttributeValue("thickness::width::length")});
                }
                if( getAttributeValue("custitemwarrantyfacet") != "") {
                    f_arr.push({'value': getAttributeValue("custitemwarrantyfacet")});
                }
            }

            else if (pData['class'] && (pData['class'].toLowerCase() == "natural linoleum flooring"
                || pData['class'].toLowerCase() == "cork flooring" || pData['class'].toLowerCase() == "hardwood flooring")) {
                if( getAttributeValue("construction::floortype") != "") {
                    f_arr.push({'value': getAttributeValue("construction::floortype")});
                }
                if( getAttributeValue("material_raw") != "") {
                    f_arr.push({'value': getAttributeValue("material_raw")});
                }
                if( getAttributeValue("installation") != "") {
                    f_arr.push({'value': getAttributeValue("installation")});
                }
                if( getAttributeValue("thickness::width::length") != "") {
                    f_arr.push({'value': getAttributeValue("thickness::width::length")});
                }
                if( getAttributeValue("custitemwarrantyfacet") != "") {
                    f_arr.push({'value': getAttributeValue("custitemwarrantyfacet")});
                }
            }

            else if (pData['class'] && (pData['class'].toLowerCase() == "flooring accessories"
                || pData['class'].toLowerCase() == "accessories")) {
                if( getAttributeValue("coverage") != "") {
                    f_arr.push({'value': getAttributeValue("coverage")});
                }
                if( getAttributeValue("width::length") != "") {
                    f_arr.push({'value': getAttributeValue("width::length")});
                }
                if( getAttributeValue("thickness") != "") {
                    f_arr.push({'value': getAttributeValue("thickness")});
                }
                if( getAttributeValue("custitemwarrantyfacet") != "") {
                    f_arr.push({'value': getAttributeValue("custitemwarrantyfacet")});
                }
            }

            else if (pData['class'] && pData['class'].toLowerCase() == "lighting") {
                if( getAttributeValue("custitemdeliveredlumens::custitemcolorrenderingindex") != "") {
                    f_arr.push({'value': getAttributeValue("custitemdeliveredlumens::custitemcolorrenderingindex")});
                }
                if( getAttributeValue("custitemequivalentwattage::custiteminputwattage") != "") {
                    f_arr.push({'value': getAttributeValue("custitemequivalentwattage::custiteminputwattage")});
                }
                if( getAttributeValue("custitemefficacy") != "") {
                    f_arr.push({'value': getAttributeValue("custitemefficacy")});
                }
                if( getAttributeValue("custitemcolortemperature") != "") {
                    f_arr.push({'value': getAttributeValue("custitemcolortemperature")});
                }
                if( getAttributeValue("custitemwarrantyfacet::custitemlifehrs") != "") {
                    f_arr.push({'value': getAttributeValue("custitemwarrantyfacet::custitemlifehrs")});
                }
            }

            else if (pData['class'] && (pData['class'].toLowerCase() == "paints & primers"
                || pData['class'].toLowerCase() == "non-paint finishes" || pData['class'].toLowerCase() == "pigments"
                 || pData['class'].toLowerCase() == "caulk" ||
                 pData['class'].toLowerCase() == "adhesives" || pData['class'].toLowerCase() == "grout")) {
                if( getAttributeValue("interior_or_exterior::finish_type") != "") {
                    f_arr.push({'value': getAttributeValue("interior_or_exterior::finish_type")});
                }
                if( getAttributeValue("base") != "") {
                    f_arr.push({'value': getAttributeValue("base")});
                }
                if( getAttributeValue("voc_content_gl") != "") {
                    f_arr.push({'value': getAttributeValue("voc_content_gl")});
                }
                if( getAttributeValue("coverage") != "") {
                    f_arr.push({'value': getAttributeValue("coverage")});
                }
                if( getAttributeValue("use_on_material__condition") != "") {
                    f_arr.push({'value': getAttributeValue("use_on_material__condition")});
                }
            }

            else if (pData['class'] && pData['class'].toLowerCase() == "sheet goods") {
                if( getAttributeValue("interior_or_exterior") != "") {
                    f_arr.push({'value': getAttributeValue("interior_or_exterior")});
                }
                if( getAttributeValue("thickness") != "") {
                    f_arr.push({'value': getAttributeValue("thickness")});
                }
                if( getAttributeValue("width") != "") {
                    f_arr.push({'value': getAttributeValue("width")});
                }
                if( getAttributeValue("length") != "") {
                    f_arr.push({'value': getAttributeValue("length")});
                }
                if( getAttributeValue("custitemwarrantyfacet") != "") {
                    f_arr.push({'value': getAttributeValue("custitemwarrantyfacet")});
                }
            }

            else if(pData['class'] && pData['class'].toLowerCase() == "appliances"){
                if( getAttributeValue("custitemwarrantyfacet") != "") {
                    f_arr.push({'value': getAttributeValue("custitemwarrantyfacet")});
                }
            }
            else if(pData['class'] && pData['class'].toLowerCase() == "cleaners & soaps"){
                if( getAttributeValue("voc_content_gl") != "") {
                    f_arr.push({'value': getAttributeValue("voc_content_gl")});
                }
                if( getAttributeValue("use_on_material__condition") != "") {
                    f_arr.push({'value': getAttributeValue("use_on_material__condition")});
                }
                if( getAttributeValue("coverage") != "") {
                    f_arr.push({'value': getAttributeValue("coverage")});
                }
            }

            function getAttributeValue(attribute){
                var attribute_value = "";

                switch(attribute) {
                    case "construction::floortype":
                        if( pData['construction'] && pData['floor_type'] )
                            attribute_value = pData['construction'] + ' ' + pData['floor_type'];
                        break;

                    case "bambooconstruction":
                        if( pData['bamboo_construction'] && pData['bamboo_construction'].length && pData['bamboo_construction'][0] != "") {
                            attribute_value = 'Bamboo Grain: ' + pData['bamboo_construction'][0];
                        }
                        break;

                    case "installation":
                        if( pData['installation'] && pData['installation'].length ) {
                            attribute_value = 'Installation: ' + pData['installation'].join(", ");
                        }
                        break;

                    case "thickness::width::length":
                        if( pData['thickness_final'] && pData['thickness_final'].length ) {
                            attribute_value += 'Thickness: ' + pData['thickness_final'][0];
                        }

                        if( pData['width_final'] && pData['width_final'].length ) {
                            if( attribute_value != "")
                                attribute_value += ", "
                            attribute_value += 'Width: ' + pData['width_final'][0];
                        }

                        if( pData['length_final'] && pData['length_final'].length ) {
                            if( attribute_value != "")
                                attribute_value += ", "
                            attribute_value += 'Length: ' + pData['length_final'][0];
                        }
                        break;

                    case "custitemwarrantyfacet":
                        if( pData['custitemwarrantyfacet'] ) {
                            attribute_value = 'Warranty: ' + pData['custitemwarrantyfacet'];
                        }
                        break;

                    case "material_raw":
                        if( pData['material_raw'] ) {
                            attribute_value = 'Species: ' + pData['material_raw'];
                        }
                        break;

                    case "coverage":
                        if( pData['coverage'] && pData['coverage'].length && pData['coverage'][0] != "") {
                            attribute_value = 'Coverage: ' + pData['coverage'][0];
                        }
                        break;

                    case "width::length":
                        if( pData['width_final'] && pData['width_final'].length ) {
                            attribute_value += 'Width: ' + pData['width_final'][0];
                        }

                        if( pData['length_final'] && pData['length_final'].length ) {
                            if( attribute_value != "")
                                attribute_value += ", "
                            attribute_value += 'Length: ' + pData['length_final'][0];
                        }
                        break;

                    case "thickness":
                        if( pData['thickness_final'] && pData['thickness_final'].length ) {
                            attribute_value += 'Thickness: ' + pData['thickness_final'][0];
                        }
                        break;

                    case "custitemdeliveredlumens::custitemcolorrenderingindex":
                        if( pData['custitemdeliveredlumens']
                        && pData['custitemcolorrenderingindex']
                        && pData['custitemcolorrenderingindex'][0] != "") {
                            attribute_value = pData['custitemdeliveredlumens'] + " at " + pData['custitemcolorrenderingindex'];
                        }
                        break;

                    case "custitemequivalentwattage::custiteminputwattage":
                        if( pData['custitemequivalentwattage'] && pData['custiteminputwattage'] ) {
                            attribute_value = "Equivalent to " + pData['custitemequivalentwattage'];
                            attribute_value += ", Only uses " + pData['custiteminputwattage'];
                        }
                        break;

                    case "custitemefficacy":
                        if( pData['custitemefficacy']) {
                            attribute_value = "Efficacy: " + pData['custitemefficacy'];
                        }
                        break;

                    case "custitemcolortemperature":
                        if( pData['custitemcolortemperature']) {
                            attribute_value = "Correlated Color Temperature (CCT): " + pData['custitemcolortemperature'];
                        }
                        break;

                    case "custitemwarrantyfacet::custitemlifehrs":
                        if( pData['custitemwarrantyfacet'] && pData['custitemlifehrs'] ) {
                            attribute_value = 'Warranty: ' + pData['custitemwarrantyfacet'];
                            attribute_value += ", " + pData['custitemlifehrs'].replace("Hours", "Hour") +" Life";
                        }
                        break;

                    case "interior_or_exterior::finish_type":
                        if( pData['interior_or_exterior'] && pData['interior_or_exterior'].length &&
                            pData['finish_type'] && pData['finish_type'].length &&
                            (pData['interior_or_exterior'][0] != "" && pData['finish_type'][0] != "")) {
                            attribute_value = pData['interior_or_exterior'][0] + " " + pData['finish_type'][0];
                        }
                        break;

                    case "base":
                        if( pData['base'] ) {
                            attribute_value = pData['base'];
                        }
                        break;

                    case "voc_content_gl":
                        if( pData['voc_content_gl'] ) {
                            attribute_value = "VOC Content: " + pData['voc_content_gl'] + " Grams/Liter";
                        }
                        break;

                    case "interior_or_exterior":
                        if( pData['interior_or_exterior'] &&
                        pData['interior_or_exterior'].length &&
                        pData['interior_or_exterior'][0] != "") {
                            attribute_value = pData['interior_or_exterior'][0];
                        }
                        break;

                    case "width":
                        if( pData['width_final'] && pData['width_final'].length ) {
                            attribute_value += 'Width: ' + pData['width_final'][0];
                        }
                        break;

                    case "length":
                        if( pData['length_final'] && pData['length_final'].length ) {
                            attribute_value += 'Length: ' + pData['length_final'][0];
                        }
                        break;

                    case "use_on_material__condition":
                        if( pData['use_on_material__condition']
                        && pData['use_on_material__condition'].length
                        && pData['use_on_material__condition'][0] != "") {
                            var material_condition = pData['use_on_material__condition'].join(", ");

                            if( material_condition.length > 46 ){
                                material_condition = material_condition.slice(0,45) + "....";
                            }
                            attribute_value += 'Use on: ' + material_condition;
                        }
                        break;

                    default:
                        attribute_value = "";
                };
                return attribute_value;
            }

            f_arr = f_arr.slice(0, 5);

            pData['customfeatures'] = f_arr;
        });

        Handlebars.registerHelper('getOverlayClass', function(pData) {
            if(pData.hasOwnProperty('on_sale') && pData['on_sale'] === 'Yes') {
                return 'on-sale';
            } else if(pData.hasOwnProperty('best_seller') && pData['best_seller'] === 'Yes') {
                return 'best-seller';
            } else if(pData.hasOwnProperty('new_item') && pData['new_item'] === 'Yes') {
                return 'new-item';
            }

            return 'unbxd-hidden';
        });

        Handlebars.registerHelper('getOverlayText', function(pData) {
            if(pData.hasOwnProperty('on_sale') && pData['on_sale'] === 'Yes') {
                return 'ON SALE';
            } else if(pData.hasOwnProperty('best_seller') && pData['best_seller'] === 'Yes') {
                return 'BEST SELLER';
            } else if(pData.hasOwnProperty('new_item') && pData['new_item'] === 'Yes') {
                return 'NEW';
            }

            return '';
        });

        Handlebars.registerHelper('getRatingPosition', function(pRating) {
            if( isNaN(pRating) ) {
                return 0;
            }

            return pRating * (-36);
        });

        Handlebars.registerHelper('setPriceLimits', function(pData) {
            var last = pData.unordered.length - 1;
            unbxd_min = parseInt(pData.unordered[0]['begin']);
            unbxd_max = parseInt(pData.unordered[last]['end']);
        });

        Handlebars.registerHelper('sortFacet', function(pData) {
            var numeric_facets = {'Face_Pile_Weight_fq':1, 'Width_fq':1, 'Thickness_fq':1,
                                    'Length_fq':1, 'FSC_Certified_Content_fq':1, 'Pile_Height_High_fq':1,
                                    'Recommended_No_of_Coats_fq':1, 'Stitches_Per_Inch_fq':1, 'Color_Rendering_Index_fq':1,
                                    'Color_Temperature_fq':1, 'Delivered_Lumens_fq':1, 'Input_Wattage_fq':1,
                                    'Equivalent_Wattage_fq':1, 'Life_fq':1, 'Recycled_Content_fq':1,
                                    'Strips_per_Plank_fq':1, 'Efficacy_fq':1, 'Energy_Savings_fq':1};

            var alphanumerics_first = 0;
            var numeric_order = 'asc';

            if( numeric_facets.hasOwnProperty(pData.facet_name) ) {
                alphanumerics_first = 0;
                numeric_order = 'asc';
                if( pData.unordered.length ) {
                    pData.unordered.sort(sortNumbers);
                }
            }
            else if ( pData.facet_name === 'Warranty_fq' ) {
                alphanumerics_first = 1;
                numeric_order = 'desc';
                if( pData.unordered.length ) {
                    pData.unordered.sort(sortNumbers);
                }
            }
            else if ( pData.facet_name === 'Customer_Ratings_fq' ) {
                alphanumerics_first = 0;
                numeric_order = 'desc';
                if( pData.unordered.length ) {
                    pData.unordered.sort(sortNumbers);
                }
            }
            else if ( pData.facet_name === 'Shade_fq' ) {
                var shades = {'Light' : 1, 'Medium' : 1, 'Dark' : 1};
                if( pData.unordered.length ) {
                    var values = pData.unordered;
                    var final_arr = [];
                    var shades_fltr = {};
                    var shades_fltr_list = [];
                    for ( var i = 0; i < values.length; i++ ) {
                        if( !shades.hasOwnProperty(values[i].value) ) {
                            final_arr.push(values[i]);
                        } else {
                            shades_fltr[values[i].value] = values[i];
                        }
                    }

                    for ( var prop in shades ) {
                        if ( prop in shades_fltr ) {
                            shades_fltr_list.push(shades_fltr[prop]);
                        }
                    }

                    pData.unordered = shades_fltr_list.concat(final_arr);
                }
            }
            else if( pData.unordered.length > facet_threshold ) {
                var temp = pData.unordered.splice(facet_threshold);
                temp.sort(sortString);
                pData.unordered = pData.unordered.concat(temp);
            }

            function sortNumbers(pVal1, pVal2) {
                var key = 'value';
                if( !isNaN(parseFloat(pVal1[key])) && !isNaN(parseFloat(pVal2[key])) ) {
                    return (numeric_order === 'asc') ?
                            parseFloat(pVal1[key]) - parseFloat(pVal2[key])
                                :
                            parseFloat(pVal2[key]) - parseFloat(pVal1[key]);
                } else {
                    if ( isNaN(parseFloat(pVal1[key])) ) {
                        if (pVal1[key] === 'Random' || pVal2[key] === 'Random')
                            return (pVal1[key] === 'Random') ? 1 : -1;
                        else
                            return (alphanumerics_first) ? -1 : 1;
                    } else {
                        return (alphanumerics_first) ? 1 : -1;
                    }
                }
            }

            function sortString(pVal1, pVal2) {
                if(pVal1.value > pVal2.value) {
                    return 1;
                } else {
                    return -1;
                }
            }
        });

        Handlebars.registerHelper('setShowMoreFlag', function(pData) {
            if(pData.unordered.length <= facet_threshold) {
                return;
            }

            pData['showMoreFlag'] = 1;

            for(var i=facet_threshold; i < pData.unordered.length; i++) {
                if( pData.unordered[i].isSelected ) {
                    pData['showMoreFlag'] = 0;
                }
            }
        });

        Handlebars.registerHelper('isPriceSelected', function(options) {
            var query = window.location.search;

            if( query.indexOf('Price_fq:') === -1 ) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        });

        Handlebars.registerHelper('getMaxPrice', function(pData) {
            slider_max = getPriceVal(pData, 'max');

            return slider_max;
        });

        Handlebars.registerHelper('getMinPrice', function(pData) {
            slider_min = getPriceVal(pData, 'min');

            return slider_min;
        });

        function getPriceVal(pData, pType) {
            if( pData['name'] !== 'Price' ) {
                return;
            }

            var query = window.location.search;

            var regex = /Price_fq\:\[/g, result, indices = [];

            while ( (result = regex.exec(query)) ) {
                indices.push(result.index + 'Price_fq:['.length);
            }

            if( !indices.length ) {
                return (pType === 'min') ? unbxd_min : unbxd_max;
            }

            var filters = [];
            var tempStr;

            for(var i = 0; i < indices.length; i++) {
                tempStr = query.substr(indices[i]);
                filters.push(tempStr.substr(0, tempStr.indexOf(']')));
            }

            //if( !pData.selected.length ) {
                var decodedFilter = decodeURI(filters[0]);
                var filterValArr = decodedFilter.split(' TO ');
                return (pType === 'min') ? filterValArr[0] : filterValArr[1];
            //}

            //for( var i=0; i < filters.length; i++ ) {
            //    var decodedFilter = decodeURI(filters[i]);
            //
            //    for( var j=0; j < pData.selected.length; j++ ) {
            //        if( pData.selected[j].value !== decodedFilter ) {
            //            var filterValArr = decodedFilter.split(' TO ');
            //            return (pType === 'min') ? filterValArr[0] : filterValArr[1];
            //        }
            //    }
            //}

            //return (pType === 'min') ? unbxd_min : unbxd_max;
        }
    };
})(jQuery);
