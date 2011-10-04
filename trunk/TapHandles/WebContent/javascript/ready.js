

var DEBUG = true;
function logMsg(message) {
	if( DEBUG && (typeof console != 'undefined') ) {
		console.log(message);
	}
}

function setTitlePath(treepath) {
	$("#resultpane").html('');
	$('#titlepath').html('<i>');
	for( i=0 ; i<treepath.length  ; i++ ) {
		if( i > 0 )$('#titlepath').append('&gt;');
		$('#titlepath').append(treepath[i]);
	}
}

function getQLimit() {
	var limit = 10;
	if( $("#qlimit").val().match(/^[0-9]*$/) ) {
		limit = $("#qlimit").val();
	}
	return limit;
}
function logged_alert(message, title) {
	logMsg("ALERT " + message);
	jAlert(message, title);
}


var stillToBeOpen = false;
var simbadToBeOpen = false;

function showProcessingDialog(message) {
	logMsg("PROCESSSING " + message);
	stillToBeOpen = true;
	if( $('#saadaworking').length == 0){		
		$('#resultpane').append('<div id="saadaworking" class="dataTables_processing" style="visibility: hidden; "></div>');
	}
	$('#saadaworking').html(message);
	/*
	 * It is better to immediately show the profress dialog in order to give a feed back to the user
	 * It we dopn't, user could click several time on submit a get lost with what happens
	 *
	 * setTimeout("if( stillToBeOpen == true ) $('#saadaworking').css('visibility', 'visible');", 500);
	 */
	$('#saadaworking').css('visibility', 'visible');
}


function hideProcessingDialog() {
	stillToBeOpen = false;
	if( $('#saadaworking').length != 0){
		$('#saadaworking').css('visibility', 'hidden');	
	}
}

function showSampMessageSent() {
	stillToBeOpen = true;
	if( $('#saadaworking').length == 0){		
		$('#resultpane').append('<div id="saadaworking" class="dataTables_processing" style="visibility: hidden; "></div>');
	}
	$('#saadaworking').html("SAMP message sent");
	$('#saadaworking').css('visibility', 'visible');
	setTimeout(" $('#saadaworking').css('visibility', 'hidden');", 2000);

}

//function showQuerySent() {
//stillToBeOpen = true;
//if( $('#saadaworking').length == 0){		
//$('#resultpane').append('<div id="saadaworking" class="dataTables_processing" style="visibility: hidden; "></div>');
//}
//$('#saadaworking').html("Query submitted");
//$('#saadaworking').css('visibility', 'visible');
//setTimeout(" $('#saadaworking').css('visibility', 'hidden');", 2000);
//}


function openDialog(title, content) {
	if( $('#diagdiv').length == 0){		
		$(document.documentElement).append("<div id=diagdiv style='width: 99%; display: none; width: auto; hight: auto;'></div>");
	}
	$('#diagdiv').html(content);
	$('#diagdiv').dialog({  width: 'auto', title: title});
}

function openSimbadDialog(pos) {
	if( $('#diagdiv').length == 0){		
		$(document.documentElement).append("<div id=diagdiv style='display: none; width: auto; hight: auto;'></div>");
	}
	var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"simbadtable\" class=\"display\"></table>";
	$('#diagdiv').html(table);

	$.getJSON("simbadtooltip", {pos: pos}, function(jsdata) {
		hideProcessingDialog();job
		if( processJsonError(jsdata, "Simbad Tooltip Failure") ) {
			return;
		}
		else {
			$('#simbadtable').dataTable({
				"aoColumns" : jsdata.aoColumns,
				"aaData" : jsdata.aaData,
				"sDom" : '<"top">rt<"bottom">',
				"bPaginate" : false,
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true,
				"bAutoWidth" : true,
				"bDestroy" : true
			});

			var simbadpage = "<a class=simbad target=blank href=\"http://simbad.u-strasbg.fr/simbad/sim-coo?Radius=1&Coord=" + escape(pos) + "\"></a>";
			$('#diagdiv').dialog({  width: 'auto', title: "Simbad Summary for Position " + pos + simbadpage});
			sampView.firePointatSky(pos);
		}
	});
}

function openModal(title, content) {
	if( $('#detaildiv').length == 0){		
		$(document.documentElement).append("<div id=detaildiv style='width: 99%; display: none;'></div>");
	}
	$('#detaildiv').html(content);
	$('#detaildiv').modal();
}

