jQuery.extend({

	ResultPaneModel: function(){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		var dataJSONObject;
		/**
		 * Query displayed data are coming from
		 */
		var current_query = "";
		var treePath ;

		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		};
		/*
		 * Event processing
		 */
		this.setTreePath = function(treepath){
			treePath = treepath;
		};

		this.processShowRecord= function(oid){
			var jsdata ="";
			showProcessingDialog("Get object detail");
			$.getJSON("getobject", {oid: oid }, function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "") ) {
					return;
				}

				else {
					jsdata = data;
					that.notifyDetailLoaded(oid, jsdata);
				}
			});
		};

		this.processShowMeta= function(){
			showProcessingDialog("Get table description");
			$.getJSON("gettable", {node: "aharray", name:tp }, function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "get metadata") ) {
					return;
				}
				else {
					that.notifyMetaLoaded(data);
				}
			});
		};

		this.processShowMetaNode= function(treepath){
			showProcessingDialog("Get table description");
			$.getJSON("gettable", {node: treepath.nodekey, table:treepath.table }, function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "get attribute handlers") ) {
					return;
				}
				else {
					that.notifyMetaLoaded(data);
				}
			});
		};


		this.processShowSimbad= function(coord){
			window.open("simbad?coord=" + escape(coord), "Simbad");
		};

		
		this.downloadVOTable = function() {
			/*
			 * Job ids is detected by analysing the title
			 */
			var titlepath = $('#titlepath').text().split('>');
			if( titlepath.length == 4  ) {
				tapView.fireDownloadVotable(titlepath[0], titlepath[3].replace('job ', ''));
			}
			else {
				loggedAlert("Cannot identify the current JOB", 'Error');	
			}
		};
		this.downloadFITS = function() {
			var url = "getqueryreport?query=" + escape(current_query) + "&protocol=auto&format=fits";
			window.open(url, 'DL FITS');
		};
		this.downloadZip = function() {
			/*
			 * The mode (TAP/SaadaQL is detected by analysing the title
			 */
			var titlepath = $('#titlepath').html().split('&gt;');
			if( titlepath.length == 3 && titlepath[1] == 'Job' ) {
				loggedAlert("Not implemented for TAP queries", 'Info');
			}
			else {
				var url = "getqueryreport?query=" + escape(current_query) + "&protocol=noprotocol&format=zipball";
				window.open(url, 'DL Zipball');
			}
		};
		this.sampBroadcast = function() {
			/*
			 * Job ids is detected by analysing the title
			 */
			var titlepath = $('#titlepath').text().split('>');
			if( titlepath.length == 4  ) {
					tapView.fireDownloadVotable(titlepath[0], titlepath[3].replace('job ', ''));
			}
			else {
				loggedAlert("Cannot identify the current JOB", 'Error');	
			}

//			var url = "getqueryreport?query=" + escape(current_query) + "&protocol=auto&format=fits";
//			window.open(url, 'DL VOTable');
		};

		/*
		 * Listener notifications
		 */
		this.notifyJobInProgress = function(){
			$.each(listeners, function(i){
				listeners[i].jobInProgress();
			});
		};
		this.notifyJobDone = function(dataJSONObject){
			$.each(listeners, function(i){
				listeners[i].jobIsDone(dataJSONObject);
			});
		};
		this.notifyTableInitDone = function(dataJSONObject, query){
			$.each(listeners, function(i){
				listeners[i].tableIsInit(dataJSONObject, query);
			});
		};
		this.notifyJobFailed = function(textStatus){
			$.each(listeners, function(i){
				listeners[i].jobFailed(textStatus);
			});
		};
		this.notifyDetailLoaded= function(oid, jsdata){
			$.each(listeners, function(i){
				listeners[i].detailIsLoaded(oid, jsdata);
			});
		};
		this.notifyMetaLoaded= function(jsdata){
			$.each(listeners, function(i){
				listeners[i].metaIsLoaded(jsdata);
			});
		};
		this.notifyCounterpartsLoaded= function(jsdata){
			$.each(listeners, function(i){
				listeners[i].counterpartsAreLoaded(jsdata);
			});
		}
	}
});
