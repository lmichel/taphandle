/*
 * Jquery stuff initialisation
 */

/**
 * View associated with specific functionnality
 */
var resultPaneView;
var sampView ;
var tapView ;
var cartView ;
/*
 * default node list
 * The nodes given here must be initiamized in Nodebase.java
 */
var nodeList  =  [
                  {id: 'gavo ',  text: "gavo "},
                  {id: 'cadc',   text: "cadc"},
                  {id: 'xcatdb', text: "xcatdb"},
                  {id: 'simbad', text: "simbad"},
                  {id: 'vizier', text: "vizier"},
                  {id: 'heasarc-xamin', text: "heasarc-xamin"},
                 //   {id: 'http://simbad49:8080/simbad/sim-tap', text: "http://simbad49:8080/simbad/sim-tap"}
                  ];

/*
 * Using a Jquery bind() here has a strange behaviour...
 * http://stackoverflow.com/questions/4458630/unable-to-unbind-the-window-beforeunload-event-in-jquery
 */
window.onbeforeunload = function() {
	if( !authOK) {
		return  'WARNING: Reloading or leaving this page will lost the current session';
	}
	else {
		authOK = false;
	}
};
var authOK = false;
function changeLocation(url){
	logMsg("changeLocation " + url);
	authOK = true;
	window.open (url, "_blank");
}


/*
 * No longer used but....
 */
var defaultUrl = '';
var rootUrl = '';
var booleansupported = false;

/*
 * Jquery object managing splitters
 */
var layoutPane;

$().ready(function() {
	var resultPaneModel      = new $.ResultPaneModel();
	resultPaneView           = new $.ResultPaneView();
	new $.ResultPaneController(resultPaneModel, resultPaneView);

	var sampModel       = new $.SampModel();
	sampView            = new $.SampView();
	new $.SampController(sampModel, sampView);

	var tapModel       = new $.TapModel();
	tapView            = new $.TapView();
	new $.TapController(tapModel, tapView);

	var cartModel       = new $.CartModel();
	cartView            = new $.CartView();
	new $.CartControler(cartModel, cartView);

	var nodeFilterModel       = new $.NodeFilterModel();
	nodeFilterView            = new $.NodeFilterView();
	new $.NodeFilterController(nodeFilterModel, nodeFilterView);

	$.alerts.overlayOpacity = 0.5;
	$.alerts.overlayColor = '#000';

	/*
	 * layout plugin, requires JQuery 1.7 or higher
	 * Split the bottom div in 3 splitters divs.
	 */		
	layoutPane = $('#accesspane').layout();

	$('input#node_selector').jsonSuggest(
			{data: nodeList
				, minCharacters: 0
				, onSelect: function(data){						
					resultPaneView.fireNewNodeEvent($('#node_selector').val());
				}
			});

	dataTree = $("div#treedisp").jstree({
		"json_data"   : {"data" : [ {  "attr"     : { "id"   : "rootid", "title": "Dummy node: Select one first with the node selector on the page top." },
			"data"        : { "title"   : "Tap Nodes" }}]}  , 
			"plugins"     : [ "themes", "json_data", "dnd", "crrm"],
			"dnd"         : {"drop_target" : "#resultpane,#taptab,#showquerymeta",
				"drop_finish" : function (data) {
					var parent = data.r;
					var streepath = data.o.attr("id").split(';');
					if( streepath.length < 3 ) {
						loggedAlert("Query can only be applied on one data category or one data class: ("  +  streepath + ")", 'User Input Error');
					}
					else {
						var treePath = {nodekey: streepath[0], schema: streepath[1], table: streepath[2]};
						while(parent.length != 0  ) {
							resultPaneView.fireSetTreePath(treePath);	
							if(parent.is('#resultpane') ) {
								setTitlePath(treePath);
								resultPaneView.fireTreeNodeEvent(treePath);	
								return;
							}
							else if(parent.attr('id') == "showquerymeta" ) {
								resultPaneView.fireShowMetaNode(treePath);	
								return;
							}

							else if(  parent.attr('id') == "taptab") {
								tapView.fireTreeNodeEvent(treePath);	
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

	dataTree.bind("dblclick.jstree", function (e, data) {
		var node = $(e.target).closest("li");
		var id = node[0].id; //id of the selected node					
		var treePath = id.split(';');
		if( treePath.length == 1 ) {
			var nm = $(e.target).closest("a")[0].id;
			if( nm != "" ) {
				nodeFilterView.fireOpenSelectorWindow(nm);
			}
		} else if( treePath.length < 3 ) {
			loggedAlert("Query can only be applied on one data category or one data class: ("  +  treePath + ")", 'User Input Error');
		} else {
			var fTreePath = {nodekey: treePath[0], schema: treePath[1], table: treePath[2]};
			resultPaneView.fireSetTreePath(fTreePath);	
			setTitlePath(fTreePath);
			resultPaneView.fireTreeNodeEvent(fTreePath);	
		}
	});

	$("input#node_selector").keypress(function(event) {
		if (event.which == '13') {
			resultPaneView.fireNewNodeEvent($('#node_selector').val());
		}
	});


	/*
	 * Activate submit buttons
	 */
	$('#submitquery').click(function() {
		resultPaneView.fireSubmitQueryEvent();
	});
	$("#qlimit").keyup(function(event) {
		if( $("#qlimit").val() == '' || $("#qlimit").val().match(/^[0-9]+$/) ) {
			tapView.fireUpdateQueryEvent();			
		}
		else {
			loggedAlert('The result limit must be a positive integer value' , "User Input Error");
			$("#qlimit").val(100);
			tapView.fireUpdateQueryEvent();			
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
		showProcessingDialog("Waiting on SESAME response");
		$.getJSON("sesame", {object: inputfield.val() }, function(data) {
			hideProcessingDialog();
			if( processJsonError(data, "Sesame failure") ) {
				return;
			}
			else {
				inputfield.val(data.alpha + ' ' + data.delta);
			}
		});
	});

	/*
	 * Name resolver buton activation
	 */
	$(".kw_filter").keyup(function(event) {
		var val = $(this).val();
		tapView.fireFilterColumns(val);
		$('.kw_filter').val(val);

	});
	/*
	 * Change the table displayed in the KW lists
	 */
	$('.table_filter').change(function() {
		tapView.fireChangeTable(this.value);
	});

	/*
	 * This callback can be changed changed at everytime: do not use the "onclick" HTML  
	 * attribute which is not overriden by JQuery "click" callback
	 */
	$('#showquerymeta').click(function(){loggedAlert("No meta data available yet", 'Application not Ready');});

	sampView.fireSampInit();
	tapView.fireRefreshJobList();
	rootUrl = "http://" + window.location.hostname +  (location.port?":"+location.port:"") + window.location.pathname;
	/*
	 * Connect the URL passed as parameter
	 */
	defaultUrl  =  (RegExp('url=' + '(.+?)(&|$)').exec(location.search)||[,null])[1];
	if( defaultUrl != null ) {
		resultPaneView.fireNewNodeEvent(unescape(defaultUrl));
	}
});