function switchArrow(id) {
	var image = $('#'+id+'').find('img').attr('src');
	if (image == 'images/tdown.png') {
		$('#'+id+'').find('img').attr('src', 'images/tright.png');
	} else if (image == 'images/tright.png') {
		$('#'+id+'').find('img').attr('src', 'images/tdown.png');
	}
}

function processJsonError(jsondata, msg) {
	if( jsondata == undefined || jsondata == null ) {
		logged_alert("JSON ERROR: " + msg + ": no data returned", 'Server Error');
		return true;
	}
	else if( jsondata.errormsg != undefined  ){
		logged_alert("JSON ERROR: " + msg + ": "  + jsondata.errormsg, 'Server Error');
		return true;
	}	
	return false;

}

var nodeList  =  [
                   {id: 'gavot', text: "gavot"},
                   {id: 'cadc', text: "cadc"},
                  {id: 'xcatdb', text: "xcatdb"}
                  ];

var resultPaneView;
var sampView ;
var tapView ;
var cartView ;

/*
 * To be set from a JSP 
 */
var base_url = '';
var booleansupported = false;

$().ready(function() {
	var resultPaneModel      = new $.ResultPaneModel();
	resultPaneView           = new $.ResultPaneView();
	var resultPaneController = new $.ResultPaneController(resultPaneModel, resultPaneView);

	var sampModel       = new $.SampModel();
	sampView            = new $.SampView();
	var sampController  = new $.SampController(sampModel, sampView);

	var tapModel       = new $.TapModel();
	tapView            = new $.TapView();
	var tapController  = new $.TapController(tapModel, tapView);
	
	var cartModel       = new $.CartModel();
	cartView            = new $.CartView();
	var cartControler   = new $.CartControler(cartModel, cartView);

	/*
	 * Splitter functions of accesspane, the container of the db tree, 
	 * the data panel and the query form.
	 * see http://methvin.com/splitter
	 */
	$("div#accesspane").splitter({
		splitHorizontal: true,			
		outline: true,
		resizeToWidth: true,
		minTop: 100, 
		//sizeTop: ($(window).height() - 70 - 50), 
		sizeBottom: 250, 
		minBottom: 100,
		sizeTop: true,	
		accessKey: 'I'
	});
	$("div#datapane").splitter({
		splitVertical: true,
		sizeLeft: true,
		outline: true,
		resizeTo: window,
		minLeft: 100, sizeLeft: 150, minRight: 100,
		accessKey: 'I'
	});
	$('input#node_selector').jsonSuggest(
			{data: nodeList
				, minCharacters: 0
				, onSelect: function(data){						
					resultPaneView.fireNewNodeEvent($('#node_selector').val());
				}
			});

	$("div#treedisp").jstree({
		"json_data"   : {"data" : [ {  "attr"     : { "id"   : "rootid" },
			"data"     : { "title"   : "Tap Nodes" }}]}  , 
			"plugins"     : [ "themes", "json_data", "dnd", "crrm"],
			"dnd"         : {"drop_target" : "#resultpane,#taptab,#showquerymeta",
				"drop_finish" : function (data) {
					var parent = data.r;
					var treepath = data.o.attr("id").split(';');
					if( treepath.length < 3 ) {
						logged_alert("Query can only be applied on one data category or one data class: ("  +  treepath + ")", 'User Input Error');
					}
					else {
						while(parent.length != 0  ) {
							resultPaneView.fireSetTreePath(treepath);	
							if(parent.attr('id') == "resultpane" ) {
								setTitlePath(treepath);
								resultPaneView.fireTreeNodeEvent(treepath);	
								return;
							}
							else if(parent.attr('id') == "showquerymeta" ) {
								setTitlePath(treepath);
								resultPaneView.fireShowMetaNode(treepath);	
								return;
							}

							else if(  parent.attr('id') == "taptab") {
								tapView.fireTreeNodeEvent(treepath);	
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
			logged_alert('The result limit must be a positive integer value' , "User Input Error");
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
		var val = $(this).val()
		tapView.fireFilterColumns(val);
		$('.kw_filter').val(val);

	});


	/*
	 * This callback can be changed changed at everytime: do not use the "onclick" HTML  
	 * attribute which is not overriden by JQuery "click" callback
	 */
	$('#showquerymeta').click(function(){logged_alert("No meta data available yet", 'Application not Ready')});

	sampView.fireSampInit();
	tapView.fireRefreshJobList();

	//resultPaneView.fireNewNodeEvent("cadc");
});
