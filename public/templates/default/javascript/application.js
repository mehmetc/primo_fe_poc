	/**
 * This is the application entry point this will be called just once
 */

var max_article = 5;

$(document).ready(function() {
    $('head').prepend('<link rel="stylesheet" href="' +
    					jQuery.primo.params.template_dir + '/css/jquery.bookmark.css' + '" type="text/css" media="screen" name="bookmarkcss">');
	
	jQuery.primo.debug = false;
//    jQuery.primo.ui.html_append('body', 'google');
//	jQuery.primo.ui.html_append('#lbs-main-container', 'application');

    // ---------------------------------------------------------------------------			
    //LOAD NEWS DATA	
    jQuery.ajax({
		async: false,
        type: "GET",
        url: 'rss.xml',
		cache: false,
        dataType: "xml",
        success: function(data) {
            jQuery.primo.params.news = [];
            $(data).find('channel item').each(function() {
                var item = $(this);
                jQuery.primo.params.news.push({
                    title: item.find('title').text(),
                    url: item.find('link').text(),
                    description: item.find('description').text()
                });
            });
        },
		complete: function(){
			news_loaded = true;
		},
		timeout: 3000,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			jQuery.primo.error.show('Error loading NEWS <br />' + errorThrown);
		}
    });

	jQuery.ajax({
		async:false,
		type: "GET",
		url: "databases",
		cache:false,
		dataType:'json',
		success: function(data){
			jQuery.primo.params.databases = data;
		},
		timeout: 3000,
		error: function() {
			jQuery.primo.params.databases = {"KUL":{"type":"local","load":10,"label":"K.U.Leuven","description":"K.U.Leuven Local Metadata"}};
		}
	})

    // ---------------------------------------------------------------------------
    //LOAD CUSTOMER DATA	
/*    jQuery.ajax({
		async: false,
        type: "GET",
        url: jQuery.primo.params.template_dir + '/javascript/libis.address.js',
		cache: false,
        dataType: "text",
        success: function(data, textStatus) {
            jQuery.primo.params.customers = eval(data);
        },
		complete: function(){
			customers_loaded = true;
		},
		timeout: 3000,
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			jQuery.primo.error.show('Error loading customer data <br />' + textStatus);			
		}
    });
*/
    // ---------------------------------------------------------------------------		
    //UPDATE SCREEN	
    jQuery.primo.ui.refresh('#lbs-main-container');	
//	jQuery.primo.ui.refresh('#main', 'main');	
	
//--------------------------------------------------------------------------------
// EVENTS
//--------------------------------------------------------------------------------
// ---------------------------------------------------------------------------
	//BIND SUBMIT HANDLER for primo search
	jQuery('#searchForm').live('submit',
	function(event) {
//	    event.preventDefault();		
	    jQuery.primo.search.query({query: $('#search_field').val()});
		return false;
	});

	jQuery('#goButton').live('click', function(event) {
		jQuery.primo.search.query({query: $('#search_field').val()});
		return false;
	});

	jQuery('#goButtonAdvanced').live('click', function(event) {
		var yearTermFrom = $('#advancedSearchForm input[name="yearTermFrom"]').val();
		var yearTermTill = $('#advancedSearchForm input[name="yearTermTill"]').val();
		if ( yearTermFrom != "" || yearTermTill != ""){
			if ( yearTermFrom != "" && yearTermTill == ""){ 
				var d = new Date() 
				yearTermTill = d.getFullYear()+1; 
			} 
			if ( yearTermTill != "" && yearTermFrom == ""){ 
				yearTermFrom = "0000";
			} 
			$('#advancedSearchForm input[name="yearTerm"]').val("["+ yearTermFrom +" TO "+ yearTermTill +"]");
		}
		jQuery.primo.search.query({search_form: '#advancedSearchForm'});
		return false;
	});

	jQuery('#gotoadvancedSearchWrapper').live('click', function(event){
		$('#simpleSearchWrapper').hide();
		$('#advancedSearchWrapper').show();
		return false;
	});

	jQuery('#gotoSimpleSearch').live('click', function(event){
		$('#simpleSearchWrapper').show();
		$('#advancedSearchWrapper').hide();
		return false;
	});
	jQuery('#TabBaseWrapper .tab').live('click', function(event){
		$('#selectBaseWrapper').toggle();
		return false;
	});
	jQuery('#selectBaseWrapper .database').live('click', function(event){
		jQuery.primo.params.search.database = $(this).attr('value');
		var local_base  = jQuery.primo.params.template_dir + "/images/local_base.png";
		var remote_base = jQuery.primo.params.template_dir + "/images/remote_base.png";	
		var selected_db_type = jQuery.primo.params.search.database.split(',')[0];
		var selected_db_name = jQuery.primo.params.search.database.split(',')[1];
		var selected_db = jQuery.primo.params.databases[selected_db_name];
		var selected_db_base = selected_db.type == 'local' ? local_base : remote_base;
		var element = "<img src='" + selected_db_base + "' >" + selected_db.label + "[" + selected_db.type + "]"
		jQuery('#TabBaseWrapper .tab').empty().append(element);
		
		$('#selectBaseWrapper').toggle();
		return false;
	});


	$("#search_field").bind('blur focus load', function(e) {
	        var match_text = 'Find it, get it';

	        if (this.value.length == 0 && (e.type == 'blur' || e.type == 'load')) {
	                this.value = match_text;
	                this.style.color = "#aaaaaa";
	        } else {
	                if (this.value == match_text) {
	                        this.value = '';                        
	                }
	                this.style.color = "#000000";
	        }               
	}).trigger('blur');

	jQuery('#remote_search').live('click', function(e){
		jQuery.primo.params.search.remote = $(this).attr('checked');
	});


//INFO
	jQuery('#info_button,#info_frame #closeButton').bind('click',
	function() {
		try{
		    load_customer_list();

		    if ($('#info_frame').css('display') == 'none') {
		        $('#info_frame').show(250);
		    } else {
		        $('#info_frame').hide(250);
		    }
		}
		catch (e){alert(e.message);
		}
	});	

    //BIND KEYUP ON CUSTOMER SEARCH BOX
    jQuery("#search_input_box").keyup(function(e) {
		try {
	        var c = String.fromCharCode(e.which);
	        var text = $("#search_input_box").val();
	        load_customer_list(text);
		}
		catch (e){alert(e.message);
		}
    });


//FEEDBACK
	jQuery("#feedback_button").bind('click',
	function(){
		jQuery("#feedback_frame").toggle();
	});

	jQuery('#feedback_form').bind('submit', function(event) {
		event.preventDefault();
		var subject = jQuery('#feedback_subject').val();
		var feedback = jQuery('#feedback_text').val();
		var email    = jQuery('#feedback_email').val();
		
		jQuery.primo.feedback.send(subject, feedback, email);
		jQuery("#feedback_frame").toggle();
	});


	//BIND CLICK to ADD Facet items
    jQuery('.facet_item').live('click', function(e){
            e.preventDefault();
            var item = $(this);

            labels = item.attr('class').split(' ');
            
            fs_list = jQuery.grep(labels, function(a) {
                    if (a.match('facet_name_')) {
                            fs=a.substr(11);
                            return fs;
                    }                       
            });

            fs = fs_list[0].replace('facet_name_', '');
            
			jQuery.primo.params.search.query.push({'index':'facet_' + fs, 'match':'contains', 'term':item.text() });

            $('#filters').trigger("filterlist.update");

//			jQuery.primo.ui.refresh('#main', 'brief');
            jQuery.primo.search.query({selector:'#main', html:'brief'});         
    });


	//BIND CLICK to REMOVE Facet items	
	jQuery(".filter_item_close").live('click', function(e){
		e.preventDefault();	
		var element = $(this);
		element_text = element.parent().text();		
		if (element_text.charAt(element_text.length-1) == 'X') {
			element_text = element_text.slice(0,element_text.length-1);
		}

		var filters = jQuery.primo.params.search.query;
		
		var delete_index = -1;
		jQuery.each(jQuery.primo.params.search.query, function(i, query){
			if (query.term == element_text) {
				delete_index = i;
				return false;
			}
		});
		
		if (delete_index > -1) {
			jQuery.primo.params.search.query.splice(delete_index,1);
		}
		
		$('#filters').trigger("filterlist.update");
		jQuery.primo.search.query({selector:'#main', html:'brief'});		
	});
	
	jQuery(".paginate").live('click',function(e){
		e.preventDefault();	
		var link = $(this);
		var page = parseInt(link.text());
		jQuery.primo.params.results.records.page = page;
		jQuery.primo.search.query({selector:'#main', html:'brief', 'page': page});
		window.scrollTo(0,0);
	});

    //BIND SUBMIT HANDLER for primo link to full desc
    jQuery('.briefTitle').live('click', function(e) {
        e.preventDefault();
		recNumber = $(this).attr("id");		
		var activeRecord = recNumber.substr(6,recNumber.length);
		jQuery.primo.params.results.currentFull = (activeRecord - 1);
		jQuery.primo.ui.refresh('#main','full');
    });

	jQuery('.nav_full_desc').live('click', function(e){
        e.preventDefault();
		recNumber = $(this).attr("id");		
		var activeRecord = recNumber.substr(6,recNumber.length);
		jQuery.primo.params.results.currentFull = (activeRecord - 1);
		jQuery.primo.ui.refresh('#main','full');
	});

	jQuery('.nav_full_desc').live("mouseover",function(e){
        e.preventDefault();
		recNumber = $(this).attr("id");

		var material_types = {'article' : {'label'  : 'Article', 'url' : '/images/materials/article.gif'},
					  'audio'   : {'label'  : 'Audio', 'url' : '/images/materials/audio.gif'},
					  'book'    : {'label'  : 'Book', 'url' : '/images/materials/book.gif'},
					  'group'   : {'label'  : 'Group', 'url' : '/images/materials/group.gif'},
					  'image'   : {'label'  : 'Image', 'url' : '/images/materials/image.gif'},
					  'journal' : {'label'  : 'Journal', 'url' : '/images/materials/journal.gif'},
					  'map'     : {'label'  : 'Map', 'url' : '/images/materials/map.gif'},						
					  'score'   : {'label' : 'Score', 'url' : '/images/materials/score.gif'},
					  'text'    : {'label'  : 'Article', 'url' : '/images/materials/text.gif'},
					  'video'   : {'label'  : 'Article', 'url' : '/images/materials/video.gif'},
					  'other' :   {'label' : 'Other', 'url' : '/images/materials/text_plus.gif'}};

		var RecordNr = recNumber.substr(6,recNumber.length);
		var page = parseInt(jQuery.primo.params.results.records.page);
		var step = jQuery.primo.params.results.records.step;
		var record_index = RecordNr - ((page - 1) * step) - 1;
		var record = jQuery.primo.params.results.records.data[record_index];
		var suffixtitle = "";
		if (record.title.length > 100) { suffixtitle = "..." }
		navmaterial_type = material_types[record.type] == null ? 'other' : record.type;
		navtypeIcon = material_types[navmaterial_type].url;
/*		$(this).html(RecordNr + " " + navtypeIcon + " "  + (record.title.substr(0,100)) + suffixtitle);*/

		navtypeIcon  = "<img height='14px' width='14px' style='padding:0; vertical-align:middle;' src='"+jQuery.primo.params.template_dir+navtypeIcon+"'>";

		$(this).html(navtypeIcon + " "  + (record.title.substr(0,100)) + suffixtitle);
	});

	jQuery('.nav_full_desc').live("mouseout",function(e){
        e.preventDefault();
		recNumber = $(this).attr("id");		
		var RecordNr = recNumber.substr(6,recNumber.length);
		var page = parseInt(jQuery.primo.params.results.records.page);
		var step = jQuery.primo.params.results.records.step;
		var record_index = RecordNr - ((page - 1) * step) - 1;
		var record = jQuery.primo.params.results.records.data[record_index];
/*		$(this).html(RecordNr + " "  + record.title.substr(0,20));*/
	});


	jQuery('.full_item_close').live('click', function(event){
		event.preventDefault();	
		var link = $(this);
		jQuery.primo.ui.refresh('#main','brief');		
	});

	jQuery('.full_item_nav').live('click', function(event){
        event.preventDefault();
		var page = parseInt($(this).attr("id"));
		jQuery.primo.params.results.records.page = page;
        var step = jQuery.primo.params.results.records.step;
        var from = (page * step) - (step - 1);
		jQuery.primo.params.results.currentFull = (from-1);
	 	jQuery.primo.search.query({selector:'#main', html:'full', 'page': page});
	});
	
	jQuery('.pnxClose').live('click', function(event){
	    event.preventDefault();		
		jQuery("#PNX").css("display", "none");
	});
	jQuery('.pnx').live('click', function(event){
       event.preventDefault();				
	   var pnx = $(this);
	   var record_id=pnx.attr('id').split('-')[1];	
				
       var data_blob = {
            'authenticity_token': jQuery.primo.search.token(),
			'query': "rid:" + record_id,
            'from': 1,
			'type': jQuery.primo.params.search.type,
			'remote': jQuery.primo.params.search.remote,
			'database': 'local,KUL',
			'raw': true		
        };

        jQuery.ajax({
            async: false,
            type: "POST",
            url: 'searches.xml',
            data: data_blob,
            dataType: "html",
            success: function(data) {
				jQuery('#pnxData').empty().append('<pre class="bush: xml">' + data.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</pre');
				jQuery('#PNX').css('display', 'block');		
			}
			});		
	});
});
