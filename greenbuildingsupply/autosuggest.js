(function($) {
    Handlebars.registerHelper('getRatingPosition', function(pRating) {
        if (isNaN(pRating)) {
            return 0;
        }

        return pRating * (-36);
    });
    
    function titleCase(pString) {
        var strArr = pString.split('_');
        var ret_str = '';
        for (var i = 0; i < strArr.length; i++) {
            ret_str += '_' + strArr[i].charAt(0).toUpperCase() + strArr[i].slice(1);
        }
        return ret_str.slice(1);
    }

    unbxdAutoSuggestFunction($, Handlebars);

    window.UnbxdSiteName = "greenbuildingsupply_com-u1465975266578";
    window.UnbxdApiKey = "f48559aa04886d683e2f2c82976fc908";

    $(function () {
        var relative_url = window.location.origin;
        var relative_search_url = relative_url + '/';

        $("#search2").unbxdautocomplete({
            siteName: UnbxdSiteName
            , APIKey: UnbxdApiKey
            , minChars: 1
            , delay: 100
            , loadingClass: ''
            , zIndex: 20
            , position: 'absolute'
            , template: "2column"
            , mainTpl: ['inFields', 'keywordSuggestions', 'topQueries']
            , sideTpl: ['popularProducts']
            , sideContentOn: 'left'
            , sideWidth: '520'
            , mainWidth: $('#hdrSrch form').outerWidth()
            , showCarts: false
            , cartType: "separate"
            , noResultTpl: function (query) {
                return 'No results found for ' + decodeURI(query);
            }
            , onSimpleEnter: function () {
                this.input.form.submit();
            }
            , onItemSelect: function (data, original) {
                if (data.type == "IN_FIELD") {
                    if (data.filtername)
                        window.location = relative_search_url + '?search_query=' + encodeURIComponent(data.value) + '&filter=' + titleCase(data.filtername) + '_fq:' + encodeURIComponent('"' + data.filtervalue + '"')
                    else
                        this.input.form.submit();
                } else if (data.type == "POPULAR_PRODUCTS") {
                    window.location = original.productUrl;
                } else {
                    this.input.form.submit();
                }
            }
            , inFields: {
                count: 2
                , fields: {
                    'brand': 2,
                    'material': 2,
                    'finish': 2,
                    'construction': 2,
                    'installation': 2,
                    'edge': 2
                }
                , header: 'SEARCH SUGGESTIONS'
                , tpl: ''
            }
            , topQueries: {
                count: 4
                , header: ''
                , tpl: ''
            }
            , keywordSuggestions: {
                count: 4
                , header: ''
                , tpl: ''
            }
            , popularProducts: {
                count: 6
                , price: true
                , priceFunctionOrKey: function (obj) {
                    return obj.price.toFixed(2);
                }
                , image: true
                , imageUrlOrFunction: "imageUrl"
                , currency: "$"
                , view: 'list'
                , header: 'POPULAR PRODUCTS'
                , tpl: ['<div class="unbxd-as-popular-product-info">'
                            ,'<div class="unbxd-as-popular-product-image-container">'
                                ,'{{#if image}}'
                                ,'<img src="{{image}}"/>'
                                ,'{{/if}}'
                            ,'</div>'
                            ,'<div  class="unbxd-as-popular-product-name">'
                                ,'{{{_original.title}}}'
                            ,'</div>'
                            ,'<div class="unbxd-as-popular-product-rating">{{#if _original.average_rating_display_numeric}}<span style="background-position: 0px {{getRatingPosition _original.average_rating_display_numeric}}px;"></span>{{/if}}</div>'
                            ,'{{#if price}}'
                                ,'<div class="unbxd-as-popular-product-price">'
                                    ,'<span>{{currency}}{{price}}</span>'
                                ,'</div>'
                            ,'{{/if}}'
                        ,'</div>'].join('')
            }
            , processResultsStyles: function(pPos) {
                //adjusting position
                if(pPos.hasOwnProperty('left') && !isNaN(parseFloat(pPos.left))) {
                    pPos.left = parseFloat(pPos.left) - 3;
                    pPos.left += 'px';
                }
                
                //adjusting position
                if(pPos.hasOwnProperty('top') && !isNaN(parseFloat(pPos.top))) {
                    pPos.top = parseFloat(pPos.top) + 3;
                    pPos.top += 'px';
                }
                
                if( $('.unbxd-as-maincontent .unbxd-as-popular-product ').size() > 0 ) {
                    var main_width_outer = 536;
                    var main_width_inner = 520;
                    var search_box_width = $('#hdrSrch').outerWidth();
                    var diff = main_width_outer - parseFloat(search_box_width);
                    $('.unbxd-as-maincontent').css({'width': main_width_inner + 'px'});
                    
                    pPos.left = parseFloat(pPos.left) - diff;
                    pPos.left += 'px';
                }
                
                return pPos;
            }
            , filtered: true
        });
    });

    (function () {
        var ubx = document.createElement('script');
        ubx.type = 'text/javascript';
        ubx.async = true;
        ubx.src = '//d21gpk1vhmjuf5.cloudfront.net/unbxdAnalytics.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(ubx);
    })();
    (function () {
        var ubx = document.createElement("script");
        ubx.type = "text/javascript";
        ubx.async = true;
        ubx.src = "//d21gpk1vhmjuf5.cloudfront.net/embed.js";
        (document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(ubx);
    })();
})(jQuery);