(function() {
        
    var searchConfigDesktop, searchConfigMobile;
    
    var relative_url = window.location.origin;
    var relative_search_url = relative_url + '/search-results';
    
    //function for all event handlers
    var eventHandlers = function() {};
    
    var eh = new eventHandlers();
    
    var initPreLoadSetup = function() {
        var type = 'search';
        //send type according to page type
        //if(typeof unbxd_category_page !== "undefined" && unbxd_category_page === 1) {
        //    type = 'browse';
        //}
        configureSearchObj(type);
    };

    //bind all events, initialize variables etc.
    var initLoadSetup = function() {
        initialize();
        registerHandlebarHelpers();
        bindEvents();
    };
    
    //on DOMContentLoaded
    $(document).ready(initLoadSetup); 
    
    //for initialization before dom load
    initPreLoadSetup();
    
    //get page ready on initial load
    var initialize = function() {
        $('.unbxd-results_container').fadeIn(800);
        
        if(isMobile.any()){
            window.searchobj = new Unbxd.setSearch(searchConfigMobile);
        } else {
            window.searchobj = new Unbxd.setSearch(searchConfigDesktop);
        }
        
        //if category page, empty search box
        if(typeof unbxd_category_page !== "undefined" && unbxd_category_page === 1) {
            $('#search_box_id').val('');
        }
        
        $('#mobile-filter').insertAfter('#outerwrapper');
        $('#back-btn').insertAfter('#outerwrapper');
        $('#big-overlay').insertAfter('#outerwrapper');
        
        eh.onWindowScroll();
    };
    
    //register helpers for handlebars
    var registerHandlebarHelpers = function() {
        
        Handlebars.registerHelper('discount', function(saleprice, price){
            return (price - saleprice).toFixed(2);
        });

        Handlebars.registerHelper('getSuggestionUrl', function(suggestion){
            return relative_search_url + '?query='+encodeURI(suggestion) ;
        });

        Handlebars.registerHelper('if_last', function(value){
            if (value == 72) {
                return "";
            } else {
                return "|";
            }
        });

        Handlebars.registerHelper('customname', function(name){
            name = name.replace("_fq", " ").replace("_"," ");
            return name;
        });

        Handlebars.registerHelper('islast', function(options){
            return ((searchobj.productEndIdx === searchobj.totalNumberOfProducts) || (searchobj.productEndIdx < searchobj.options.pageSize))? options.fn(this): options.inverse(this);
        });

        Handlebars.registerHelper('customgt', function(index, value, options){
            return (index > value) ? options.fn(this): options.inverse(this);
        });

        Handlebars.registerHelper('customvalue', function(index, value, options){
            return (index >= value) ? options.fn(this): options.inverse(this);
        });

        Handlebars.registerHelper('getsign',function(key) {
            key = key.split(' ');
            return '$'+ key[0] + ' TO ' + '$' +key[2];
        });

        Handlebars.registerHelper('showDecimal',function(price) {
            return price.toFixed(2);
        });

        Handlebars.registerHelper('customfacet', function(facet, rangefacet, options){
            return (facet.length >= 2 && rangefacet.length >= 1) ? options.fn(this): options.inverse(this);
        });

        Handlebars.registerHelper('getUrl', function(q,f){
            return relative_search_url +'?query='+q+'&filter='+ encodeURIComponent(searchobj.options.bucketField+':"'+f+'"');
        });

        Handlebars.registerHelper('CapitalizeName', function(name){
            return name.toUpperCase();
        });
        
        Handlebars.registerHelper('isDiscountApplicable', function(pPrice, pSalePrice, options){
            return (getDiscountText(pPrice, pSalePrice)) ? options.fn(this): options.inverse(this);
        });
        
        Handlebars.registerHelper('calculateDiscount', function(pPrice, pSalePrice){
            return getDiscountText(pPrice, pSalePrice);
        });
    };
    
    function getDiscountText(pPrice, pSalePrice) {
        var savedAmt = parseFloat(pPrice) - parseFloat(pSalePrice);
        var price = parseFloat(pSalePrice);
        if (!savedAmt || savedAmt < 0) {
            return '';
        }

        var discountPerc = (savedAmt / (price + savedAmt)) * 100;

        discountPerc = Math.round(discountPerc);

        return (!discountPerc) ? '' : (discountPerc + '% OFF');
    }
    
    var escapeHtml = function(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    };
    
    window.getView = function(val, temp) {
        if ($(val).html() == "Show More Options" || $(val).html() == " Show More Buckets") {
            if ($(val).html() == "Show More Options")
                $(val).html("Show Less Options");
            else
                $(val).html("Show Less Buckets");
            var display_array = $(val).siblings();
            for (i = 0; i < display_array.length; i++)
            {
                if ($(display_array[i]).css('display') == "none")
                {
                    $(display_array[i]).css('display', 'inline-block');
                    $(display_array[i]).addClass('overage');
                }
            }
        } else
        {
            if ($(val).html() == "Show Less Options")
                $(val).html("Show More Options");
            else
                $(val).html("Show More Buckets");
            var display_array = $(val).siblings();
            for (i = temp; i < display_array.length; i++)
            {
                $(display_array[i]).css('display', 'none');
            }
        }
    };

    function hidePopUp(obj) {
        $(obj).parents('.quick_view_info').find('.modal-dialog').animate({'padding-top': '0px'}, 100, function () {
            $(this).parents('.quick_view_info').hide();
            $('.modal-backdrop').remove();
            $('body').css('overflow', 'visible');
        });
    }

    function showPopUp(obj) {
        var $_backdrop_html = '<div class="modal-backdrop fade in"></div>';
        $('body').append($_backdrop_html);
        $('body').css('overflow', 'hidden');
        $(obj).parent().find('.quick_view_info').show();
        $(obj).parent().find('.quick_view_info').find('.modal-dialog').css('padding-top', '0px');
        $(obj).parent().find('.quick_view_info').find('.modal-dialog').animate({'padding-top': '100px'}, 200);
    }

    $(window).resize(function () {
        resizeListing();
    });

    function resizeListing() {
        var $_window_width = $('#table__nlitemlist').width();
        var index = 4;
        if ($_window_width > 1300)
        {
            index = 4;
        } else if ($_window_width > 975)
        {
            index = 3;
        } else if ($_window_width > 560)
        {
            index = 2;
        } else {
            index = 1;
        }
        var $_img_width = $('#table__nlitemlist').width() / index;
        var $_outline_width = $_img_width - 2;
        $('.itemlist_cell').width($_outline_width);
        $('.itemlist_celldisplay').width($_outline_width - 2);
        $_outline_width = 200;
        $('.itemlist_celldisplay a img').width($_outline_width - 2);
        var $_max_deviation = 0;
        var $_max_label = 0;
        var $_height, $_standard_width;
        $_standard_width = parseInt($('.rows .itemlist_cell .itemlist_celldisplay img').width());
        $('.rows .itemlist_cell').each(function () {

            if ($_max_deviation < parseInt($(this).find('.itemlist_celldisplay img').height()) - parseInt($(this).find('.itemlist_celldisplay img').width()))
            {
                $_max_deviation = parseInt($(this).find('.itemlist_celldisplay img').height()) - parseInt($(this).find('.itemlist_celldisplay img').width());
            }

            if ($_max_label < ($(this).find('.itemlist_label').height() + $(this).find('.itemlist_price').height()))
            {
                $_max_label = $(this).find('.itemlist_label').height() + $(this).find('.itemlist_price').height();
            }
        });
        $('.itemlist_celldisplay').height($_max_deviation + $_standard_width);
        $_height = $_max_deviation + $_standard_width + $_max_label + 40;
        $('.itemlist_cell').css('height', $_height);
    }

    window.getFacetView = function(val) {
        if ($('#unbxd-facets').children().length == 0) {
            var x = $('ul#unbxd-facets')[1];
            var display_array = $(x).children();
        } else
            var display_array = $('#unbxd-facets').children();
        for (i = 0; i < display_array.length; i++)
        {
            if ($(display_array[i]).css('display') == "none")
            {
                $(display_array[i]).css('display', 'block');
            }
        }
        $(val).css('display', 'none');
    };
    
    //factory check smartphones
    var isMobile = {
        Android: function() {
          return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
          return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
          return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
          return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
          return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() || window.screen.width < 860);
        }
    };
    
    //bind all events for the page
    var bindEvents = function() {
        $("#toTop").on('click', eh.backToTop);
        $(window).on('scroll', eh.onWindowScroll);
        $('#unbxd-search_results').on('click', 'li.qvtab1', eh.showProductDetails);
        $('#unbxd-search_results').on('click', 'li.qvtab2', eh.showProductDescription);
        $('body').on('click', '#back-btn', eh.goBack);
    };

    //copy eventHandlers.prototype to another variable
    var eventActions = eventHandlers.prototype;
    
    //scroll to top action
    eventActions.backToTop = function() {
        window.scrollTo(0, 0);
    };
    
    eventActions.onWindowScroll = function() {
        if($(window).scrollTop() > 0){
            $("#toTop").fadeIn("slow");
        }
        else {
            $("#toTop").fadeOut("slow");
        }
    };
    
    eventActions.showProductDetails = function() {
        $(this).parent('ul').find('li').removeClass('active');
        $(this).addClass('active');
        $(this).parents('.tabtable').find('.tab-pane').removeClass('active');
        $(this).parents('.tabtable').find('#tab1').addClass('active');
    };
    
    eventActions.showProductDescription = function() {
        $(this).parent('ul').find('li').removeClass('active');
        $(this).addClass('active');
        $(this).parents('.tabtable').find('.tab-pane').removeClass('active');
        $(this).parents('.tabtable').find('#tab2').addClass('active');
    };
    
    eventActions.addItemToCart = function() {
        var id = $(this).parent().find('[name=itemid]').val();
        $('#form-unbxd-' + id).submit();
    };
    
    eventActions.goBack = function() {
        $('#big-overlay').hide();
        $('#back-btn').hide();
        $('#mobile-filter').hide();
        $('#outerwrapper').show();
    };
    
    function configureSearchObj(pType) {
        searchConfigDesktop = {
            siteName: 'knobbery_com-u1456916527166'
            , APIKey: '2a500347e97c02f229205d2654332a3c'
            , type: (pType === 'browse') ? 'browse' : 'search'
            , getCategoryId: ''
            , inputSelector: '#search_box_id'
            , searchButtonSelector: '#go'
            , spellCheck: '#unbxd-did_you_mean'
            , spellCheckTemp: 'Did you mean <a href = "{{{getSuggestionUrl suggestion}}}" target="_self">{{suggestion}}</a> ?</h3>'
            , searchQueryDisplay: '.mod'
            , searchQueryParam: "query"
            , searchQueryDisplayTemp: (typeof unbxd_category_page === "undefined" || unbxd_category_page !== 1) ? 'Search Results For {{query}} ({{numberOfProducts}} Results)' : ''
            , pageSize: 48
            , viewTypes: ['grid', 'list']
            , viewTypeContainerSelector: '.view-type'
            , viewTypeContainerTemp:
                    '{{#options}}'
                    + '<a id="unbxd-{{value}}_result_layout" title="{{value}} View" class="unbxd-{{value}}_result_layout {{#if selected}}high{{else}}low{{/if}}" href="javascript:void(0)" {{#unless selected}} unbxdviewtype="{{value}}"{{/unless}} ></a>'
                    + '{{/options}}'
            , searchResultSetTemp: {
                "grid": ['{{#products}}'
                            , '<div class="ssitemlist_cell" unbxdattr="product" unbxdparam_sku="{{uniqueId}}"  unbxdparam_prank="{{unbxdprank}}" >'
                            , '<div class="ssitemlist_celldisplay">'
                            , '<a href="{{productUrl}}">'
                            , '<img src="{{imageUrl}}" border="0" target="_self">'
                            , '</a>'
                            , '</div>'
                            , '<div class="ssitemlist_label">'
                            , '<a href="{{productUrl}}" old_content="{{title}}" target="_self">{{title}}</a>'
                            , '</div>'
                            , '<div class="ssitemlist_line">'
                            , '<span class="line"></span>'
                            , '</div>'
                            , '<div class="ssitemlist_price">${{showDecimal price}}'
                            , '{{#isDiscountApplicable Original_price price}}'
                            , '<span class="ssitemsavings">SAVE ${{discount price Original_price}}</span>'
                            , '{{/isDiscountApplicable}}'
                            , '</div>'
                            , '{{#isDiscountApplicable Original_price price}}'
                            , '<div class="discount">'
                            , '{{calculateDiscount Original_price price}}'
                            , '</div>'
                            , '{{/isDiscountApplicable}}'
                            , '<div class="quick-view-btn" style="display: none;">Quick View</div>'
                            , '<div class="quick-detail-btn"><a href="{{productUrl}}">View Details</a></div>'
                            , '<div class="quick_view_info" style="display:none;" rel="">'
                            , '<div class="modal-container">'
                            , '<div class="modal fade modal-product-detail in" id="modal-product-detail" style="display: block;" aria-hidden="false">'
                            , '<div class="modal-dialog">'
                            , '<div class="modal-content">'
                            , '<div class="modal-header" id="modal-header">'
                            , '<h3 class="modal-title">QuickView</h3>'
                            , '<span>|</span>'
                            , '<a href="{{productUrl}}">view fullpage</a>'
                            , '<button aria-hidden="true" data-dismiss="modal" class="close" type="button">CLOSE</button>'
                            , '</div>'
                            , '<div class="modal-body" id="modal-body">'
                            , '<div id="product-detail" class="view product-detail">'
                            , '<div class="row-fluid">'
                            , '<div class="span6 text-center"><img src="{{imageUrl}}" alt="{{title}}"></div>'
                            , '<div class="span6">'
                            , '<div class="tabtable">'
                            , '<ul class="nav nav-tabs">'
                            , '<li class="qvtab1 active"><a class="qvtab1" data-target="#tab1">Product Details</a></li>'
                            , '<li class="qvtab2"><a class="qvtab2" data-target="#tab2">Description</a></li>'
                            , '</ul>'
                            , '<div class="tab-content">'
                            , '<form method="post" name="form-unbxd-{{uniqueId}}" id="form-unbxd-{{uniqueId}}" action="/app/site/backend/additemtocart.nl?c=618078&n=3">'
                            , '<div class="tab-pane active" id="tab1">'
                            , '<h3 class="modal-title">{{customTitle}}</h3>'
                            , '<div class="lead lead-small no-margin-bottom">'
                            , '<strong class="lead-price">${{showDecimal price}}</strong>'
                            , '</div>'
                            , '<div class="ship-instruction"></div>'
                            , '<div class="control-group">'
                            , '<label for="in-modal-quantity">Quantity</label>'
                            , '<input type="text" value="1" class="input-mini quantity unbxd-modal-inp" id="in-modal-quantity" name="qty">'
                            , '<div style="clear:both;"></div>'
                            , '</div>'
                            , '<div style="clear:both;"></div>'
                            , '<input type="hidden" name="itemid" value="{{uniqueId}}">'
                            , '<input type="hidden" name="buyid" value="{{uniqueId}}">'
                            , '<div class="btn btn-primary btn-large add-to-cart" unbxdattr="AddToCart" unbxdparam_sku="{{uniqueId}}">'
                            , '<i class="icon-shopping-cart icon-white"></i>'
                            , 'Add to Cart'
                            , '</div>'
                            , '</div>'
                            , '</form>'
                            , '<div class="tab-pane" id="tab2">'
                            , '<p class="detail-description">{{description}}</p>'
                            , '</div>'
                            , '</div>'
                            , '</div>'
                            , '</div>'
                            , '</div>'
                            , '</div>'
                            , '</div>  <!-- modal body -->'
                            , '</div>'
                            , '</div>'
                            , '</div>'
                            , '</div>'
                            , '</div> <!-- quick info view -->'
                            , '</div>'
                            , '{{/products}}'].join(''),
                "list": ['{{#products}}'
                            , '<div class="item" unbxdattr="product" unbxdparam_sku="{{uniqueId}}"  unbxdparam_prank="{{unbxdprank}}">'
                            , '<table border="0" cellspacing="0" cellpadding="0">'
                            , '<tbody>'
                            , '<tr>'
                            , '<td width="150" align="center">'
                            , '<span class="image">'
                            , '<a href="{{productUrl}}" target="_self">'
                            , '<img src="{{imageUrl}}" onerror="this.onerror=null;this.src=\'//cdn.unbxd.net/ajax_search/img/missing-image-75x75.gif\';">'
                            , '</a>'
                            , '</span>'
                            , '</td>'
                            , '<td valign="top">'
                            , '<p>'
                            , '<a href="{{productUrl}}" target="_self">{{title}}'
                            , '</a>'
                            , '</p>'
                            , '<p class="price">${{showDecimal price}}'
                            , '{{#isDiscountApplicable Original_price price}}'
                            , '<span class="ssitemsavings">SAVE ${{discount price Original_price}}</span>'
                            , '{{/isDiscountApplicable}}'
                            , '</p>'
                            , '</td>'
                            , '<td>'
                            , '</td>'
                            , '</tr>'
                            , '</tbody>'
                            , '</table>'
                            , '</div>'
                            , '{{/products}}'].join('')
            }
            , searchResultContainer: '#unbxd-search_results'
            , isClickNScroll: true
            , clickNScrollElementSelector: '#clickmore'
            , isAutoScroll: false
            , sortContainerSelector: '#unbxd-sorting'
            , sortOptions: [{
                    name: 'Relevancy'
                }, {
                    name: 'Name: A-Z',
                    field: 'title',
                    order: 'asc'
                }, {
                    name: 'Name: Z-A',
                    field: 'title',
                    order: 'desc'
                }, {
                    name: 'Price: Low to High',
                    field: 'price',
                    order: 'asc'
                }, {
                    name: 'Price: High to Low',
                    field: 'price',
                    order: 'desc'
                }]
            , sortContainerType: 'select'
            , sortContainerTemp: [
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
            , facetTemp: [
                , '{{#facets}}'
                        , '<li class="facet_container" id="unbxd-{{name}}_container" style="{{#customvalue @index 3}} display:none; {{/customvalue}}">'
                        , '<a class="facet_title open" title="{{name}}">{{name}}</a>'
                        , '<ul class="element_container">'
                        , '{{#selected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" >'
                        , '<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '{{prepareFacetValue value}}'
                        , '<span class="unbxd-facet_count">({{count}})</span>'
                        , '</label>'
                        , '</li>'
                        , '{{/selected}}'
                        , '{{#unselected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" style="{{#customvalue @index 4}} display:none; {{/customvalue}}">'
                        , '<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '{{prepareFacetValue value}}'
                        , '<span class="unbxd-facet_count">({{count}})</span>'
                        , '</label>'
                        , '</li>'
                        , '{{/unselected}}'
                        , '{{#customgt unselected.length 4}}'
                        , '<li class="show_more" onclick="getView(this,4)">Show More Options</li>'
                        , '{{/customgt}}'
                        , '</ul>'
                        , '</li>'
                        , '{{/facets}}'
                        , '{{#rangefacets}}'
                        , '<li class="facet_container" id="unbxd-{{name}}_container" style="display:none;">'
                        , '<a class="facet_title open" title="{{name}}">{{name}}</a>'
                        , '<ul class="element_container">'
                        , '{{#selected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" >'
                        , '<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '${{prepareFacetValue begin}} - ${{prepareFacetValue end}} ({{count}})'
                        , '</label>'
                        , '</li>'
                        , '{{/selected}}'
                        , '{{#unselected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" style="{{#customvalue @index 4}} display:none; {{/customvalue}}">'
                        , '<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '${{prepareFacetValue begin}} - ${{prepareFacetValue end}} ({{count}})'
                        , '</label>'
                        , '</li>'
                        , '{{/unselected}}'
                        , '{{#customgt unselected.length 4}}'
                        , '<li class="show_more" onclick="getView(this,4)">Show More Options</li>'
                        , '{{/customgt}}'
                        , '</ul>'
                        , '</li>'
                        , '{{/rangefacets}}'
                        , '{{#customfacet facets rangefacets}}'
                        , '<div class="facetBtn" style="display: block;" onclick="getFacetView(this)">More Filters</div>'
                        , '{{/customfacet}}'].join('')
            , facetContainerSelector: "#unbxd-facets"
            , facetCheckBoxSelector: "input[type='checkbox']"
            , facetElementSelector: "label"
            , noEncoding: true
            , facetOnSelect: function (el) {
                $("html, body").animate({scrollTop: 0}, 800);
            }
            , facetOnDeselect: function (el) {
                $("html, body").animate({scrollTop: 0}, 800);
            }
            , selectedFacetTemp: [
                '<h3 id="unbxd-summary_header" style="display: block !important;">Your Refinements</h3>'
                        , '<div id="clearAll"> Clear All </div>'
                        , '{{#each filters}}'
                        , '{{#each this}}'
                        , '<div class="selected-facet clearfix" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">'
                        , '<span class="unbxd-summary_label">{{customname this}} : </span>'
                        , '<span class="unbxd-summary_value" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">{{{prepareFacetValue @key}}}</span>'
                        , '<img src="http://classwithapps.com/wp-content/uploads/2013/02/close.png" height="20" width="20"/>'
                        , '</div>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '{{#each ranges}}'
                        , '{{#each this}}'
                        , '<div class="selected-facet clearfix" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">'
                        , '<span class="unbxd-summary_label">{{customname this}} : </span>'
                        , '<span class="unbxd-summary_value" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">{{{getsign @key}}}</span>'
                        , '<img src="http://classwithapps.com/wp-content/uploads/2013/02/close.png" height="20" width="20"/>'
                        , '</div>'
                        , '{{/each}}'
                        , '{{/each}}'].join('')
            , selectedFacetContainerSelector: "#unbxd-selectedfacetscontainer"
            , clearSelectedFacetsSelector: "#clearAll"
            , facetMultiSelect: true
            , removeSelectedFacetSelector: ".selected-facet.clearfix"
            , selectedFacetHolderSelector: ""
            , loaderSelector: "#unbxd-loading"
            , onFacetLoad: function (obj) {
                if (obj.response.numberOfProducts >= 1) {
                    //jQuery('#unbxd-did_you_mean').css('display', 'none');
                }
                if (obj.buckets == undefined)
                {
                    jQuery('.view-type').show();
                    jQuery('.bucketType').hide();
                } else
                {
                    jQuery('.view-type').hide();
                    jQuery('.bucketType').show();
                }
                jQuery('#unbxd-options').show('fast');
                jQuery('#unbxd-selectedfacetscontainer').show('fast');

                $('.filterBtn').unbind('click').bind('click', function () {
                    if ($('.unbxd-facets_container').is(':visible')) {
                        $('.filterText').html("FILTERS");
                    } else {
                        $('.filterText').html("HIDE FILTERS");
                    }
                    $('.unbxd-facets_container').toggle();
                });

                $('.ssitemlist_cell .quick-view-btn').bind('click', function () {
                    showPopUp(this);
                });

                $('.ssitemlist_cell .quick_view_info .close').bind('click', function () {
                    hidePopUp(this);
                });

                $('.modal-backdrop').bind('click', function () {
                    hidePopUp(this);
                });

                $('.add-to-cart').bind('click', eh.addItemToCart);

                if ($('#unbxd-options').length > 0) {
                    var fixmeTop = $('#unbxd-options').offset().top;
                }
                $(window).scroll(function () {
                    var currentScroll = $(window).scrollTop();
                    if (currentScroll >= fixmeTop) {
                        var fixed_menu_margin_top = ( $('#hellobar-pusher').length ) ? 30 : 0;

                        $('#unbxd-options').css({
                            'position': 'fixed',
                            'top': '0',
                            'z-index': '6000',
                            'width': '94%',
                            'margin': 0,
                            'margin-top': fixed_menu_margin_top + 'px',
                            'background-color': '#262526',
                            'left': '0',
                            'padding-left': '3%',
                            'padding-right': '3%'
                        });
                        $('.filterBtn').css('background-color', '#262526');

                        $('p.sort-by').css('color', '#fff');
                        $('.customBucket').css('color', '#fff');
                        $('.sort-by select').css('color', '#777');

                        $('.unbxd-grid_result_layout').css(
                                'background', 'url("http://unbxd.com/img/list_bullets_black.png")no-repeat -20px 0px');
                        $('.unbxd-list_result_layout').css(
                                'background', 'url("http://unbxd.com/img/list_bullets_black.png")no-repeat 0px 0px');
                        
                        $('.filterText').css('color', '#fff');
                        $('.mod').css('color', '#fff');
                        $('.slicknav_icon-bar').css('background-color', '#d2d2d2');
                        
                        $('.unbxd-facets_container').css({
                            'top': '0',
                            'position': 'fixed',
                            'z-index': '1000',
                            'max-height': '565px',
                            'height': 'auto',
                            'overflow': 'scroll',
                            'margin-top': (51 + fixed_menu_margin_top) + 'px',
                            'left': '30px'
                        });
                    } else {
                        $('#unbxd-options').css({
                            'position': 'static',
                            'margin': '0 25px',
                            'width': 'auto',
                            'background-color': '#fff',
                            'left': '',
                            'padding-left': '',
                            'padding-right': ''
                        });
                        $('.filterBtn').css('background-color', '#fff');
                        $('p.sort-by').css('color', '#777');
                        $('.sort-by select').css('color', '#777');
                        $('.unbxd-grid_result_layout').css(
                                'background', 'url("http://s3.amazonaws.com/unbxd-images/ss-sprite-css-19px.png")no-repeat -20px 0px');
                        $('.unbxd-list_result_layout').css(
                                'background', 'url("http://s3.amazonaws.com/unbxd-images/ss-sprite-css-19px.png")no-repeat 0px 0px');
                        $('.customBucket').css('color', '#282f39');
                        $('.filterText').css('color', '#000');
                        $('.slicknav_icon-bar').css('background-color', '#282f39');
                        $('.mod').css('color', '#777');
                        $('.unbxd-facets_container').css({
                            position: 'absolute',
                            top: '51px',
                            left: '25px',
                            'margin-top': '0px',
                            'max-height': 'none',
                            'overflow': 'scroll',
                            'height': 'auto'
                        });
                    }
                });
            }
            , sanitizeQueryString: function (q) {
                if(typeof unbxd_category_page === "undefined" || unbxd_category_page !== 1) {
                    return q;                    
                } else {
                    return window.location.pathname;
                }
            }
            , getFacetStats: ""
            , processFacetStats: function (obj) {}
            , setDefaultFilters: function () {}
            , onIntialResultLoad: function (obj) {
                if (obj.response.numberOfProducts == 1)
                {
                    window.location.replace(obj.response.products[0].productUrl);
                }

                $('.ssitemlist_cell .quick-view-btn').bind('click', function () {
                    showPopUp(this);
                });

                $('.ssitemlist_cell .quick_view_info .close').bind('click', function () {
                    hidePopUp(this);
                });

                $('.modal-backdrop').bind('click', function () {
                    hidePopUp(this);
                });


                $('.add-to-cart').bind('click', eh.addItemToCart);
            }
            , onPageLoad: function (obj) {
                
                $('.ssitemlist_cell .quick-view-btn').bind('click', function () {
                    showPopUp(this);
                });

                $('.ssitemlist_cell .quick_view_info .close').bind('click', function () {
                    hidePopUp(this);
                });

                $('.modal-backdrop').bind('click', function () {
                    hidePopUp(this);
                });
                
                $('.add-to-cart').bind('click', eh.addItemToCart);
            }
            , onNoResult: function (obj) {
                jQuery('#unbxd-selectedfacetscontainer').hide('fast');
                jQuery('#clickmore').hide('fast');
                jQuery('#spinnerContainer').hide('fast');
                jQuery('#unbxd-options').hide('fast');
                if(typeof unbxd_category_page === "undefined" || unbxd_category_page !== 1) {
                    $('#unbxd-search_results').html('<h2 id="unbxd_no_results" >No result found for your search of \'<span>' + escapeHtml(obj.searchMetaData.queryParams.q) + '\'</span></h2><div id="unbxd_recommended_for_you" ></div>');
                } else {
                    $('#unbxd-search_results').html('<h2 id="unbxd_no_results" >No result found for this category.</h2><div id="unbxd_recommended_for_you" ></div>');
                }
                Unbxd.refreshWidgets();
                Unbxd.refreshWidgets();
            }
            , fields: ['*']
        };

        searchConfigMobile = {
            siteName: 'knobbery_com-u1456916527166'
            , APIKey: '2a500347e97c02f229205d2654332a3c'
            , type: (pType === 'browse') ? 'browse' : 'search'
            , getCategoryId: ''
            , inputSelector: '#search_box_id'
            , searchButtonSelector: '#go'
            , searchQueryParam: "query"
            , spellCheck: '#unbxd-did_you_mean'
            , spellCheckTemp: 'Did you mean <a href = "{{{getSuggestionUrl suggestion}}}" target="_self">{{suggestion}}</a> ?</h3>'
            , searchQueryDisplay: '.mod'
            , searchQueryDisplayTemp: (typeof unbxd_category_page === "undefined" || unbxd_category_page !== 1) ? 'Search Results For {{query}} ({{numberOfProducts}} Results)' : ''
            , pageSize: 24
            , searchResultSetTemp: '{{#products}}'
                    + '<div class="ssitemlist_cell" unbxdattr="product" unbxdparam_sku="{{uniqueId}}" unbxdparam_prank="{{unbxdprank}}">'
                    + '<div class="ssitemlist_celldisplay">'
                    + '<a href="{{productUrl}}">'
                    + '<img src="{{imageUrl}}" border="0" target="_self">'
                    + '</a>'
                    + '</div>'
                    + '<div class="ssitemlist_label">'
                    + '<a href="{{productUrl}}" old_content="{{title}}" target="_self">{{title}}</a>'
                    + '</div>'
                    + '<div class="ssitemlist_line">'
                    + '<span class="line"></span>'
                    + '</div>'
                    + '<div class="ssitemlist_price">${{showDecimal price}}'
                    + '{{#isDiscountApplicable Original_price price}}'
                    + '<span class="ssitemsavings">SAVE ${{discount price Original_price}}</span>'
                    + '{{/isDiscountApplicable}}'
                    + '</div>'
                    + '{{#isDiscountApplicable Original_price price}}'
                    + '<div class="discount">{{calculateDiscount Original_price price}}</div>'
                    + '{{/isDiscountApplicable}}'
                    + '</div>'
                    + '{{/products}}'
            , searchResultContainer: '#unbxd-search_results'
            , isClickNScroll: true
            , clickNScrollElementSelector: '#clickmore'
            , isAutoScroll: false
            , sortContainerSelector: '#unbxd-sorting'
            , sortOptions: [{
                    name: 'Relevancy'
                }, {
                    name: 'Name: A-Z',
                    field: 'title',
                    order: 'asc'
                }, {
                    name: 'Name: Z-A',
                    field: 'title',
                    order: 'desc'
                }, {
                    name: 'Price: Low to High',
                    field: 'price',
                    order: 'asc'
                }, {
                    name: 'Price: High to Low',
                    field: 'price',
                    order: 'desc'
                }]
            , sortContainerType: 'select'
            , sortContainerTemp: [
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
            , facetTemp: [
                '<ul id="unbxd-facets">'
                        , '{{#facets}}'
                        , '<li class="facet_container" id="unbxd-{{name}}_container" style="{{#customvalue @index 3}} display:none; {{/customvalue}}">'
                        , '<a class="facet_title open" title="{{name}}">{{name}}</a>'
                        , '<ul class="element_container">'
                        , '{{#selected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" >'
                        , '<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '{{prepareFacetValue value}}'
                        , '<span class="unbxd-facet_count">({{count}})</span>'
                        , '</label>'
                        , '</li>'
                        , '{{/selected}}'
                        , '{{#unselected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" style="{{#customvalue @index 4}} display:none; {{/customvalue}}">'
                        , '<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '{{prepareFacetValue value}}'
                        , '<span class="unbxd-facet_count">({{count}})</span>'
                        , '</label>'
                        , '</li>'
                        , '{{/unselected}}'
                        , '{{#customgt unselected.length 4}}'
                        , '<li class="show_more" onclick="getView(this,4)">Show More Options</li>'
                        , '{{/customgt}}'
                        , '</ul>'
                        , '</li>'
                        , '{{/facets}}'
                        , '{{#rangefacets}}'
                        , '<li class="facet_container" id="unbxd-{{name}}_container" style="display:none;>'
                        , '<a class="facet_title open" title="{{name}}">{{name}}</a>'
                        , '<ul class="element_container">'
                        , '{{#selected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" >'
                        , '<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '${{prepareFacetValue begin}} - ${{prepareFacetValue end}} ({{count}})'
                        , '</label>'
                        , '</li>'
                        , '{{/selected}}'
                        , '{{#unselected}}'
                        , '<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" style="{{#customvalue @index 4}} display:none; {{/customvalue}}">'
                        , '<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}">'
                        , '<label for="{{../facet_name}}_{{value}}" class="option_link highlight">'
                        , '${{prepareFacetValue begin}} - ${{prepareFacetValue end}} ({{count}})'
                        , '</label>'
                        , '</li>'
                        , '{{/unselected}}'
                        , '{{#customgt unselected.length 4}}'
                        , '<li class="show_more" onclick="getView(this,4)">Show More Options</li>'
                        , '{{/customgt}}'
                        , '</ul>'
                        , '</li>'
                        , '{{/rangefacets}}'
                        , '</ul>'
                        , '{{#customfacet facets rangefacets}}'
                        , '<div class="facetBtn" style="display: block;" onclick="getFacetView(this)">More Filters</div>'
                        , '{{/customfacet}}'].join('')
            , facetContainerSelector: "#unbxd-filters"
            , facetCheckBoxSelector: "input[type='checkbox']"
            , facetElementSelector: "label"
            , noEncoding: true
            , facetOnSelect: function (el) {
                //jQuery(el).addClass('selected');
            }
            , facetOnDeselect: function (el) {
                //jQuery(el).removeClass('selected');
            }
            , facetMultiSelect: true
            , selectedFacetTemp: [
                '<h3 id="unbxd-summary_header" style="display: block;">Refinements</h3>'
                        , '<ul id="unbxd-summary" style="display: block;">'
                        , '{{#each filters}}'
                        , '{{#each this}}'
                        , '<li class="selected-facet clearfix" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">'
                        , '<img src="http://classwithapps.com/wp-content/uploads/2013/02/close.png" height="14" width="14"/>'
                        , '<span class="unbxd-summary_label">{{customname this}} : </span>'
                        , '<span class="unbxd-summary_value" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">{{{prepareFacetValue @key}}}</span>'
                        , '</li>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '{{#each ranges}}'
                        , '{{#each this}}'
                        , '<li class="selected-facet clearfix" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">'
                        , '<img src="http://classwithapps.com/wp-content/uploads/2013/02/close.png" height="14" width="14"/>'
                        , '<span class="unbxd-summary_label">{{customname this}} : </span>'
                        , '<span class="unbxd-summary_value" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">{{{getsign @key}}}</span>'
                        , '</li>'
                        , '{{/each}}'
                        , '{{/each}}'
                        , '</ul>'
                        , '<div id="clearAll"> Clear </div>'].join('')
            , selectedFacetContainerSelector: "#unbxdselectedfacets"
            , clearSelectedFacetsSelector: "#clearAll"
            , removeSelectedFacetSelector: ".selected-facet.clearfix"
            , selectedFacetHolderSelector: ""
            , loaderSelector: "#unbxd-loading"
            , onFacetLoad: function (obj) {
                if (obj.response.numberOfProducts >= 1) {
                    //jQuery('#unbxd-did_you_mean').css('display', 'none');
                }
                jQuery('#unbxd-options').show('fast');

                $('.filterBtn').unbind('click').bind('click', function () {
                    $('#outerwrapper').hide();
                    $('.top-banner').hide();
                    $('#big-overlay').show();
                    $('#mobile-filter').show();
                    $('#back-btn').show();
                });

                $('.ssitemlist_cell .quick-view-btn').bind('click', function () {
                    showPopUp(this);
                });

                $('.ssitemlist_cell .quick_view_info .close').bind('click', function () {
                    hidePopUp(this);
                });

                $('.modal-backdrop').bind('click', function () {
                    hidePopUp(this);
                });
                
                $('.add-to-cart').on('click', eh.addItemToCart);                
            }
            , sanitizeQueryString: function (q) {
                if(typeof unbxd_category_page === "undefined" || unbxd_category_page !== 1) {
                    return q;                    
                } else {
                    return window.location.pathname;
                }
            }
            , getFacetStats: ""
            , processFacetStats: function (obj) {}
            , setDefaultFilters: function () {}
            , onIntialResultLoad: function (obj) {
                if (obj.response.numberOfProducts == 1)
                {
                    window.location.replace(obj.response.products[0].productUrl);
                }

                $('.ssitemlist_cell .quick-view-btn').bind('click', function () {
                    showPopUp(this);
                });

                $('.ssitemlist_cell .quick_view_info .close').bind('click', function () {
                    hidePopUp(this);
                });

                $('.modal-backdrop').bind('click', function () {
                    hidePopUp(this);
                });

                $('.add-to-cart').bind('click', eh.addItemToCart);
            }
            , onPageLoad: function (obj) {
                $('.add-to-cart').bind('click', eh.addItemToCart);                
            }
            , onNoResult: function (obj) {
                jQuery('#spinnerContainer').hide('fast');
                jQuery('#clickmore').hide('fast');
                jQuery('#unbxd-options').hide('fast');
                if(typeof unbxd_category_page === "undefined" || unbxd_category_page !== 1) {
                    $('.unbxd-results_container').html('<h2 id="unbxd_no_results" >No result found for your search of \'<span>' + escapeHtml(obj.searchMetaData.queryParams.q) + '\'</span></h2><div id="unbxd_recommended_for_you" ></div>');
                } else {
                    $('.unbxd-results_container').html('<h2 id="unbxd_no_results" >No result found for this category.</span></h2><div id="unbxd_recommended_for_you" ></div>');                    
                }
                Unbxd.refreshWidgets();
                Unbxd.refreshWidgets();
            }
            , bannerSelector: ".banner"
            , bannerTemp: "<a href='{{landingUrl}}'><img src='{{imageUrl}}'/></a>"
            , fields: ['*']
        };
    };
})();


//var uri = document.URL;
//    var queryString = {};
//    uri.replace(
//        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
//        function($0, $1, $2, $3) { queryString[$1] = $3; }
//    );

//function replace_itemlist(array) {
//    var $_itemlist_element = $('#table__nlitemlist td');
//    var $_nums = 4;
//    var $_row_index = 0;
//    for (var i = 0; i < array.length; i++)
//    {
//        if ((i % $_nums) == 0)
//        {
//            $_row_index++;
//            $_itemlist_element.append('<div class="rows" rel="' + $_row_index + '"><div class="itemlist_cell">' + array[i] + '</div></div>');
//        } else {
//            $_itemlist_element.find('.rows:last').append('<div class="itemlist_cell">' + array[i] + '</div>');
//        }
//    }
//    resizeListing();
//}

 
  
