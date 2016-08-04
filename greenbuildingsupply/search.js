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
    , facet_threshold = 6;

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
            , '<div class="unbxd-pagination">Load More</div>'
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
        
        $('#unbxd-main').on('click', '.prod-thumb', eh.getView);
        
        $('#unbxd-main').on('click', '.show_more', eh.getView);
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
        var prod_thumb = $(this).parents('.prod-cell-inner').find('.prod-thumb');
        var main_img_src = $(this).parent().children().first().attr('src');
        
        if( !variant_src ) {
            return;
        }
        
        prod_thumb.attr('src', variant_src);
        
        if( variant_src != main_img_src ) {
            $(this).parents('.prod-cell-inner').find('.prod-thumb-sub').show();
        } else {
            $(this).parents('.prod-cell-inner').find('.prod-thumb-sub').hide();
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
            $(this).parent().css({'max-height': '210px', 'overflow': 'auto'});
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

    
    function configureSearchObj() {
        searchObjDesktop = {
            siteName: UnbxdSiteName
            , APIKey: UnbxdApiKey
            , type: 'search'
            , deferInitRender: []
            , inputSelector: '#search2'
            , searchButtonSelector: '#srhImg'
            , spellCheck: '.did-you-mean'
            , spellCheckTemp: 'Did you mean \'<a href = "{{{getSuggestionUrl suggestion}}}" target="_self">{{suggestion}}</a>\'?'
            , searchQueryDisplay: '.unbxd-searchval'
            , searchQueryDisplayTemp: 'Search results for: \'{{query}}\''
            , pageSize: 30
            , pageSizeContainerType: 'click'
            , sortContainerSelector: '.unbxd-sort-by'
            , isClickNScroll: true
            , clickNScrollElementSelector: '.unbxd-pagination' 
            , isAutoScroll: false
            , sortOptions: [{
                    name: 'Relevancy'
                }, {
                    name: 'Reviews',
                    field: 'average_rating',
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
                                    '<div class="prod-cell-inner">',
                                    '<div class="prod-thumb-container" data-product="{{uniqueId}}">',
                                    '<a href="{{productUrl}}" title="{{title}}" class="prod-link">',
                                    '<img class="prod-thumb" src="{{getImageUrl this}}">',
                                    '<img class="prod-thumb-sub" src="{{getImageUrl this}}">',
                                    '</a>',
                                    '<div class="thumb-overlay {{getOverlayClass this}}">{{getOverlayText this}}</div>',
                                    '</div> <!-- prod-thumb-container ends -->',
                                    '{{#if image_url_variants}}',
                                    '<div class="variant-showcase">',
                                    '<img class="variant-item" src="{{getImageUrl this}}"></img>',
                                    '{{#image_url_variants}}',
                                    '<img class="variant-item" src="{{this}}"></img>',
                                    '{{/image_url_variants}}',
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
                                    '{{#if short_item_description}}<div class="short-desc">{{short_item_description}}</div>{{/if}}',
                                    '{{getProdFeatures this}}',
                                    '<ul>',
                                    '{{#customfeatures}}',
                                    '<li class="custom-feature">{{value}}</li>',
                                    '{{/customfeatures}}',
                                    '</ul>',
                                    '{{#if custom_sample_id}}',
                                    '<div class="add-sample-wrapper">',
                                    '<button type="button">Add Sample</button>',
                                    '<div class="sample-info">{{getPrice price}}{{#isValidPrice price}} / Sample + Free Shipping{{/isValidPrice}}</div>',
                                    '</div>',
                                    '{{/if}}',
                                    '</div>',
                                    '</div><!-- prod-cell ends -->',
                                    '{{/products}}'
                                ].join(''),
                            'list': [
                                    '{{#products}}',
                                    '<div class="list-prod-cell" unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}">',
                                    '<div class="prod-thumb-container" data-product="{{uniqueId}}">',
                                    '<a href="{{productUrl}}" title="{{title}}" class="prod-link">',
                                    '<img class="prod-thumb" src="{{getImageUrl this}}">',
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
                                    '{{#if custom_sample_id}}',
                                    '<div class="add-sample-wrapper">',
                                    '<button type="button">Add Sample</button>',
                                    '<div class="sample-info">{{getPrice price}}{{#isValidPrice price}} / Sample + Free Shipping{{/isValidPrice}}</div>',
                                    '</div>',
                                    '{{/if}}',
                                    '</div><!-- .prod-selling-details ends -->',
                                    '</div><!-- prod-cell ends -->',
                                    '{{/products}}'
                                ].join('')
                    }
            , searchResultContainer: '.unbxd-products-list'
            , facetTemp: [
                        '<div class="unbxd-filter-title">FILTERS</div>',
                        '{{#facets}}',
                        '{{sortFacet this}}',
                        '<div class="facet-container" unbxdparam_facetname="{{facet_name}}">',
                        '<div class="facet-title"><span class="facet-icon unbxd-collapse"></span><span>{{prepareFacetNameCustom name}}</span></div>',
                        '<ul class="facet-option-list">',
                        '{{#selected}}',
                        '<li class="facet-option">',
                        '<label for="{{../facet_name}}_{{value}}">',
                        '<input checked type="checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{removeCurrency value ../facet_name}}" id="{{../facet_name}}_{{value}}">',
                        '{{#isRatingFacet ../facet_name}}',
                        '<span class="facet-val">',
                        '<span class="unbxd-avg-rating" style="background-position: 0px {{getRatingPosition value}}px;"></span>',
                        '<span class="unbxd-avg-rating-up-txt {{#hideRatingText value}}unbxd-hidden{{/hideRatingText}}"> & Up</span>',
                        '</span>',
                        '{{else}}',
                        '<span class="facet-val">{{prepareFacetValue value}}</span>',
                        '{{/isRatingFacet}}',
                        '<span class="facet-count">({{count}})</span>',
                        '</label>',
                        '</li>',
                        '{{/selected}}',
                        '{{#unselected}}',
                        '<li class="facet-option" style="{{#customgt @index 5}}display:none{{/customgt}}">',
                        '<label for="{{../facet_name}}_{{value}}">',
                        '<input type="checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{removeCurrency value ../facet_name}}" id="{{../facet_name}}_{{value}}">',
                        '{{#isRatingFacet ../facet_name}}',
                        '<span class="facet-val">',
                        '<span class="unbxd-avg-rating" style="background-position: 0px {{getRatingPosition value}}px;"></span>',
                        '<span class="unbxd-avg-rating-up-txt {{#hideRatingText value}}unbxd-hidden{{/hideRatingText}}"> & Up</span>',
                        '</span>',
                        '{{else}}',
                        '<span class="facet-val">{{prepareFacetValue value}}</span>',
                        '{{/isRatingFacet}}',
                        '<span class="facet-count">({{count}})</span>',
                        '</label>',
                        '</li>',
                        '{{/unselected}}',
                        '{{#customview unselected.length 6}}',
                        '<li class="show_more unbxd-more"><span class="unbxd-plus">+</span><span class="show-more-text">Show More</span></li>',		
                        '{{/customview}}',
                        '</ul>',
                        '</div>',
                        '{{/facets}}',
                        '{{#rangefacets}}',
                        '<div class="facet-container" unbxdparam_facetname="{{facet_name}}">',
                        '<div class="facet-title"><span class="facet-icon unbxd-collapse"></span><span>{{prepareFacetName name}}</span></div>',
                        '<ul class="facet-option-list">',
                        '{{#selected}}',
                        '<li class="facet-option">',
                        '<label for="{{../facet_name}}_{{value}}">',
                        '<input checked type="checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{getFacetRange value}}" id="{{../facet_name}}_{{value}}">',
                        '<span class="facet-val">${{prepareFacetValue begin}} - ${{prepareFacetValue end}}</span>',
                        '<span class="facet-count">({{count}})</span>',
                        '</label>',
                        '</li>',
                        '{{/selected}}',
                        '{{#unselected}}',
                        '<li class="facet-option" style="{{#customgt @index 6}}display:none;{{/customgt}}">',
                        '<label for="{{../facet_name}}_{{value}}">',
                        '<input type="checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{getFacetRange value}}" id="{{../facet_name}}_{{value}}">',
                        '<span class="facet-val">${{prepareFacetValue begin}} - ${{prepareFacetValue end}}</span>',
                        '<span class="facet-count">({{count}})</span>',
                        '</label>',
                        '</li>',
                        '{{/unselected}}',
                        '{{#customview unselected.length 6}}',		
                        '<li class="show_more unbxd-more"><span class="unbxd-plus">+</span><span class="show-more-text">Show More</span></li>',		
                        '{{/customview}}',
                        '</ul>',
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
                        , '<span class="unbxd-remove-filter" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">x</span>'
                        , '<span class="unbxd-selected-facet-name">{{prepareFacetValue @key}}</span>'
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
        
        Handlebars.registerHelper('customgt', function(index, value, options){		
            return (index > value) ? options.fn(this): options.inverse(this);		
        });	
        
        Handlebars.registerHelper('customview', function(index, value, options){		
            return (index > value) ? options.fn(this): options.inverse(this);		
        });
        
        Handlebars.registerHelper('checkSaleUnits', function(pSaleUnits, pPrice, options) {
            if( !isNaN(pPrice) && !!pSaleUnits ) {
                return options.fn(this);
            }
            
            return options.inverse(this);
        });
        
        Handlebars.registerHelper('isOutOfStock', function (pIsOutOfStock, options) {
            return (typeof pIsOutOfStock !== 'undefined' && pIsOutOfStock == 'Yes') ? options.fn(this) : options.inverse(this);
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
            return pKey[0] + ' TO ' + (pKey[2] - 1);
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
                if(pData.selected.length) {
                    pData.selected.sort(sortNumbers);
                }
                
                if( pData.unselected.length ) {
                    pData.unselected.sort(sortNumbers);
                }
            }
            
            function sortNumbers(pVal1, pVal2) {
                var key = 'value';
                if( !isNaN(parseFloat(pVal1[key])) && !isNaN(parseFloat(pVal2[key])) ) {
                    return parseFloat(pVal2[key]) - parseFloat(pVal1[key]); 
                } else {
                    return 1;
                }
            }
        });
    };
})(jQuery);
