/**
 * This singleton make sure that all components of the interface are always
 * in a state which is compliant with the result of the last user action
 * Public method can be invoked from anywhere in the code
 * 
 * The dataTreePath parameter od all public method must be an instance of the class 
 * DataTreePath({nodekey:"node", schema: "schema", table: "table", tableorg: "tableorg"});
 * defined in domain.js
 */
ViewState = function() {
	
	/************************************
	 * Private method triggering action on the interface components
	 */
	/**
	 * Remove the page title
	 */
	var cleanPath = function(dataTreePath) {
		dataTreeView.setTitlePath(null);
	};
	/**
	 * Set the page title
	 */
	var setPath = function(dataTreePath) {
		dataTreeView.setTitlePath(dataTreePath);
	};
	/**
	 * Empty the data div
	 */
	var cleanData = function(dataTreePath) {
		resultPaneView.clearTapResult();
	};
	/**
	 * Display data
	 */
	var setData = function(dataTreePath) {
		tapView.fireDisplayResult(dataTreePath);
	};
	/**
	 * Empty the query form
	 */
	var cleanForm = function(dataTreePath) {
	};
	/**
	 * Init the query form
	 */
	var setForm= function(dataTreePath) {
		tapView.fireTreeNodeEvent(dataTreePath, false);	
	};
	/**
	 * Remove the query text
	 */
	var cleanQuery = function(dataTreePath) {
		adqlQueryView.displayQuery('');
	};
	/**
	 * Set the query text
	 */
	var setQuery= function(dataTreePath, query) {
		adqlQueryView.displayQuery(query);
	};
	
	/************************************************
	 * Public methods invoked on any user action implying 
	 * a change of the status interface.
	 */
	/**
	 * A double click on a node succeed
	 */
	var fireDoubleClickOK = function(dataTreePath) {
		/*
		 * Clean everything
		 */
		cleanPath(dataTreePath);
		cleanData(dataTreePath);
		cleanForm(dataTreePath);
		cleanQuery(dataTreePath);
		/*
		 * Connect the interface to the selected node
		 */
		setPath(dataTreePath);			
		tapView.fireTreeNodeEvent(dataTreePath, true);	
	};
	/**
	 * A double click on a node has generated an error
	 */
	var fireDoubleClickKO = function(dataTreePath) {
		cleanPath(dataTreePath);
		cleanData(dataTreePath);
		cleanForm(dataTreePath);
		cleanQuery(dataTreePath);
		setForm(dataTreePath);
		setPath(dataTreePath);
	};
	/**
	 * a data node has been dropped onto the query form
	 */
	var fireDragOnQueryForm = function(dataTreePath) {
		cleanPath(dataTreePath);
		cleanData(dataTreePath);
		cleanForm(dataTreePath);
		cleanQuery(dataTreePath);
		setForm(dataTreePath);
		setPath(dataTreePath);
		//resultPaneView.fireExpandForm();

	};
	/**
	 * A new jobs has ben submitted
	 */
	var fireSubmit = function(dataTreePath) {
		cleanData(dataTreePath);
		tapView.fireSubmitQueryEvent();
	};
	/**
	 * A new jobs has ben submitted
	 */
	var fireSubmitted = function(dataTreePath, jobid) {
		cleanData(dataTreePath);
		dataTreePath.jobid = jobid;
		setPath(dataTreePath);
	};
	/**
	 * The current job succeed
	 */
	var fireSubmitOK = function(dataTreePath) {
		cleanData(dataTreePath);
		setData(dataTreePath);
	};
	/**
	 * The current job has not completed within 10"
	 */
	var fireSubmitDelayed = function(dataTreePath) {
		cleanData(dataTreePath);
	};
	/**
	 * The current job failed
	 */
	var fireSubmitKO = function(dataTreePath) {
		cleanData(dataTreePath);
		//resultPaneView.fireExpandForm();
	};
	/**
	 * Recall a successful job
	 */
	var fireRecallOK = function(dataTreePath, query) {
		cleanPath(dataTreePath);
		cleanData(dataTreePath);
		cleanForm(dataTreePath);
		cleanQuery(dataTreePath);
		setForm(dataTreePath);
		setQuery(dataTreePath, query);
		setPath(dataTreePath);
		setData(dataTreePath);
	};
	/**
	 * Recall a failed job
	 */
	var fireRecallKO = function(dataTreePath, query) {
		cleanPath(dataTreePath);
		cleanData(dataTreePath);
		cleanForm(dataTreePath);
		cleanQuery(dataTreePath);
		setForm(dataTreePath);
		setQuery(dataTreePath, query);
		setPath(dataTreePath);
		//resultPaneView.fireExpandForm();
	};
	
	/*
	 * exports
	 */
	var pblc = {};
	pblc.fireDoubleClickOK   = fireDoubleClickOK;
	pblc.fireDoubleClickKO   = fireDoubleClickKO;
	pblc.fireDragOnQueryForm = fireDragOnQueryForm;
	pblc.fireSubmit          = fireSubmit;
	pblc.fireSubmitted       = fireSubmitted;
	pblc.fireSubmitOK        = fireSubmitOK;
	pblc.fireSubmitDelayed   = fireSubmitDelayed;
	pblc.fireSubmitKO        = fireSubmitKO;
	pblc.fireRecallOK        = fireRecallOK;
	pblc.fireRecallKO        = fireRecallKO;
	return pblc;
}();
