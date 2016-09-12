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
    , facet_threshold = 8;

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
            , '</div> <!-- unbxd-products-list-container ends -->'
            , '</div> <!-- unbxd-results-container ends -->'
            , '<div class="unbxd_pagination_contanier"></div>'
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
        
        $('#unbxd-main').on('click', '.prod-thumb', eh.getView);
        
        $('#unbxd-main').on('click', '.show_more', eh.getView);

        $('#unbxd-main').on('mouseover', '.unbxd_cell-inner', eh.changeImg);

        $('#unbxd-main').on('mouseout', '.unbxd_cell-inner', eh.reverseImg);

        $('#unbxd-main').on('keypress', '.unbxd_price_input_box', eh.onsimpleEnter);
    };
    
    eventActions.onsimpleEnter = function(event) {
        if(event.keyCode === 13) {
            var min = window.unbxd_min;
            var max = window.unbxd_max;
            if(parseFloat($("#unbxd_min_box").val()) != NaN) {
                min = parseFloat($("#unbxd_min_box").val());
                //if(min > window.unbxd_max)//Entered value is greater than max value
                //    min = window.unbxd_max - 1;
                //else if(min < window.unbxd_min)
                //    min = window.unbxd_min;
            }

            if(parseFloat($("#unbxd_max_box").val()) != NaN) {
                max = parseFloat($("#unbxd_max_box").val());
                //if(max > window.unbxd_max)//Entered value is greater than max value
                //    max = window.unbxd_max;
                //else if(max < window.unbxd_min)
                //    max = window.unbxd_min + 1;
            }

            //if(min != max) {
                searchobj.clearRangeFiltes().addRangeFilter("Price_fq", min, max);
                window.location = window.location.origin + '/?' + searchobj.url().query;
            //}
        }
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
            , searchQueryDisplayTemp: 'Search results for: \'{{query}}\''
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
                '<span class="unbxd_pageof"> ... </span>',
                '<span class="unbxd_totalPages" unbxdaction="{{totalPages}}">{{totalPages}}</span>',
                '{{#if hasNext}}',
                    '<span class="unbxd_next" unbxdaction="next"></span>',
                '{{/if}}',
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
                        '<div class="prod-cell" unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}">',
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
                        '{{#if web_collection_store}}<div class="collection-store">{{web_collection_store}} Collection</div>{{/if}}',                                    
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
                        '<span class="prod-price">{{getPrice price}}</span>',
                        '{{#checkSaleUnits sale_units price}}<span class="sale-units"> / {{sale_units}}</span>{{/checkSaleUnits}}',
                        '{{#if discount_percent}}',
                        '<div class="discount-details">',
                        'was <span class="original-price">${{original_online_price}}</span><span class="discount-perc"> Save {{discount_percent}}%</span>',
                        '</div>',
                        '{{/if}}',
                        '</div> <!-- prod-price-wrapper ends -->',
                        '{{#isShippingFree this}}',
                        '<div class="shipping-info">Free Shipping</div>',
                        '{{#if free_shipping_text}}<div class="shipping-info-text">({{decodeHtml free_shipping_text}})</div>{{/if}}',
                        '{{/isShippingFree}}',
                        '{{#if short_item_description}}<div class="short-desc">{{short_item_description}}</div>{{/if}}',
                        '{{getProdFeatures this}}',
                        '<ul>',
                        '{{#customfeatures}}',
                        '<li class="custom-feature">{{value}}</li>',
                        '{{/customfeatures}}',
                        '</ul>',

                        '<div class="add-sample-wrapper">',
                            '{{#unless has_variants}}',
                                '<div class="unbxd_add_to_cart">',
                                    '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                    'additemtocart.nl?c=772072&n=1&qty=1&buyid={{uniqueId}}">',
                                        '<button type="button">Add to Cart</button>',
                                    '</a>',
                                '</div>',
                                '{{#if custom_sample_id}}',
                                    '{{#if sample_price}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                            'additemtocart.nl?c=772072&n=1&qty=1&buyid={{custom_sample_id}}">',
                                                '<button type="button">Add Sample</button>',
                                            '</a>',
                                        '</div>',
                                        '<div class="sample-info">${{sample_price}} / Sample + Free Shipping</div>',
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
                        '<div class="list-prod-cell" unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}">',
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
                        '</div><!-- prod-thumb-container ends -->',
                        '<div class="prod-details">',
                        '<div class="prod-name">',
                        '<a href="{{productUrl}}">{{title}}</a>',
                        '</div> <!-- prod-name ends -->',
                        '<div class="prod-manufacturer">',
                        '{{#if web_collection_store}}<span>{{web_collection_store}} Collection</span>{{/if}}',
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
                        '<ul>',
                        '{{#customfeatures}}',
                        '<li class="custom-feature">{{value}}</li>',
                        '{{/customfeatures}}',
                        '</ul>',
                        '</div><!-- .prod-details ends -->',
                        '<div class="prod-selling-details">',
                        '{{#isShippingFree this}}',
                        '<div class="shipping-info">Free Shipping</div>',
                        '{{#if free_shipping_text}}<div class="shipping-info-text">({{decodeHtml free_shipping_text}})</div>{{/if}}',
                        '{{/isShippingFree}}',
                        '<div class="prod-price-wrapper">',
                        '<span class="prod-price">{{getPrice price}}</span>',
                        '{{#checkSaleUnits sale_units price}}<span class="sale-units"> / {{sale_units}}</span>{{/checkSaleUnits}}',
                        '{{#if discount_percent}}',
                        '<div class="discount-details">',
                        'was <span class="original-price">${{original_online_price}}</span><span class="discount-perc"> Save {{discount_percent}}%</span>',
                        '</div>',
                        '{{/if}}',
                        '</div> <!-- prod-price-wrapper ends -->',
                        '<div class="add-sample-wrapper">',
                            '{{#unless has_variants}}',
                                '<div class="unbxd_add_to_cart">',
                                    '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                    'additemtocart.nl?c=772072&n=1&qty=1&buyid={{uniqueId}}">',
                                        '<button type="button">Add to Cart</button>',
                                    '</a>',
                                '</div>',
                                '{{#if custom_sample_id}}',
                                    '{{#if sample_price}}',
                                        '<div class="unbxd_add_to_cart">',
                                            '<a href="http://www.greenbuildingsupply.com/app/site/backend/',
                                            'additemtocart.nl?c=772072&n=1&qty=1&buyid={{custom_sample_id}}">',
                                                '<button type="button">Add Sample</button>',
                                            '</a>',
                                        '</div>',
                                        '<div class="sample-info">{{getPrice price}}{{#isValidPrice price}} / Sample + Free Shipping{{/isValidPrice}}</div>',
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
                        '<div class="facet-container" unbxdparam_facetname="{{facet_name}}">',
                            '<div class="facet-title">',
                                '<span class="facet-icon unbxd-collapse"></span>',
                                '<span>{{prepareFacetNameCustom name}}</span>',
                            '</div>',
                            '<ul class="facet-option-list">',
                                '{{#unordered}}',
                                '{{#if ../showMoreFlag}}',
                                    '<li class="facet-option" style="{{#customgt @index}}display:none;{{/customgt}}">',
                                '{{else}}',
                                    '<li class="facet-option">',
                                '{{/if}}',
                                        '<label for="{{../facet_name}}_{{value}}">',
                                            '<input {{#this.isSelected}}checked{{/this.isSelected}} type="checkbox" unbxdParam_facetName="{{../facet_name}}" ',
                                            'unbxdParam_facetValue="{{removeCurrency value ../facet_name}}" ',
                                            'id="{{../facet_name}}_{{value}}">',
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
                                        '<li class="show_more unbxd-more"><span class="unbxd-plus">',
                                        '+</span><span class="show-more-text">Show More</span></li>',
                                    '{{else}}',
                                        '<li class="show_more unbxd-less"><span class="unbxd-plus">',
                                        '-</span><span class="show-more-text">Show Less</span></li>',
                                    '{{/if}}',
                                '{{/customview}}',
                            '</ul>',
                        '</div>',
                        '{{/facets}}',
                        '{{#rangefacets}}',
                            '<div class="facet-container" unbxdparam_facetname="{{facet_name}}">',
                                '<div class="facet-title"><span class="facet-icon unbxd-collapse"></span><span>{{prepareFacetName name}}</span></div>',
                                '<ul class="facet-option-list">',
                                    '{{#unordered}}',
                                        '<li class="facet-option" style="{{#customgt @index}}display:none;{{/customgt}}">',
                                            '<label for="{{../facet_name}}_{{value}}">',
                                                '<input type="checkbox" {{#this.isSelected}}checked{{/this.isSelected}}',
                                                ' unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{getFacetRange value}}" ',
                                                'id="{{../facet_name}}_{{value}}">',
                                                '<span class="facet-val">${{prepareFacetValue begin}} - ${{prepareFacetValue end}}</span>',
                                                '<span class="facet-count">({{count}})</span>',
                                            '</label>',
                                        '</li>',
                                    '{{/unordered}}',
                                    '{{#customview unordered.length}}',		
                                        '<li class="show_more unbxd-more"><span class="unbxd-plus">+</span><span class="show-more-text">Show More</span></li>',		
                                    '{{/customview}}',
                                '</ul>',
                                '<div id="Price_boxes">',
                                    '<span style="display: inline-block;width: 8%;">$</span>',
                                    '<input id="unbxd_min_box" class="unbxd_price_input_box" placeholder="Min" value={{getMinPrice this}}>',
                                    '<span style="display: inline-block;width: 12%;text-align: center;">to</span>',
                                    '<input id="unbxd_max_box" class="unbxd_price_input_box" placeholder="Max" value={{getMaxPrice this}}>',
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
                        , '<span class="unbxd-selected-facet-name">{{prepareFacetValue @key}}</span>'
                        , '{{/isRatingFacet}}'
                        , '</div>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '{{#each ranges}}'
                        , '{{#each this}}'
                        , '<div class="unbxd-selected-filter">'
                        , '<span class="unbxd-remove-filter" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">x</span>'
                        , '<span class="unbxd-selected-facet-name">{{addCurrency @key}}</span>'
                        , '</div>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '<div class="unbxd-clear-all">CLEAR ALL</div>'
                        , '</div>'
            ].join('')
            , selectedFacetContainerSelector: ".unbxd-selected-facets"
            , clearSelectedFacetsSelector: ".unbxd-clear-all"
            , removeSelectedFacetSelector: ".unbxd-remove-filter"
            , selectedFacetHolderSelector: ""
            , loaderSelector: ".unbxd-loader-container"
            , onFacetLoad: function (obj) {
                $('.unbxd-total').html('(' + obj.response.numberOfProducts + ')');
                
                prepareFacetDisplay();
                
                if( $(window).scrollTop() > $('#unbxd-main').offset().top ) {
                    scrollToTopOfSearch();
                }
            }
            , sanitizeQueryString: function (q) {
                return helpers.sanitizeSearchQuery(q);
            }
            , getFacetStats: "price"
            , processFacetStats: function (obj) {
                window.unbxd_min = (window.unbxd_min || window.unbxd_min ==0) ? 
                                    window.unbxd_min : obj.price.min;
                window.unbxd_max = window.unbxd_max || obj.price.max;
                jQuery("#slider-range").slider({
                    range: !0
                    ,animate: !0
                    ,min: unbxd_min
                    ,max: unbxd_max
                    ,values: [obj.price.values.min, obj.price.values.max]
                    ,create: function() {}
                    ,slide: function(b, c) {}
                    ,change: function(b, c) {
                        searchobj
                        .clearRangeFiltes()
                        .addRangeFilter("price",c.values[0],c.values[1])
                        .setPage(1)
                        .callResults(searchobj.paintResultSet,true);
                    }
                 });
            }
            , setDefaultFilters: function () {}
            , onIntialResultLoad: function (obj) {
            }
            , onPageLoad: function (obj) {
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
            return text.replace('"', '\\"');
        }
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
            return true;
        });
        
        Handlebars.registerHelper('decodeHtml', function(pData) {
            var decoded = $('<div/>').html(pData).text();
            return decoded;
        });
        
        Handlebars.registerHelper('prepareFacetNameCustom', function(pName) {
            var name = pName.replace("_fq", "");
            name = pName.replace(/\_/g, ' ');
            if(name === "Wood Species") {
                name = "Species";
            } else if(name === "Can Be Indoor") {
                name = 'Can Be Indoor?';
            } else if(name === "Can Be Outdoor") {
                name = 'Can Be Outdoor?';                
            } else if(name === "Base") {
                name = 'Base (water/oil/etc.)';
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
            } else if(name === "Number of Plys Plys") {
                name = 'Number of Plys';
            } else if(name === "Pile Height High") {
                name = 'Pile Height (High)';
            } else if(name === "Pile Height Low") {
                name = 'Pile Height (Low)';
            } else if(name === "Recommended No of Coats") {
                name = 'Recommended # of Coats';
            } else if(name === "Recoat After") {
                name = 'Re-coat After';
            } else if(name === "Surface Texture Construction Style") {
                name = 'Surface Texture, Construction, Style';
            } else if(name === "Temperature Range With Remote"){
                name = "Temperature Range (with remote)";
            } else if(name === "Tufts Per Sq In"){
                name = "Tufts Per Sq. In.";
            } else if(name === "Use On Material Condition"){
                name = "Use on Material - Condition";
            } else if(name === "VOC Content grams per liter"){
                name = "VOC Content g/L Grams/Liter";
            } else if(name === 'Web Collection Store') {
                name = 'Web Collection (Store)';
            } else if(name === 'Best seller') {
                name = 'Best Seller';
            } else if(name === 'Is New') {
                name = 'New Item';
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
            if( pData['construction'] && pData['floor_type'] ) {
                f_arr.push({'value':pData['construction'] + ' ' + pData['floor_type']});
            } else if( pData['construction'] ) {
                f_arr.push({'value':pData['construction']});
            } else if( pData['floor_type'] ) {
                f_arr.push({'value':pData['floor_type']});         
            }
            
            if( pData['width_final'] ) {
                pData['width_final'] = pData['width_final'].replace(/["']/g, "") + '"';
                f_arr.push({'value': 'Width: ' + pData['width_final']});                         
            }
            
            if( pData['installation_raw'] ) {
                f_arr.push({'value': 'Install Method: ' + pData['installation_raw']});                                         
            }
            
            if( pData['material_raw'] ) {
                f_arr.push({'value': 'Wood Species: ' + pData['material_raw']});                                         
            }
            
            if( pData['thickness_final'] ) {
                f_arr.push({'value': 'Thickness: ' + pData['thickness_final']});                                         
            }
            
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
        
        Handlebars.registerHelper('sortFacet', function(pData) {
            if( pData.facet_name === 'Customer_Ratings_fq' ) {
                if( pData.unordered.length ) {
                    pData.unordered.sort(sortNumbers);
                }
            } else if( pData.unordered.length > facet_threshold ) {
                var temp = pData.unordered.splice(facet_threshold);
                temp.sort(sortString);
                pData.unordered = pData.unordered.concat(temp);
            }
            
            function sortNumbers(pVal1, pVal2) {
                var key = 'value';
                if( !isNaN(parseFloat(pVal1[key])) && !isNaN(parseFloat(pVal2[key])) ) {
                    return parseFloat(pVal2[key]) - parseFloat(pVal1[key]); 
                } else {
                    return 1;
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
        
        Handlebars.registerHelper('getMaxPrice', function(pData) {
            return getPriceVal(pData, 'max');
        });
        
        Handlebars.registerHelper('getMinPrice', function(pData) {
            return getPriceVal(pData, 'min');
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
                return '';
            }
            
            var filters = [];
            var tempStr;

            for(var i = 0; i < indices.length; i++) {
                tempStr = query.substr(indices[i]);
                filters.push(tempStr.substr(0, tempStr.indexOf(']')));
            }
            
            if( !pData.selected.length ) {
                var decodedFilter = decodeURI(filters[0]);
                var filterValArr = decodedFilter.split(' TO ');
                return (pType === 'min') ? filterValArr[0] : filterValArr[1];
            }
            
            for( var i=0; i < filters.length; i++ ) {
                var decodedFilter = decodeURI(filters[i]);
                
                for( var j=0; j < pData.selected.length; j++ ) {
                    if( pData.selected[j].value !== decodedFilter ) {
                        var filterValArr = decodedFilter.split(' TO ');
                        return (pType === 'min') ? filterValArr[0] : filterValArr[1];
                    }
                }
            }
            
            return '';
        }
    };
})(jQuery);
