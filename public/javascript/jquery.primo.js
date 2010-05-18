/*!
 * jQuery Primo JavaScript Library v0.1
 * http://www.libis.be
 *
 * Copyright (c) 2009 Libis
 *
 * Date:    
 * Revision:  
 */
(function($){
$.primo = {
	debug: false,
    version: "0.1",
    error: {
        messages: [],
        show: function(message) {
			jQuery.primo.log(message);
            jQuery.primo.error.messages.push(message);
		//	jQuery.primo.ui.refresh("#main", 'error');
        },
        last: function() {
            if (jQuery.primo.error.messages.length > 0) {
                return jQuery.primo.error.messages.pop();
            }

            return "";
        }
    },
    params: {
        layout: 'default',
        base_dir: './',
        template_dir: "",
		authenticity_token: null,
		view: 'main',
        customers: {},
        news: [],
        search: {
            query: [],
			type: 'simple',
			remote:false,
			database:'local,KUL'
        },
        results: {
			currentFullHoldings: [],
			currentFull: 0,
            facets: [],
            records: {
				page: 1,
				step: 10,
                total: 0,
                from: 0,
                to: 0,
				showing_index: 0,
                data: []
            }
        },
        typeIcons: {
		  article : 'images/materials/article.gif',
		  audio   : 'images/materials/audio.gif',
          book    : 'images/materials/book.gif',
		  group	  : 'images/materials/group.gif',
		  image   : 'images/materials/image.gif',
		  journal : 'images/materials/journal.gif',
		  map     : 'images/materials/map.gif',
          score   : 'images/materials/score.gif',
 		  text    : 'images/materials/text.gif',
		  video   : 'images/materials/video.gif',
          other   : 'images/materials/text_plus.gif'
        }
    },
    log: function(message) {
		if (jQuery.primo.debug) {
	        if (window.console) {
	            console.log(message);
	        } else {
	            alert(message);
	        }
		}
    },
    wait_until_done: function(expression) {
        var result = 0;

        for (var i = 0; i < expression.length; i++) {
            if (expression[i] == true) result += 1;
        }
        if (result != expression.length) {
            setTimeout(function() {
                jQuery.primo.wait_until_done(expression)
            },
            1000);
        }
    }
};
jQuery.primo.ui = {
	init : function() {	
		jQuery.fragmentChange(true);

		jQuery(document).bind("fragmentChange", function(e){
			var frag = jQuery.fragment(e.fragment);
			if (jQuery.primo.ui.context.parse()) {			
				jQuery.primo.search.query({selector:'#main', html:jQuery.primo.params.view});				
			}
		});
	
		var frag = jQuery.fragment();
		if (frag['context']) {
			jQuery(document).trigger("fragmentChange");			
		}
		else {		
			if (frag['layout']) {
				jQuery.primo.ui.layout(frag.layout);
			}
			else {
				jQuery.primo.ui.layout(null);
			}

			$('script[name=defaultapp]').remove();				
			jQuery('head').append('<script type="text/javascript" src="' + jQuery.primo.params.template_dir + '/javascript/application.js" name="defaultapp"></script>');										
		
		}		       
		$(document).ajaxStart(function(){$('#ajaxBusy').show();})
				   .ajaxStop(function(){$('#ajaxBusy').hide();})
				   .ajaxError(function(){$('#ajaxBusy').hide();});	
	},	
    layout : function(layoutName) {
       	if (layoutName == null) {			
            layoutName = jQuery.primo.params.layout;
            if (layoutName == null) {
                layoutName = 'default';
            }
		}

		$('link[name=defaultcss]').remove();
        $('head').prepend('<link rel="stylesheet" href="' +
        					jQuery.primo.params.base_dir + "templates/" + layoutName +
        					'/css/application.css' + '" type="text/css" media="screen" name="defaultcss">');
        jQuery.primo.params.layout = layoutName;
		jQuery.primo.params.template_dir = jQuery.primo.params.base_dir + "templates/" + jQuery.primo.params.layout;				
    },
    html_append : function(selector, templateName) {
        var html = this.html_load(templateName);
        $(selector).append(html);
    },
	html_load_new : function(templateName) {
		return this.html_load(templateName);
	},
	html_load : function(templateName) {
			var html_snippet = "";
	        $.ajax({
	            async: false,
	            url: jQuery.primo.params.template_dir + '/html/' + templateName + '.html',
	            cache: false,
	            dataType: "html",
	            dataFilter: function(data) {
					var strFunction = "";
					try {
 						strFunction = "var p=[],print=function(){p.push.apply(p,arguments);}; with(obj){p.push('" +
						data.replace(/[\r\t\n]/g, " ")
					       .replace(/'(?=[^#]*#>)/g, "\t")
					       .split("'").join("\\'")
					       .split("\t").join("'")
					       .replace(/<#=(.+?)#>/g, "',$1,'")
					       .split("<#").join("');")
					       .split("#>").join("p.push('")
					       + "');}return p.join('');";

						aFunction = new Function("obj", strFunction);
						response_data = aFunction(jQuery.primo.params);
						
						if (jQuery.primo.error.messages.size > 0) {
							jQuery.primo.ui.refresh("#main", 'error');
							return '';
						}
						
						
						return response_data;
					}
					catch(e){
						jQuery.primo.log('Error loading template "' + templateName + '" <br />' + e.message + "<br/> <br/>" + strFunction );
						jQuery.primo.error.show('Error loading template "' + templateName + '" <br />' + e.message + "<br/> <br/>" + strFunction );
					}		
	            },
	            success: function(html) {
	                html_snippet = html;
	            }
	        });
			return html_snippet;
	    },
	refresh : function(selector, state){
	
		var refresh_markers = ['main', 'brief', 'full', 'result'];
		var views = ['main', 'brief', 'full'];
		
	    if (state == null) {
			state = 'application';
		}
		
		data = this.html_load(state);

		if (jQuery.inArray(state, refresh_markers) != -1) {	
			if (jQuery.inArray(state, views) != -1) {	
				jQuery.primo.params.view = state;
			}
			if (jQuery.primo.ui.context.parse({update:false})) {
				jQuery.primo.ui.context.build();
			}
		}
						
		jQuery(selector).empty().append(data);
	},
	context: {
		build: function() {
			try {
				var context = {  "page": jQuery.primo.params.results.records.page, 
								 "view": jQuery.primo.params.view, 
								 "record": jQuery.primo.params.results.currentFull,
								 "search": jQuery.primo.params.search  };	
			
				jQuery.setFragment({ "layout"  : jQuery.primo.params.layout, 
									 "context" : jQuery.primo.base64.encode(jQuery.toJSON(context))}); 				
//									 "context" : jQuery.primo.base64.encode(unescape( encodeURIComponent(jQuery.toJSON(context))))}); 
			}
			catch(e) {
				jQuery.primo.log(e.stack);
			}
		},		
		parse: function(options) { 
			try {
				settings = jQuery.extend({update: true}, options);				
				var fragment = jQuery.fragment();
				var context_changed = false;
			
				var page = 1;
				var search = {
		            query: "",
		            filters: []
		        };
				var layout = 'default';		
				var view   = 'main';
				var record = 1;

			
				if ('context' in fragment) {
					var context = jQuery.evalJSON(jQuery.primo.base64.decode(fragment.context));					
//					var context = jQuery.evalJSON(jQuery.primo.base64.decode(decodeURIComponent( escape(fragment.context))));
				
					if ('page' in context) {
						page = context.page;
					}
				
					if ('view' in context) {
						view = context.view;
					}
				
					if ('record' in context) {
						record = context.record;
					}
				
					if ('search' in context) {
						search = context.search;
					}												
				}
			
				if ('layout' in fragment) {
					layout = fragment.layout;
				}
			
				if (page != jQuery.primo.params.results.records.page) {
//					jQuery.primo.log('page changed');
					if (settings.update) jQuery.primo.params.results.records.page = page;				
					context_changed = true;
				}
				if (jQuery.toJSON(search) !== jQuery.toJSON(jQuery.primo.params.search)) {
//					jQuery.primo.log('search changed');
					if (settings.update) jQuery.primo.params.search = search;
					context_changed = true;
				}			

				if (view != jQuery.primo.params.view) {
//					jQuery.primo.log('view changed');
					if (settings.update) jQuery.primo.params.view = view;
					context_changed = true;
				}

				if (record != jQuery.primo.params.results.currentFull) {
//					jQuery.primo.log('record changed');
					if (settings.update) jQuery.primo.params.results.currentFull = record;
					context_changed = true;
				}

				if (layout != jQuery.primo.params.layout) {
//					jQuery.primo.log('layout changed');
					jQuery.primo.ui.layout(layout);        	

					$('script[name=defaultapp]').remove();								
					jQuery('head').append('<script type="text/javascript" src="' + jQuery.primo.params.template_dir + '/javascript/application.js"></script>');										

					context_changed = true;				
				}
						
				if ($('script[name=defaultapp]').length == 0 && $('link[name=defaultcss]').length == 0 ) {
					jQuery.primo.ui.layout(null);
					$('script[name=defaultapp]').remove();								
					jQuery('head').append('<script type="text/javascript" src="' + jQuery.primo.params.template_dir + '/javascript/application.js"></script>');														
				}			
										
				return context_changed;
			}
			catch(e){
				jQuery.primo.log(e.stack);
			}
		}
	},
	
	thumbnail: function(options) {
		settings = jQuery.extend({'order': ['syndetics', 'google', 'libis'], 'isbn': ''}, options);
		
		function run_loader(loader_to_run, selector, isbns) {
			var loaders = { 
				syndetics: function(selector, isbns){
					var isbn = isbns[0];
					var url = 'http://syndetics.com/index.aspx?isbn='+ isbn +'/SC.JPG&client=CLIENT';
					var cover_image = new Image();
					
					$(cover_image).load(function () {
						if (this.height > 1 && this.width > 1) {
							jQuery(selector).append(jQuery('<img />').attr('src', this.src));
						}
						else {
							run_loader(loader_order.pop(), selector, isbns);									
						}						
					}).error(function(){}).attr('src', url);					
				},
				google: function () {
					var isbn = isbns[0];
					var url = 'http://books.google.com/books?bibkeys=ISBN:' + isbn + '&jscmd=viewapi&callback=?';
					var cover_url = "";

					jQuery.getJSON(url, function(data) {
						if ('thumbnail_url' in data) {
							jQuery(selector).append(jQuery('<img />').attr('src', data.thumbnail_url));
						}
						else {
							run_loader(loader_order.pop(), selector, isbns);
						}
					});									
				},
				libis: function () {
					var isbn = isbns[0];
					var url = 'http://webservices.bibliotheek.be/cgi/IdIcoon.pl?func=cover&coversize=small&ISBN=' + isbn;
					var cover_image = new Image();
					
					$(cover_image).load(function () {
						if (this.height > 1 && this.width > 1) {
							jQuery(selector).append(jQuery('<img />').attr('src', this.src));
						}
						else {
							run_loader(loader_order.pop(), selector, isbns);									
						}						
					}).error(function(){}).attr('src', url);								
				}
				
			};
						
			if (loader_to_run in loaders){
			 loaders[loader_to_run](selector, isbns);	
			}
		};
		
		if ('selector' in settings) {
			var isbns = []
			if ('isbn' in settings) {
				if (settings.isbn.length > 0) {			
					isbns = settings.isbn.replace(/-/g, '').split(',');
				}
			}
			
			
			if (isbns.length == 0) return "";
			loader_order = settings.order;	
			loader_order.reverse();		
				
			run_loader(loader_order.pop(), settings.selector, isbns);									
		}				
	},
	
	build_feed_url: function() {
		var fragment = jQuery.fragment();
		var base = document.location.host;
		var context = "";
		
		if ("context" in fragment) {
			context = fragment.context;
		}
		
		if (context.length > 0) {
			return 'http://' + base + '/searches/' + encodeURIComponent(context) + '/feed';
		}
		
		return "";
	}
};


jQuery.primo.search = {
	query: function(options) {
//Defaults		
        var settings = jQuery.extend({selector: '#main',
						          	  html: "brief",
									  page: 1,
									  search_form: '',
									  query: '' }, options);

//Calculate pagination	
	   var page = settings.page;	
       var step = jQuery.primo.params.results.records.step;
       var from = (page * step) - (step - 1);
       var to = (page * step);

       jQuery.primo.params.results.records.from = from;
       jQuery.primo.params.results.records.to = to;

//Determine if it is a simple or advanced search
	   var search_type = 'simple';
	
		if (settings.query.length == 0 && settings.search_form.length > 0) {
			search_type = 'advanced';
		}
		jQuery.primo.params.search.type = search_type;

//build query
		var query = ''
		if (search_type == 'simple'){
			if (settings.query.length == 0 || settings.query == 'Find it, get it') {
				if (jQuery.primo.params.search.query == null || jQuery.primo.params.search.query.length == 0) {
					return;
				}
				
				query = jQuery.primo.search.print_query_as_string({display_facet: true});
			}else {
			 	query = settings.query;			
			}
		}else if (search_type == 'advanced'){
			var queries = [];
			jQuery.each($(settings.search_form + ' .query_row'), function(){ 
				query_rows = $(this);
				jQuery.each(query_rows, function(){
					query_row = $(this);
				 	index = $(query_row.find('.index')).val();
					match = $(query_row.find('.match')).val();
					term  = $(query_row.find(' .term')).val();	
					queries.push({"index" : index, "match" : match, "term" : term});
				});			
			});		
			jQuery.primo.params.search.query = queries;		
			query = jQuery.primo.search.print_query_as_string({display_facet: true});	
		}



//Setup and run									
       var data_blob = {
            'authenticity_token': jQuery.primo.search.token(),
			'query': query,
            'from': from,
			'type': jQuery.primo.params.search.type,
			'remote': jQuery.primo.params.search.remote,
			'database': jQuery.primo.params.search.database		
        };

		jQuery.primo.search.execute(data_blob, settings);									
		
	},
	token: function() {
		var token='';
		
        jQuery.ajax({
            async: false,
            type: "get",
            url: 'sessions/token',
            dataType: "json",
            success: function(data) {
                jQuery.primo.params.authenticity_token = token = data.authenticity_token;
            }
        });		

		return token;
	},
	execute: function(data_blob, settings) {
        jQuery.ajax({
            async: false,
            type: "POST",
            url: 'searches',
            data: data_blob,
            dataType: "json",
            success: function(data) {
				jQuery.primo.params.search.query = data.query;

                if (data['error']) {
                    jQuery.primo.log(data.error);
                    jQuery.primo.params.results.facets = {
                        facets: []
                    }
                    jQuery.primo.params.results.records.from = 0;
                    jQuery.primo.params.results.records.to = 0;
                    jQuery.primo.params.results.records.total = 0;
                    jQuery.primo.params.results.records.data = {
                        records: []
                    };
                }
                else {
                    jQuery.primo.params.results.facets = data.facets;
                    jQuery.primo.params.results.records.from = data.records.from;
                    jQuery.primo.params.results.records.to = data.records.to;
                    jQuery.primo.params.results.records.total = data.records.total;
                    jQuery.primo.params.results.records.data = data.records.data;
                }
                if (!jQuery.primo.debug) pageTracker._trackPageview('/search/' + jQuery.primo.search.print_query_as_string({display_facet: true}));			
            },
			complete: function(){
				jQuery.primo.ui.refresh(settings.selector, settings.html);				
			},
            timeout: 3000,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                jQuery.primo.error.show('Error loading search <br />' + textStatus);
            }
        });		
	},
	print_query_as_string: function(options) {
		var settings = jQuery.extend({display_facet:false,								  
								      no_display:[]}, options);
		
		if (jQuery.primo.params.search.query instanceof Array) {
			var query = "";
			jQuery.each(jQuery.primo.params.search.query, function(){
				
				if (settings.display_facet == false) {
					if (this.index.match(/facet_.*/) != null) {
						return;
					}
				}
				
				if (jQuery.inArray(this.index, settings.no_display) == -1) {												
					if (this.term.length > 0) {
						if (query.length > 0) {
							query = query + " ";
						}
				
						query = query + this.index + ":";
						if (this.match == "exact") {
							query = query + '"' + this.term + '"';
						}
						else {
							query = query + this.term; 
						}
					}
				}
			});	
			return query;								
		}
		else {
			return jQuery.primo.params.search.query;
		}		
	}


};


jQuery.primo.feedback = {
	send : function(subject, feedback, email) {
		
		var postData = {
			'subject' : subject,
			'feedback' : feedback,
			'email'	   : email,
			'stack'    : jQuery.toJSON(jQuery.primo.params)
		};
		
										
		jQuery.ajax({
			data:postData,
			async:false,
			type:'POST',
			url: '/lbs-ws/sendFeedback.cgi',
			dataType:'json',
			timeout: 3000,
			success: function(data, textStatus) {
				if (data.error) {
					jQuery.primo.error.show('Error processing feedback <br />' + data.error);
				}
	        },
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				jQuery.primo.error.show('Error sending feedback <br />' + textStatus);
			}
		})
		

	}
}/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

jQuery.primo.base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = jQuery.primo.base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = jQuery.primo.base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
	
};



})(jQuery);


$(document).ready(function() {
 jQuery.primo.ui.init();
});
