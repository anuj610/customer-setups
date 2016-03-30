Handlebars.registerHelper('customsafestring', function(str)
{
                var output  =   str
                ,q = jQuery.trim(jQuery(".unbxd-query")[0].auto.previous +'');

            if(q.indexOf(' ')){
                var arr = q.split(' ');
                for(var k in arr){
                    if(!arr.hasOwnProperty(k))continue;

                    var l   = output.toLowerCase().lastIndexOf("</strong>");
                    if(l != -1) l += 9;
                    output = output.substring(0,l) + output.substring(l).replace(new RegExp(arr[k].replace(/([\\{}()|.?*+\-\^$\[\]])/g,'\\$1'), 'gi') , function($1){
                        return '<strong>'+$1+'<\/strong>';
                    });
                }
            }else{
                var st = output.toLowerCase().indexOf( q );
                output = st >= 0 ? output.substring(0,st) + '<strong>' + output.substring(st, st+q.length) + '</strong>' + output.substring(st+q.length) : output;
            }

            return new Handlebars.SafeString(output);
});
unbxdAutoSuggestFunction($, Handlebars);
$(function(){
    var relative_url = window.location.origin;
    var relative_search_url = relative_url + '/search-results';
        $(".unbxd-query").unbxdautocomplete({
            siteName : 'knobbery_com-u1456916527166'
            ,APIKey : '2a500347e97c02f229205d2654332a3c'
            ,minChars : 1
            ,delay : 100
            ,loadingClass : 'unbxd-as-loading'
            ,mainWidth : $('#search_box_id').length ? $('#search_box_id').outerWidth() : 280
            ,zIndex : 0
            ,position : 'absolute'
            ,template : "1column"
            ,mainTpl: ['inFields', 'keywordSuggestions', 'topQueries','popularProducts']
            ,sideContentOn : "left"
            ,showCarts : false
            ,cartType : "separate"
            ,noResultTpl: function(query){
                return 'Press \'Enter\' for relevant results';
            }
            ,onSimpleEnter : function(){
                this.input.form.submit();
            }
            ,onItemSelect : function(data,original){
                if (data.type == "IN_FIELD") {
                    if (data.filtername)
                        window.location = relative_search_url + '?query=' + encodeURI(data.value) + '&filter=' + data.filtername+ '_fq:' + encodeURI('"' + data.filtervalue + '"')
                    else
                        this.input.form.submit();

                } else if (data.type == "POPULAR_PRODUCTS") {
                    window.location = original.productUrl;
                } else {
                    this.input.form.submit();
                }
            }
            ,inFields:{
                count: 2
                ,fields:{
                    'Finish_Group': 2,
                    'Collection':2,
                    'Item_Type':2
                }
                ,header: ''
                ,tpl: ''
            }
            ,topQueries:{
                count: 3
                ,header: ''
                ,tpl: ''
            }
            ,keywordSuggestions:{
                count: 3
                ,header: ''
                ,tpl: ''
            }
            ,processResultsStyles: function(fpos){
                function toggleViewMore(pDisplayFlag, pResult) {
                    if( pDisplayFlag ) {
                        if($('#unbxd-message').size()) {
                            $('#unbxd-message').html(pResult);                            
                            $('#unbxd-message').css('display','block');
                        } else {
                            var viewMoreElem = $('<li>', {id:'unbxd-message'});
                            viewMoreElem.html(pResult);                            
                            $('ul.unbxd-as-maincontent').append(viewMoreElem);
                        }
                    } else {
                        if($('#unbxd-message').size()) {
                            $('#unbxd-message').css('display','none');
                        }
                    }
                }
                
                function addHeading() {
                    if( !$('ul.unbxd-as-maincontent').children(':first').hasClass('unbxd-as-header') ) {
                        var searchHead = $('<li>', {class:'unbxd-as-header'});                 
                        searchHead.html('SEARCH SUGGESTIONS');  
                        $('ul.unbxd-as-maincontent').prepend(searchHead);
                    }
                }
                
                if (this.currentResults) {
                    if(this.currentResults.KEYWORD_SUGGESTION && this.currentResults.KEYWORD_SUGGESTION.length ) {   
                        var result = '<a href="'+relative_search_url+'?query='+this.currentResults.KEYWORD_SUGGESTION[0].autosuggest+'">See more results for "'+this.currentResults.KEYWORD_SUGGESTION[0].autosuggest+'"';
                        toggleViewMore(true, result);
                        addHeading();
                    }
                    else if (this.currentResults.IN_FIELD && this.currentResults.IN_FIELD.length) {
                        var result = '<a href="'+relative_search_url+'?query='+this.currentResults.IN_FIELD[0].autosuggest+'">See more results for "'+this.currentResults.IN_FIELD[0].autosuggest+'"';
                        toggleViewMore(true, result);
                        addHeading();
                    }
                    else if( this.currentResults.TOP_SEARCH_QUERIES && this.currentResults.TOP_SEARCH_QUERIES.length ) {
                        var result = '<a href="'+relative_search_url+'?query='+this.currentResults.TOP_SEARCH_QUERIES[0].autosuggest+'">See more results for "'+this.currentResults.TOP_SEARCH_QUERIES[0].autosuggest+'"';
                        toggleViewMore(true, result);
                        addHeading();
                    } 
                    else {
                        toggleViewMore(false);
                    }
                }
                
                return fpos;
            }
            ,popularProducts:{
                count: 4
                ,price: true
                ,priceFunctionOrKey : function(obj){
                    return obj.price.toFixed(2);
                }
                ,image: true
                ,imageUrlOrFunction: "imageUrl"
                ,currency : "$"
                ,view:'list'
                ,header: 'PRODUCTS'
                ,tpl: ['{{#if ../showCarts}}'
                        ,'{{#unbxdIf ../../cartType "inline"}}'
                            ,'<div class="unbxd-as-popular-product-inlinecart">'
                                ,'<div class="unbxd-as-popular-product-image-container">'
                                    ,'{{#if image}}'
                                    ,'<img src="{{image}}"/>'
                                    ,'{{/if}}'
                                ,'</div>'
                                ,'<div  class="unbxd-as-popular-product-name">'
                                    ,'<div style="table-layout:fixed;width:100%;display:table;">'
                                        ,'<div style="display:table-row">'
                                            ,'<div style="display:table-cell;text-overflow:ellipsis;overflow: hidden;white-space: nowrap;">'
                                                ,'{{{safestring highlighted}}}'
                                            ,'</div>'
                                        ,'</div>'
                                    ,'</div>'
                                ,'</div>'
                                ,'{{#if price}}'
                                    ,'<div class="unbxd-as-popular-product-price">'
                                        ,'{{currency}}{{price}}'
                                    ,'</div>'
                                ,'{{/if}}'
                                ,'<div class="unbxd-as-popular-product-quantity">'
                                    ,'<div class="unbxd-as-popular-product-quantity-container">'
                                        ,'<span>Qty</span>'
                                        ,'<input class="unbxd-popular-product-qty-input" value="1"/>'
                                    ,'</div>'
                                ,'</div>'
                                ,'<div class="unbxd-as-popular-product-cart-action">'
                                    ,'<button class="unbxd-as-popular-product-cart-button">Add to cart</button>'
                                ,'</div>'
                            ,'</div>'
                        ,'{{else}}'
                            ,'<div class="unbxd-as-popular-product-info">'
                                ,'<div class="unbxd-as-popular-product-image-container">'
                                    ,'{{#if image}}'
                                    ,'<img src="{{image}}"/>'
                                    ,'{{/if}}'
                                ,'</div>'
                                ,'<div>'
                                ,'<div  class="unbxd-as-popular-product-name">'
                                    ,'{{{customsafestring _original.title}}}'
                                ,'</div>'

                                ,'<div class="unbxd-as-popular-product-cart">'
                                    ,'<div class="unbxd-as-popular-product-cart-action">'
                                        ,'<button class="unbxd-as-popular-product-cart-button">Add to cart</button>'
                                    ,'</div>'
                                    ,'<div class="unbxd-as-popular-product-quantity">'
                                        ,'<div class="unbxd-as-popular-product-quantity-container">'
                                            ,'<span>Qty</span>'
                                            ,'<input class="unbxd-popular-product-qty-input" value="1"/>'
                                        ,'</div>'
                                    ,'</div>'
                                    ,'{{#if price}}'
                                    ,'<div class="unbxd-as-popular-product-price">'
                                        ,'{{currency}}{{price}}'
                                    ,'</div>'
                                    ,'{{/if}}'
                                ,'</div>'
                                ,'</div>'
                            ,'</div>'
                        ,'{{/unbxdIf}}'
                    ,'{{else}}'
                        ,'<div class="unbxd-as-popular-product-info">'
                            ,'<div class="unbxd-as-popular-product-image-container">'
                                ,'{{#if image}}'
                                ,'<img src="{{image}}"/>'
                                ,'{{/if}}'
                            ,'</div>'
                            ,'<div  class="unbxd-as-popular-product-name">'
                                ,'{{{customsafestring _original.title}}}'
                            ,'</div>'
                            ,'{{#if price}}'
                                ,'<div class="unbxd-as-popular-product-price">'
                                    ,'{{currency}}{{price}}<span id="as-price">{{_original.sku}}</span>'
                                ,'</div>'
                            ,'{{/if}}'
                        ,'</div>'
                    ,'{{/if}}'].join('')
            }
            ,filtered : false
        });
    });