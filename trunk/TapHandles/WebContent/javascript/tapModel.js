jQuery.extend({

	TapModel: 

		/**
		 * @param pmodel
		 */
		function(pmodel){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		/*
		 * What we have to store and play with
		 * the values of the following fields are attached to the current selected node.
		 */
		var attributesHandlers = new Array();
		var editors = new Array();
		//var storedTreepath = new Array();
		var lastJob;
		var pendingJobs = new Array();
		var lastTimer = null;
		var listTimer = null;
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		};


		this.submitQuery = function(){
			Processing.show("Run job");
			Out.infoTrace("submit");
			Out.info(' start ' + $('#saadaworkingContent').css('display'));
			setTimeout("Out.info(' timeout ' +  $('#saadaworkingContent').css('display') + ' ' + $('#saadaworkingContent').css('visibility'))", 200);
			setTimeout("Out.info(' timeout2 ' + $('#saadaworkingContent').css('display') + ' ' + $('#saadaworkingContent').css('visibility'));", 2000);
			var limit = getQLimit();
			$.ajax({type: 'POST'
				, url:"runasyncjob"
					, dataType: 'json'
						, data: {jsessionid: sessionID
							, NODE: dataTreeView.treePath.nodekey
							, TREEPATH: dataTreeView.treePath.nodekey + ";" + dataTreeView.treePath.schema + ";" + dataTreeView.treePath.table
							, REQUEST: "doQuery"
								, LANG: 'ADQL'
									, FORMAT: 'json'
										, PHASE: 'RUN'
											, MAXREC: limit
											, UPLOAD:tapConstraintEditor.getUploadedFile()
											, QUERY: adqlQueryView.getQuery() }
			, beforeSend: function(  jqXHR, settins) {
				Out.info('before ' + $('#saadaworkingContent').css('display'));
			}
			, error: function(  jqXHR,  textStatus,  errorThrown) {
				Processing.hide();
				Modalinfo.error(errorThrown);
			}
			, success: function(jsondata) {
				Processing.hide();
				if( Processing.jsonError(jsondata, "tap/async Cannot get job status") ) {
					return;
				} else {
					jv  = new $.JobView(jsondata.status.job.jobId);
					jm = new $.JobModel(dataTreeView.treePath, jsondata.status.job, jsondata.session);
					new $.JobControler(jm, jv);
					lastJob = jv;
					lastJob.fireInitForm('tapjobs', attributesHandlers);
					lastTimer = setTimeout("tapView.fireCheckJobCompleted(\"" + dataTreeView.treePath.nodekey + "\", \"" + jsondata.status.job.jobId + "\", \"9\");", 1000);
				}
			}
			});
		};

		this.checkJobCompleted = function(nodeKey, jid, counter) {
			if( lastJob == null ) {
				lastTimer = null;
				return;
			}
			else if( lastJob.fireGetPhase() == 'COMPLETED' ) {
				that.displayResult(nodeKey, jid);	
			}
			else if( counter < 0 ) {
				Processing.hide();
				Modalinfo.info("Job " + jid + " not completed: processed asynchronously", 'Info');
				pendingJobs[jid] = lastJob;
				if( Object.keys(pendingJobs).length == 1 ) {
					listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
				}
			}
			else  if( lastJob.fireGetPhase() == 'EXECUTING' || lastJob.fireGetPhase() == 'QUEUED'
				|| lastJob.fireGetPhase() == 'PENDED'){
				Processing.show("Run job " + counter );
				lastJob.fireUpdateStatus();
				lastTimer = setTimeout("tapView.fireCheckJobCompleted(\"" + nodeKey + "\", \"" + jid + "\", \"" + (counter-1) + "\");", 1000);
			}				
			else {
				Processing.hide();
			}

		};

		this.updateRunningJobList = function() {    
			for( var k in  pendingJobs ) {
				pendingJobs[k].fireUpdateStatus();
			} 
			for( var k in  pendingJobs ) {
				var phase = pendingJobs[k].fireGetPhase();
				if( phase != 'EXECUTING' && phase != 'QUEUED' && phase != 'PENDED') {
					delete pendingJobs[k];					
				}
			}
			if( Object.keys(pendingJobs).length > 0  ) {
				listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
			}
			else {
				listTimer = null;
			}
		};

		this.removeJob = function(id) {
			Out.info("remove job " + id);
			if( lastTimer != null && lastJob != null && id == lastJob.getId()) {
				clearTimeout(lastTimer);
				Out.info("Remove last job");
				lastJob = null;
			}
			var timerOn = false;
			if( listTimer != null ) {timerOn = true;clearTimeout(listTimer);}			
			delete pendingJobs[id];
			if( timerOn ) { listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);}
		};

		this.refreshJobList= function() {
			Processing.show("Refresh job list");
			$.getJSON("joblist", {jsessionid: sessionID, FORMAT: "json"}, function(jsondata) {
				Processing.hide();
				if( Processing.jsonError(jsondata, "Cannot get jobs list") ) {
					return;
				}
				Processing.show("Update Job Status");
				for( var i=0 ; i<jsondata.length ; i++) {
					var job = jsondata[i];
					jv  = new $.JobView(job.jobid);
					jm = new $.JobModel(job.treepath, job.status.job, job.session);

					new $.JobControler(jm, jv);						
					jv.fireInitForm('tapjobs');
					if( jv.fireGetPhase() == 'EXECUTING' ) {
						pendingJobs[job.jobid] = jv;
					}
					listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
				}
				Processing.hide();
			});		
		};

		this.processJobAction= function(nodekey,jid, session) {
			var val = $('#' + jid + "_actions").val(); 
			Out.info("Process job action: '" + val + "'");
			$('#' + jid + "_actions").val('Actions'); 
			if( val == 'Show Query') {	
				that.showQuery(nodekey,jid);				
			} else if( val == 'Summary') {	
				that.showSummary(nodekey,jid);				
			} else if( val == 'Display Result') {			
				that.displayResult(nodekey,jid);
			} else if( val == 'Download Result') {			
				that.downloadVotable(nodekey,jid);
			} else if( val == 'Add to Cart') {			
				cartView.fireAddJobResult(nodekey,jid);
			} else if( val == 'Send to SAMP') {				
				var url = rootUrl + 'jobresult?node=' + nodekey.trim() + '&jobid=' + jid.trim()+ '&session=' + sessionID;
				WebSamp_mVc.fireSendVoreport(url, "table.load.votable", nodekey.trim() + "/job_" + jid.trim());
			} else if( val == 'Edit Query' ) {
				that.editQuery(nodekey,jid);
			} else if( val == ' "Add to Goodies' ){
			}
		};

		this.showQuery = function(nodekey,jid) {
			$.getJSON("jobsummary" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( Processing.jsonError(jsondata, "Cannot get summary of job") ) {
					return;
				}
				var report  = "";
				var pa = jsondata.status.job.parameters.parameter;
				for( var i=0 ; i< pa.length ;i++ ) {
					var p = pa[i];
					if( p.id.toLowerCase() == "query" ) {
						report =p.$.replace(/\\n/g,'\n            ')+ "\n";
						Modalinfo.info(report, 'Query of job ' + nodekey + '.' + jid);
						return;
					}
				}
				Modalinfo.info(report, 'No queryfound in ' + jsondata);
			});					
		};
		this.showSummary = function(nodekey, jid) {
			$.getJSON("jobsummary" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( Processing.jsonError(jsondata, "Cannot get summary of job "+ nodekey + '.' + jid) ) {
					return;
				}
				var report  = "";
				if( jsondata.status != undefined && jsondata.status.job != undefined){
					report += "jobId            : " + jid + "\n";
					report += "owner            : " + jsondata.status.job.owner+ "\n";
					report += "phase            : " + jsondata.status.job.phase+ "\n";
					report += "startTime        : " + jsondata.status.job.startTime+ "\n";
					report += "endTime          : " + jsondata.status.job.endTime+ "\n";
					report += "executionDuration: " + jsondata.status.job.executionDuration+ "\n";
					report += "destruction      : " + jsondata.status.job.destruction+ "\n";
					report += "parameters " + "\n";
					for( var i=0 ; i<jsondata.status.job.parameters.parameter.length ; i++ ) {
						report += "    "  + jsondata.status.job.parameters.parameter[i].id + "  : " +  jsondata.status.job.parameters.parameter[i].$ + "\n";

					}
					if( jsondata.status.job.results != null ) {
						for( var i=0 ; i<jsondata.status.job.results.length ; i++ ) {
							report += "results #" + (i+1) + "\n";
							report += "    id  : " + jsondata.status.job.results[i].id+ "\n";
							report += "    type: " + jsondata.status.job.results[i].type+ "\n";
							report += "    href: " + jsondata.status.job.results[i].href+ "\n";
						}
					}
					if( jsondata.status.job.errorSummary != null ) {
						report += "error: " + jsondata.status.job.errorSummary.message+ "\n";					
					}
				} else {
					report  = "No Jobs status returned";
				}
				Modalinfo.info(report,  "Summary of job "+ nodekey + '.' + jid);

			});					
		};
		this.displayResult = function(nodekey, jid) {
			Processing.show("Get result of job " + jid);			
			$.getJSON("jobresult" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid, FORMAT: 'json'}, function(jsondata) {
				Processing.hide();
				if( Processing.jsonError(jsondata, "Cannot get result of job " + jid) ) {				
					$('#resultpane').html();
					if( lastJob != null ) {
						lastJob.fireSetOnError();
					}
					return;
				}
				else {
					var treepath = $('#' + jid).data().treepath;
					treepath.jobid = jid;
					dataTreeView.setTitlePath(treepath);
					resultPaneView.showTapResult(dataTreeView.treePath, jid, jsondata, $('#' + jid).data("AttributeHandlers") );
				}
			});					
		};
		this.editQuery= function(nodekey,jid) {
			Processing.show("Get Job summary");			
			$.getJSON("jobsummary" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid}, function(jsonsum) {
				Processing.hide();
				if( Processing.jsonError(jsonsum, "Cannot get summary of job") ) {
					return;
				}
				var pa = jsonsum.status.job.parameters.parameter;
				var default_query = "";
				for( var i=0 ; i< pa.length ;i++ ) {
					var p = pa[i];
					if( p.id.toLowerCase() == "query" ) {
						default_query = p.$.replace(/\\n/g,'\n            ')+ "\n";
						break;
					}
				}
				that.processTreeNodeEvent(jsonsum.treepath, false, default_query);
			});					
		};

		this.downloadVotable= function(nodekey,jid) {
			var url = 'jobresult?NODE=' + nodekey.trim() + '&JOBID=' + jid.trim() + '&jsessionid='+ sessionID;
			Location.changeLocation(url);
		};

		this.sampBroadcast= function(nodekey,jid) {
			$.getJSON("tap/async/" + jid , function(jsondata) {
				if( Processing.jsonError(jsondata, "Cannot get summary of job " + jid) ) {
					return;
				}
				for( var i=0 ; i<jsondata.results.length ; i++ ) {
					var url = jsondata.results[i].href;
					if( url.endsWith("xml")) {
						WebSamp_mVc.fireSendVoreport(url);;
						return;
					}
				}
				Modalinfo.info("No result file looking like a VOTable, sorry.", 'Error');
			});					

		};

		this.processRemoveFirstAndOr = function(key) {
			delete editors[key];
			for( var k in editors ) {
				editors[k].controlRemoveAndOr();
				break;
			}
		};

		/*
		 * Listener notifications
		 */
		this.notifyInitDone = function(){
			$.each(listeners, function(i){
				listeners[i].isInit(attributesHandlers, attributesHandlers);
			});
		};
		this.notifyCoordDone = function(key, constr){
			$.each(listeners, function(i){
				listeners[i].coordDone(key, constr);
			});
		};
		this.notifyQueryUpdated= function(query) {
			$.each(listeners, function(i){
				listeners[i].queryUpdated(query);
			});
		};
		this.notifyNewJobs= function() {
			lastJob.controlInitForm();
		};
		this.notifyTableChanged= function() {
			$.each(listeners, function(i){
				listeners[i].tableChanged(attributesHandlers, attributesHandlers);
			});
		};
	}
});
