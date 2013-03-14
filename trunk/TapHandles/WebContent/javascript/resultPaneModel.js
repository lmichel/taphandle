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
			Processing.show("Get object detail");
			$.getJSON("getobject", {jsessionid: sessionID, oid: oid }, function(data) {
				Processing.hide();
				if( Processing.jsonError(data, "") ) {
					return;
				}

				else {
					jsdata = data;
					that.notifyDetailLoaded(oid, jsdata);
				}
			});
		};

		this.processShowMeta= function(){
			Processing.show("Get table description");
			$.getJSON("gettable", {jsessionid: sessionID, node: "aharray", name:tp }, function(data) {
				Processing.hide();
				if( Processing.jsonError(data, "get metadata") ) {
					return;
				}
				else {
					that.notifyMetaLoaded(data);
				}
			});
		};

		this.processShowMetaNode= function(treepath){
			Processing.show("Get table description");
			$.getJSON("gettable", {jsessionid: sessionID, node: treepath.nodekey, table:treepath.table }, function(data) {
				Processing.hide();
				if( Processing.jsonError(data, "get attribute handlers") ) {
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
				Modalinfo.info("Cannot identify the current JOB", 'Error');	
			}
		};
		this.downloadFITS = function() {
			var url = "getqueryreport?query=" + escape(current_query) + "&protocol=auto&format=fits";
			Location.changeLocation(url);
		};
		this.downloadZip = function() {
			/*
			 * The mode (TAP/SaadaQL is detected by analysing the title
			 */
			var titlepath = $('#titlepath').html().split('&gt;');
			if( titlepath.length == 3 && titlepath[1] == 'Job' ) {
				Modalinfo.info("Not implemented for TAP queries", 'Info');
			} else {
				var url = "getqueryreport?query=" + escape(current_query) + "&protocol=noprotocol&format=zipball";
				Location.changeLocation(url);
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
				Modalinfo.info("Cannot identify the current JOB", 'Error');	
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
		};
	}
});
