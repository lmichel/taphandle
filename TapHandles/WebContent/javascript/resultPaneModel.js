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
		 * List of OIDS displyed by the detail modal box
		 */
		var histo = new Array();
		var histo_ptr = 0;
		/**
		 * Query displayed data are coming from
		 */
		var current_query = "";
		var treePath = new Array();

		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		}
		/*
		 * Event processing
		 */
		this.setTreePath = function(treepath){
			treePath = treepath;
		}

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
					histo[histo.length] = oid;
					histo_ptr = histo.length - 1;
					var limit = 'MaxRight';
					if( histo.length == 1  ) limit = 'NoHisto';
					that.notifyDetailLoaded(oid, jsdata, limit);
				}
			});
		}

		this.processShowMeta= function(){
			var jsdata ="";
			showProcessingDialog("Get tabke description");
			var tp;
			if( treePath.length == 3 ) {
				tp = treePath[2];
			}
			else {
				tp = treePath[0] + "." + treePath[1];
			}
			$.getJSON("gettable", {node: "aharray", name:tp }, function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "get metadata") ) {
					return;
				}
				else {
					histo[histo.length] = "meta: " + tp;
					histo_ptr = histo.length - 1;
					var limit = 'MaxRight';
					if( histo.length == 1  ) limit = 'NoHisto';
					that.notifyMetaLoaded(data, limit);
				}
			});
		}

		this.processShowMetaNode= function(treepath){
			var jsdata ="";
			showProcessingDialog("Get table description");
			if( treepath.length != 3 ) {
				logged_alert("Bad node tree path " + treepath, 'Internal Error');
				return;
			}
			var tp = treePath[0] + "." + treePath[1] + "." + treePath[1];
			$.getJSON("gettable", {node: treepath[0], table:treepath[2] }, function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "get attribute handlers") ) {
					return;
				}
				else {
					histo[histo.length] = "meta: " + tp;
					histo_ptr = histo.length - 1;
					var limit = 'MaxRight';
					if( histo.length == 1  ) limit = 'NoHisto';
					that.notifyMetaLoaded(data, limit);
				}
			});
		}

		this.processShowSources= function(oid){
			showProcessingDialog("Get catalogue sources");
			$.getJSON("getobject", {target: "sources", oid: oid }, function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "get catalogue sources") ) {
					return;
				}
				else {
					jsdata = data;
					tapView.fireTreeNodeEvent(jsdata.treepath.split('.'));	
					setTitlePath(jsdata.treepath.split('.'));
					that.notifyTableInitDone(jsdata);	
					/*
					 * should be done in the async callback intiated by saadaqlView.fireTreeNodeEvent
					 */
					setTimeout("saadaqlView.fireOIDTableEvent(\"" + oid + "\"); ", 2000);
					current_query = jsdata.query;
				}
			});
		}

		this.processShowSimbad= function(coord){
			window.open("simbad?coord=" + escape(coord), "Simbad");
		}

		this.processPreviousRecord= function(){
			var jsdata ="";
			if( histo_ptr <= 0 ) {
				logged_alert("end of the historic reached", 'Info');
				return;
			}
			histo_ptr --;

			var oid = histo[histo_ptr];
			showProcessingDialog("Get meta data");
			if( oid.match(/^meta:\s*/)) {
				$.getJSON("getmeta", {query: "aharray", name:oid.split(' ')[1] }, function(data) {
					hideProcessingDialog();
					if( processJsonError(data, "get attribute handlers") ) {
						return;
					}
					else {
						var limit = '';
						if( histo_ptr == 0 ) limit = 'MaxLeft';
						that.notifyMetaLoaded(data, limit);
					}
				});
			}
			else {
				$.getJSON("getobject", {oid: oid }, function(data) {
					hideProcessingDialog();
					if( processJsonError(data, "get object") ) {
						return;
					}
					else {
						jsdata = data;
						var limit = '';
						if( histo_ptr == 0 ) limit = 'MaxLeft';
						that.notifyDetailLoaded(oid, jsdata, limit);
					}
				});
			}
		}
		this.processNextRecord= function(){
			var jsdata ="";
			if( histo_ptr >= (histo.length - 1) ) {
				logged_alert("end of the historic reached", 'Info');
				return;
			}
			histo_ptr ++;
			var oid = histo[histo_ptr];
			showProcessingDialog("Get meta data");
			if( oid.match(/^meta:\s*/)) {
				$.getJSON("getmeta", {query: "aharray", name:oid.split(' ')[1] }, function(data) {
					hideProcessingDialog();
					if( processJsonError(data, "get attribute handlers") ) {
						return;
					}
					else {
						var limit = '';
						if( histo_ptr == (histo.length - 1) ) limit = 'MaxRight';
						that.notifyMetaLoaded(data, limit);
					}
				});
			}
			else {
				$.getJSON("getobject", {oid: oid }, function(data) {
					hideProcessingDialog();
					if( processJsonError(data, "get object") ) {
						return;
					}
					else {
						jsdata = data;
						var limit = '';
						if( histo_ptr == (histo.length - 1) ) limit = 'MaxRight';
						that.notifyDetailLoaded(oid, jsdata, limit);
					}
				});
			}
		}

		this.processShowCounterparts= function(poid, relationname){

			var jsdata ="";
			var param = {oid: poid, relation: relationname};
			showProcessingDialog("Get counterparts");
			$.getJSON("getobject", param , function(data) {
				hideProcessingDialog();
				if( processJsonError(data, "get object") ) {
					return;
				}
				else {
					jsdata = data;
					that.notifyCounterpartsLoaded(jsdata);
				}
			});
		}
		
		this.downloadVOTable = function() {
			/*
			 * Job ids is detected by analysing the title
			 */
			var titlepath = $('#titlepath').text().split('>');
			if( titlepath.length == 3  ) {
				tapView.fireDownloadVotable(titlepath[0], titlepath[2].replace('job ', ''));
			}
			else {
				logged_alert("Cannot identify the current JOB", 'Error');	
			}
		}
		this.downloadFITS = function() {
			var url = "getqueryreport?query=" + escape(current_query) + "&protocol=auto&format=fits";
			window.open(url, 'DL FITS');
		}
		this.downloadZip = function() {
			/*
			 * The mode (TAP/SaadaQL is detected by analysing the title
			 */
			var titlepath = $('#titlepath').html().split('&gt;');
			if( titlepath.length == 3 && titlepath[1] == 'Job' ) {
				logged_alert("Not implemented for TAP queries", 'Info');
			}
			else {
				var url = "getqueryreport?query=" + escape(current_query) + "&protocol=noprotocol&format=zipball";
				window.open(url, 'DL Zipball');
			}
		}
		this.sampBroadcast = function() {
			/*
			 * The mode (TAP/SaadaQL is detected by analysing the title
			 */
			var titlepath = $('#titlepath').html().split('&gt;');
			if( titlepath.length == 3 && titlepath[1] == 'Job' ) {
				tapView.fireSampBroadcast(titlepath[2]);
			}
			else {

				if (current_query.match(/\s*Select\s+IMAGE\s*.*/)) {
					sampView.fireSendSIAQuery(current_query);
				}
				else if (current_query.match(/\s*Select\s+SPECTRUM\s*.*/)) {
					sampView.fireSendSSAQuery(current_query);
				}
				else  if (current_query.match(/\s*Select\s+ENTRY\s*.*/)) {
					sampView.fireSendCSQuery(current_query);
				}
				else {
					logged_alert("Samp messages are not  implemented for this data category.", 'Info')
				}
			}

//			var url = "getqueryreport?query=" + escape(current_query) + "&protocol=auto&format=fits";
//			window.open(url, 'DL VOTable');
		}

		/*
		 * Listener notifications
		 */
		this.notifyJobInProgress = function(){
			$.each(listeners, function(i){
				listeners[i].jobInProgress();
			});
		}
		this.notifyJobDone = function(dataJSONObject){
			$.each(listeners, function(i){
				listeners[i].jobIsDone(dataJSONObject);
			});
		}
		this.notifyTableInitDone = function(dataJSONObject, query){
			$.each(listeners, function(i){
				listeners[i].tableIsInit(dataJSONObject, query);
			});
		}
		this.notifyJobFailed = function(textStatus){
			$.each(listeners, function(i){
				listeners[i].jobFailed(textStatus);
			});
		}
		this.notifyDetailLoaded= function(oid, jsdata, limit){
			$.each(listeners, function(i){
				listeners[i].detailIsLoaded(oid, jsdata, limit);
			});
		}
		this.notifyMetaLoaded= function(jsdata, limit){
			$.each(listeners, function(i){
				listeners[i].metaIsLoaded(jsdata, limit);
			});
		}
		this.notifyCounterpartsLoaded= function(jsdata){
			$.each(listeners, function(i){
				listeners[i].counterpartsAreLoaded(jsdata);
			});
		}
	}
});
