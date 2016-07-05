function adjustWidths() {
	$('#superwrapper', '#header', '#datapane', '#formframe', '#footer', '#accesspane', '#formpane', '#resultpane').css("width", "auto");
	wWidth = $('window').width();

	$('#superwrapper').width(wWidth);
	$('#header').width(wWidth);
	$('#datapane').width(wWidth);
	$('#formframe').width(wWidth);
	$('#footer').width(wWidth);
	$('#accesspane').width(wWidth);

	$('#formpane').width(wWidth - $('#formpanemenu').width());
	$('#resultpane').width(wWidth - $('#treepane').width() - 6);
		
};


//function adjustHeights() {
//	$('#superwrapper', '#header', '#footer', '#accesspane').css("height", "auto");
//	wHeight = $('window').height();
//	if ($('#formframe').height() > 300) $('#formframe').height(300);
//	$('#superwrapper').height(wHeight);
//	$('#accesspane').height(wHeight - $('#header').height() - $('#footer').height());
//	
//};
	
	
$().ready(function() {
	adjustWidths();
//	adjustHeights();
	

	$(window).resize(function() {
		adjustWidths();
//		adjustHeights();
		
	});
		
});