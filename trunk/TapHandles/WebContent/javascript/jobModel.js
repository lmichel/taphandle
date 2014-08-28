

jQuery.extend({
	/**
	 * Example of job description returned by /runasyncjob
	{
	    "session": "45893CC5983E62F0A7AAB426228CB327",
	    "status": {
	        "job": {
	            "startTime": "2013-11-26T11:09:03.326+0100",
	            "results": null,
	            "jobId": "64_CATALOGUE",
	            "quote": {
	                "nil": true
	            },
	            "ownerId": "850C078372883BAAF323A88BD5FF3C77",
	            "destruction": {
	                "nil": true
	            },
	            "executionDuration": 0,
	            "parameters": {
	                "parameter": [
	                    {
	                        "id": "query",
	                        "$": "SELECT  TOP 100  *\nFROM CATALOGUE.CatalogueEntry\n"
	                    },
	                    {
	                        "id": "request",
	                        "$": "doQuery"
	                    },
	                    {
	                        "id": "lang",
	                        "$": "ADQL"
	                    }
	                ]
	            },
	            "runId": "TapHandle-127.0.0.1",
	            "errorSummary": {
	                "nil": true
	            },
	            "endTime": {
	                "nil": true
	            },
	            "phase": "EXECUTING"
	        }
	    },
	    "treepath": {
	        "schema": "CATALOGUE",
	        "nodekey": "saadatap",
	        "table": "CatalogueEntry",
	        "jobid": "64_CATALOGUE"
	    }
	}
	 */
	JobModel: function(description){
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		var that = this;

		var jobDescription=null;
		var sessionId=null;
		var treePath=null;
		var id =null  ;
		var phase=null;
		var query =null;
		var countDown = 10;
		var progressTimer = null;
		var actions  = new Array();
		actions['COMPLETED'] = ["Actions", "Show Query", "Display Result", "Download Result", "Add to Cart", "Send to SAMP", /*"Add to Goodies",*/ "Summary"];
		actions['PENDING']   = ["Actions", "Show Query", "Run",  "Summary"];
		actions['EXECUTING'] = ["Actions", "Show Query", "Summary"];
		actions['QUEUED']    = ["Actions", "Show Query", "Summary"];
		actions['PENDED']    = ["Actions", "Show Query", "Summary"];
		actions['ERROR']     = ["Actions", "Show Query", "Edit Query", "Summary"];

		this.addListener = function(list){
			listeners.push(list);
		};

		this.setDescription = function(description){
			jobDescription = description;
			sessionId = description.session;
			treePath  = description.treepath;
			id        = description.status.job.jobId;
			phase     = description.status.job.phase;
			var parameter = description.status.job.parameters.parameter;
			for( var i=0 ; i<parameter.length ; i++) {
				var pi = parameter[i];
				if( pi.id == "query" ) {
					query = pi["$"];
					break;
				}
			}
		};
		this.setJobStatus = function(description){
			jobDescription.status = description.status;
			id        = description.status.job.jobId;
			phase     = description.status.job.phase;
		};

		this.setDescription(description);

		this.initForm = function(attributesHandlers) {
			that.notifyIsInit(attributesHandlers);
		};
		this.setOnError = function() {
			phase = 'ERROR';
			that.notifyUpdated();		
		};
		this.getPhase = function() {
			return  phase;
		};	

		this.updateStatus = function() {
			$.getJSON("jobsummary", {jsessionid: sessionID, NODE: treePath.nodekey, JOBID: id}, function(jsondata) {
				if( Processing.jsonError(jsondata, "Cannot get summary of job " + id) ) {
					return;
				}
				that.setJobStatus(jsondata);
				that.notifyUpdated();
			});		
		};

		this.checkJobCompleted = function() {
			Processing.show("Waiting for the query result " + countDown  + " (" + phase + ")");
			this.updateStatus();
			if( phase == 'COMPLETED' ) {
				Processing.hide();
				countDown = 0;
				ViewState.fireSubmitOK(dataTreeView.treePath);
			} else  if( phase == 'EXECUTING' || phase == 'QUEUED' || phase == 'PENDED'){
				if( countDown > 0 ) {
					countDown --;
					setTimeout(function(){ that.checkJobCompleted(); }, 1000);
				} else {
					Processing.hide();					
					progressTimer = true;
					setTimeout(function(){ that.checkJobProgress(); }, 5000);
				}
			} else  if( phase == 'ERROR'){
				countDown = 0;
				Modalinfo.error("\nMESSAGE:\n\n" + jobDescription.status.job.errorSummary.message, treePath.nodekey + ' job ' + treePath.jobid + " failed");
			} else {
				Processing.hide();
			}
		};

		this.checkJobProgress = function() {					
			if( progressTimer ) {
				this.updateStatus();
				if( phase == 'EXECUTING' || phase == 'QUEUED' || phase == 'PENDED'){
					progressTimer = setTimeout(function(){ that.checkJobProgress(); }, 5000);
				} 
			}
		};
		/*
		 * User actions on the job
		 */
		this.processJobAction= function(action) {
			Out.info("Process job action: '" + action + "'");
			if( action == 'Show Query') {	
				this.showQuery();				
			} else if( action == 'Summary') {	
				this.showSummary();				
			} else if( action == 'Display Result') {		
				ViewState.fireRecallOK(jobDescription.treepath, query);
			} else if( action == 'Download Result') {			
				this.downloadVotable();
			} else if( action == 'Add to Cart') {			
				cartView.fireAddJobResult(jobDescription.treepath, id);
			} else if( action == 'Send to SAMP') {	
				this.sampBroadcast();			
			} else if( action == ' "Add to Goodies' ){
			} else {
				this.displayResult();
			}
		};
		this.displayResult = function() {
			Processing.show("Get result of job JOB " + id);			
			$.getJSON("jobresult" , {jsessionid: sessionId, NODE: treePath.nodekey, JOBID: id, FORMAT: 'json'}, function(jsondata) {
				Processing.hide();
				if( Processing.jsonError(jsondata, "Cannot get result of job " + id) ) {				
					ViewState.fireSubmitKO();
					that.setOnError();
					return;
				} else {
					//ViewState.fireRecallOK(jobDescription.treepath);
					resultPaneView.showTapResult(treePath, id, jsondata, $('#' + id).data("AttributeHandlers") );
				}
			});					
		};		
		this.showSummary = function() {
			Modalinfo.infoObject(jobDescription.status.job, 'Status of ' + treePath.nodekey + ' job ' + treePath.jobid);
		};

		this.showQuery = function() {
			var report  = "";
			report =query.replace(/\\n/g,'\n            ')+ "\n";
			Modalinfo.info(report, 'Query of job ' + treePath.nodekey + '.' + treePath.jobid);
		};
		this.downloadVotable= function() {
			var url = 'jobresult?NODE=' + treePath.nodekey.trim() + '&JOBID=' + id.trim() + '&jsessionid='+ sessionID;
			Location.changeLocation(url);
		};
		this.sampBroadcast= function() {
			var url =  rootUrl + 'jobresult?NODE=' + treePath.nodekey.trim() + '&JOBID=' + id.trim() + '&jsessionid='+ sessionID;
			WebSamp_mVc.fireSendVoreport(url, "table.load.votable", url);
		};
		this.removeJob= function(){
			Out.info("remove job " + id);
			countDown = 0;
			tapView.fireRemoveJob( id);
			cartView.fireRemoveJobResult(treePath, id);
			progressTimer =  false;			
			$.post("killjob"
					, {jsessionid: sessionID, NODE: treePath.nodekey, JOBID: id}
					, function(jsondata, status) {	
						// Nothing is returned when everything is OK
						if( jsondata == undefined || jsondata == null ) {
							$('#' +  id).remove();		
							return;
						} else if( Processing.jsonError(jsondata, "Cannot delete job: " +id) ) {
							return;
						} else {
							$('#' +  id).remove();		
						}
					});
		};
		/*
		 * Listener notifications
		 */
		this.notifyIsInit = function() {
			$.each(listeners, function(i){
				listeners[i].isInit(jobDescription, actions[phase]);
			});
		};
		this.notifyUpdated = function() {
			$.each(listeners, function(i){
				listeners[i].isUpdated(jobDescription, actions[phase]);
			});
		};
	}
});