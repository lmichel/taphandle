/**
 * Jquery stuff initialisation
 * + Global variables declaration
 */
var downloadIFrameID = 'downloadIFrameID';

/*
 * The JEE session ID is used to keep session track through http params 
 */
var sessionID;
var rootUrl;
/*
 * View associated with specific functionality
 */
var resultPaneView;
var tapView ;
var dataTreeView ;
var cartView ;
var adqlQueryView ;
var tapColumnSelector;
var tapConstraintEditor;
/*
 * Using a Jquery bind() here has a strange behaviour...
 * http://stackoverflow.com/questions/4458630/unable-to-unbind-the-window-beforeunload-event-in-jquery
 */
//var authOK = false;
//window.onbeforeunload = function() {
//	if( !authOK) {
//		return  'WARNING: Reloading or leaving this page will lost the current session';
//	} else {
//		authOK = false;
//	}
//};
/*
 * Use true/false or 0/1 in ADQL?
 */
var booleansupported = false;
/*
 * JQuery object managing splitters
 */
var layoutPane;
/*
 * invoked once the page is loaded
 */
$().ready(function() {
	whenReady.initMVC();
	whenReady.initLayout();
	whenReady.initNodeAccess();
	whenReady.initDataTree();
	whenReady.initQueryForm();
	whenReady.initSamp();
	PageLocation.confirmBeforeUnlaod();
});

