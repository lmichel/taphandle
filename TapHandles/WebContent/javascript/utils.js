/*
 * Various utility routines standing out of any MVC 
 */
var DEBUG = true;
function logMsg(message) {
	if( DEBUG && (typeof console != 'undefined') ) {
		console.log(message);
	}
}
function traceMsg(message) {
	if( DEBUG && (typeof console != 'undefined') ) {
		console.trace();
		console.log(message);
	}
}

function setTitlePath(treepath) {
	logMsg("title " + treepath);
	var job = (treepath.jobid == null)? "": '&gt;'+ treepath.jobid;
	$('#titlepath').html('<i>' + treepath.nodekey + '&gt;' + treepath.schema + '&gt;'+ treepath.table+ job);
}

function getQLimit() {
	var limit = 10;
	if( $("#qlimit").val().match(/^[0-9]*$/) ) {
		limit = $("#qlimit").val();
	}
	return limit;
}

function loggedAlert(message, title) {
	logMsg("ALERT " + message);
	openDialog((title== null || title == "" )? "Alert": title
			, "<span class=alert>" + message.replace(/\n/g, "<BR>") + "</span>");
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
	 * It is better to immediately show the process dialog in order to give a feed back to the user
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
		$(document.documentElement).append("<div id=diagdiv style='width: 50%; display: none; hight: auto;'></div>");
	}
	$('#diagdiv').html(content);
	$('#diagdiv').dialog({  maxWidth: '50%', title: title,  modal: true});
}

function openConfirm(params) {
	if( $('#confirmdiv').length == 0){		
		$(document.documentElement).append("<div id=confirmdiv style='width: 50%; display: none; hight: auto;'></div>");
	}
	$('#confirmdiv').html(params.message);
	$('#confirmdiv').dialog({  maxWidth: '50%'
		, title: params.title
		, modal: true			
		, buttons: {"OK": function() {$( this ).dialog( "close" );params.handler();}
	              , Cancel: function() {$( this ).dialog( "close" );}
				}
		});
}

function openSimbadDialog(pos) {
	if( $('#diagdiv').length == 0){		
		$(document.documentElement).append("<div id=diagdiv style='display: none; width: auto; hight: auto;'></div>");
	}
	var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"simbadtable\" class=\"display\"></table>";
	$('#diagdiv').html(table);

	$.getJSON("simbadtooltip", {pos: pos}, function(jsdata) {
		hideProcessingDialog();
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
		loggedAlert("JSON ERROR: " + msg + ": no data returned", 'Server Error');
		return true;
	}
	else if( jsondata.errormsg != undefined  ){
		loggedAlert("JSON ERROR: " + msg + ": "  + jsondata.errormsg, 'Server Error');
		return true;
	}	
	return false;
}

function jsonAlert(jsdata, title) {
	var retour='';
	$.each(jsdata, function(k, v) {
		retour += k + ": " + v  + "\n";
	});
	loggedAlert(retour, 'Json Object');
}

