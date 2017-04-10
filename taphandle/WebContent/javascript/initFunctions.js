function initFunctions () {
	this.initMVC = function() {
		var resultPaneModel      = new $.ResultPaneModel();
		resultPaneView           = new $.ResultPaneView();
		new $.ResultPaneController(resultPaneModel, resultPaneView);

		var tapModel       = new $.TapModel();
		tapView            = new $.TapView();
		new $.TapController(tapModel, tapView);

		var cartModel       = new $.CartModel();
		cartView            = new $.CartView();
		new $.CartControler(cartModel, cartView);

		var nodeFilterModel       = new $.NodeFilterModel();
		nodeFilterView            = new $.NodeFilterView();
		new $.NodeFilterController(nodeFilterModel, nodeFilterView);

		dataTreeView = new DataTreeView();
	};

//	this.initLayout = function() {
//		$.alerts.overlayOpacity = 0.5;
//		$.alerts.overlayColor = '#000';
//		/*
//		 * layout plugin, requires JQuery 1.7 or higher
//		 * Split the bottom div in 3 splitters divs.
//		 */		
//		layoutPane = $('#accesspane').layout();
//		layoutPane.sizePane("south", "50%");
//	};
	
	this.initLayout = function() {
		Out.info("Activate popular sites access");
		var np = window.location.href.split('?')[0].replace(/\/#?$/, "");
		$(".3xmm-link").attr("href", np+"?url=http%3A//xcatdb.unistra.fr/3xmmdr6/tap/")
		$(".cadc-link").attr("href", np+"?url=http%3A//www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap/")
		$(".gavo-link").attr("href", np+"?url=http%3A//dc.zah.uni-heidelberg.de/__system__/tap/run/tap/")
		$(".vizier-link").attr("href", np+"?url=http%3A//tapvizier.u-strasbg.fr/TAPVizieR/tap/")
		$(".simbad-link").attr("href", np+"?url=http%3A//simbad.u-strasbg.fr/simbad/sim-tap/")
		$(".planet-link").attr("href", np+"?url=http%3A//voparis-tap.obspm.fr/__system__/tap/run/tap/")
		$(".heasarch-link").attr("href", np+"?url=https%3A//heasarc.gsfc.nasa.gov/xamin/vo/tap/")
		$(".chandra-link").attr("href", np+"?url=http%3A//cda.harvard.edu/cxctap/")
		$(".sdss-link").attr("href", np+"?url=http://wfaudata.roe.ac.uk/sdssdr9-dsa/TAP/")
		

		// Define the height of the div knowing the banner take 70px and the query editor 330px
		$("#treepane").height($(window).height()-100);
		$("#resultpane").height($(window).height()-400);
		
		// Change the height of the div if the window is resized
		$( window ).resize(function() {
			$("#treepane").height($(window).height()-100);
			if ($("#queryformpane").is(":visible")) {
				$("#resultpane").height($(window).height()-400);
			} else {
				$("#resultpane").height($(window).height()-100);
			}
		});
		
		// Show/Hide the tree div and adjust the position of toggle div
		$("#toggle-tree").click(function(){
			$("#treepane").toggle();
			if ($("#result").hasClass("col-xs-10")) {
				$("#result").removeClass("col-xs-10").addClass("col-xs-12");
				$("#toggle-tree").text("Show tree");
				$("#toggle-tree").css("left","-22px");
				$("#toggle-query").css("left","20px");
			} else {
				$("#result").removeClass("col-xs-12").addClass("col-xs-10");
				$("#toggle-tree").text("Hide tree");
				$("#toggle-tree").css("left","-19px");
				$("#toggle-query").css("left","22px");
				
			}		
		});
		
		// Show/Hide the query editor div and adjust the position of toggle div
		$("#toggle-query").click(function(){
			$("#queryformpane").toggle();
			if ($("#queryformpane").is(":visible")) {
				$("#toggle-query").text("Hide query");
				$("#resultpane").height($(window).height()-420);
				$("#toggle-query").css("bottom","330px");
			} else {
				$("#toggle-query").text("Show query");
				$("#resultpane").height($(window).height()-100);
				$("#toggle-query").css("bottom","0px");
			}
		});
		
		// Manage which div have to be displayed if there is the paramater url in the url
		if (getUrlParameter("url") != undefined) {
			$("body").removeClass("with-bg");
			$(".content-panel").show();
			$("#toggle-query").trigger( "click" );
			$("#queryformpane").hide();	
			$("#toggle-query").hide();
			PageLocation.confirmBeforeUnlaod();
		}
		else {
			$("body").addClass("with-bg");
			$(".home-panel").show();
		}
	};

	this.initNodeAccess = function() {
		dataTreeView.initNodeBase();
		adqlQueryView = QueryConstraintEditor.adqlTextEditor({ parentDivId: 'taptext', defaultQuery: ''});
		MetadataSource.init({getMetaTable: "gettableatt", getJoinedTables: "gettablejoinkeys", getUserGoodie: null});
		
		tapColumnSelector = QueryConstraintEditor.tapColumnSelector({parentDivId:'tapselect'
			, formName: 'tapFormColName'
			, queryView: adqlQueryView});
			
		tapConstraintEditor = QueryConstraintEditor.tapConstraintEditor({parentDivId: 'tapwhere'
			, formName: 'tapFormName'
			, sesameUrl:"sesame"
			, upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}}
			, queryView: adqlQueryView});
		
		tapPosSelector = QueryConstraintEditor.tapPosSelector({ parentDivId: 'tapwhereposition'
			, formName:'tapPosName'
			, sesameUrl:"sesame"
			, upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}}
			, queryView: adqlQueryView});

		var ins = $("input#node_selector");
		ins.keypress(function(event) {
			if (event.which == '13') {
				var val = $('#node_selector').val().trim();
				/*
				 * Avoid to take a keyword as a service 
				 */
				if( val.startsWith("http"))
					dataTreeView.fireNewNodeEvent(val);
			}
		});			
		ins.one("click",function() {
			$(this).css('color','black');
			$(this).css('font-style','');
			$(this).attr('value','');
		});		

	};

	this.initDataTree = function() {
		dataTree = $("div#treedisp").jstree({
			"json_data"   : {"data" : [ {  "attr"     : { "id"   : "rootid", "title": "Repository for uploaded tables (Not implemented yet)" },
				"data"        : { "icon": "images/folder.png", "title"   : "Goodies (not used yet)" , "attr": {"id": "goodies"}}}]}  , 
				"plugins"     : [ "themes", "json_data", "dnd", "crrm"],
				"rules" : {"deletable" : "all"},
				"dnd"         : {"drop_target" : "#resultpane,#taptab,#showquerymeta",
			    "drop_finish" : function (data) {
						var parent = data.r;
						var id = data.o.attr("id");
						var dataTreePath = jQuery.parseJSON(data.o.attr("datadataTreePath"));

						if( id == null || (streePath = data.o.attr("id").split(';')).length < 3 ) {
							Modalinfo.info("Meta data only available for tables: ("  +  id + ")", 'User Input Error');
						} else {
							dataTreePath.nodekey = id.split(";")[0];
	
							while(parent.length != 0  ) {
								if(parent.is('#resultpane') ) {
									ViewState.fireDoubleClickOK(dataTreePath);
						            _paq.push(['trackPageView', 'saada TapHandle/dropresult/' + dataTreePath.nodekey]);
									return;
								/*} else if(parent.attr('id') == "showquerymeta" ) {
									resultPaneView.fireShowMetaNode(treePath);	
						            _paq.push(['trackPageView', 'saada TapHandle/dropmeta/' + streePath[0]]);
								return;*/
								} else if(  parent.attr('id') == "taptab") {
									ViewState.fireDragOnQueryForm(dataTreePath);
						            _paq.push(['trackPageView', 'saada TapHandle/dropquery/' + dataTreePath.nodekey]);
									return;
								}
								parent = parent.parent();
							}
						}
					}
				},
				// Node sorting by DnD blocked
				"crrm" : {"move" : {"check_move" : function (m) {return false; }}
				}
		}); // end of jstree

		$("a#goodies").attr("class", "help").css("color", "grey");
		dataTree.bind("dblclick.jstree", function (e, data) {
			var node = $(e.target).closest("li");
			var id = node[0].id; //id of the selected node
			var dataTreePath = jQuery.parseJSON($(node[0]).attr("dataTreePath"));

			var streePath = id.split(';');
			/*
			 * Got a dataTreePath: we are on a leaf
			 */
			if( dataTreePath != undefined ) {
				dataTreePath.nodekey = streePath[0];
				dtr = new DataTreePath(dataTreePath);
				ViewState.fireDoubleClickOK(dtr);
	            _paq.push(['trackPageView', 'saada TapHandle/2clicks/' + dtr.key]);
	        /*
	         * On a root node: open the resource filter tool
	         */
			} else if( streePath.length == 1) {
				var nm = $(e.target).closest("a")[0].id;
				if( nm != "" ) {
					nodeFilterView.fireOpenSelectorWindow(nm);
				}	
			/*
			 * On schema: do nothing
			 */
			} else {
				Modalinfo.info("Query can only be applied on one data category or one data class: ("  +  dataTreePath + ")", 'User Input Error');
			}
		});
		rootUrl = "http://" + window.location.hostname +  (location.port?":"+location.port:"") + window.location.pathname;
		/*
		 * Connect the URL passed as parameter
		 */
		var defaultUrl  =  (RegExp('url=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];
		if( defaultUrl != null ) {
			Processing.show("Connecting " + defaultUrl);
			dataTreeView.fireNewNodeEvent(unescape(defaultUrl));
            _paq.push(['trackPageView', 'saada TapHandle/paramURL/' + defaultUrl]);
		}
		Out.setdebugModeFromUrl();

	};

	this.initQueryForm = function() {
		/*
		 * Activate submit buttons
		 */
		$('#submitquery').click(function() {
            _paq.push(['trackPageView', 'saada TapHandle/submit']);
			ViewState.fireSubmit();
			//resultPaneView.fireSubmitQueryEvent();
		});
		$("#qlimit").keyup(function(event) {
			if( $("#qlimit").val() == '' || $("#qlimit").val().match(/^[0-9]+$/) ) {
				adqlQueryView.fireAddConstraint("tap", "limit", [getQLimit()]);
			} else {
				Modalinfo.info('The result limit must be a positive integer value' , "User Input Error");
				$("#qlimit").val(100);
				adqlQueryView.fireAddConstraint("tap", "limit", [getQLimit()]);
				return false;
			}

		});

		/*********************************************************************************************
		 * Query form setup
		 */
		$("#taptab").tabs();
		$("#taptab").tabs({
			unselect : true
		});
		$("#tapconstraintlist").droppable({
			drop: function(event, ui){
				tapView.fireAttributeEvent(ui.draggable);		
			}
		});
		$("#tapselectlist").droppable({
			drop: function(event, ui){
				tapView.fireSelectEvent(ui.draggable);		
			}
		});
		$("#taporderby").droppable({
			drop: function(event, ui){
				tapView.fireOrderByEventEvent(ui.draggable);		
			}
		});
		$("#tapalpha").droppable({
			drop: function(event, ui){
				tapView.fireAlphaEvent(ui.draggable);		
			}
		});
		$("#tapdelta").droppable({
			drop: function(event, ui){
				tapView.fireDeltaEvent(ui.draggable);		
			}
		});
		/*
		 * Coordinates input
		 */
		$("#tapwhere input").keypress(function(event) {
			if (event.which == '13') {
				tapView.fireInputCoordEvent();
			}
		});
		/*
		 * Name resolver buton activation
		 */
		$(".sesame").click(function() {
			var inputfield = $(this).parents('div').find(".coordinputvalue");
			Processing.show("Waiting on SESAME response");
			$.getJSON("sesame", {object: inputfield.val() }, function(data) {
				Processing.hide();
				if( Processing.jsonError(data, "Sesame failure") ) {
					return;
				} else {
					inputfield.val(data.alpha + ' ' + data.delta);
				}
			});
		});
		/*
		 * This callback can be changed changed at everytime: do not use the "onclick" HTML  
		 * attribute which is not overriden by JQuery "click" callback
		 */
		$('#showquerymeta').click(function(){Modalinfo.info("No meta data available yet", 'Application not Ready');});
		tapView.fireRefreshJobList();
	}
	this.initSamp = function() {
		WebSamp_mVc.init("TAPHandle"
				, "http://saada.u-strasbg.fr/taphandle/images/tap64.png"
				, "Universal TAP service browser");
	}
};


var whenReady = new initFunctions ();