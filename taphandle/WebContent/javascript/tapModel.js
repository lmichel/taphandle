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

		var jobs = new Array();

		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		};


		this.submitQuery = function(){
			if( dataTreeView.dataTreePath == null) {
				Modalinfo.error("No data node selected: cannot process any query\nSelect the data table table you want to query in the 'Tap Nodes' panel\nand ClickClick on it");
				return;
			}
			Processing.show("Run job");
			Out.info(' start ' + $('#saadaworkingContent').css('display'));
			var limit = getQLimit();
			$.ajax({type: 'POST'
				, url:"runasyncjob"
					, dataType: 'json'
						, data: {jsessionid: sessionID
							, NODE: dataTreeView.dataTreePath.nodekey
							, TREEPATH: dataTreeView.dataTreePath.nodekey + ";" + dataTreeView.dataTreePath.schema + ";" + dataTreeView.dataTreePath.table
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
					Processing.show("Run job " +  jsondata.status.job.jobId);
					var jobParam = {"dataTreePath" : jQuery.extend({}, dataTreeView.dataTreePath), "status": jsondata.status, "session": jsondata.session};
					jobParam.dataTreePath.jobid = jsondata.status.job.jobId;
					
					jv = new $.JobView();
					jm = new $.JobModel(jobParam);
					new $.JobControler(jm, jv);
					jobs[jsondata.status.job.jobId] = jv;
					jv.fireInitForm('tapjobs', attributesHandlers);
					ViewState.fireSubmitted(dataTreeView.dataTreePath,jsondata.status.job.jobId  );
					jv.fireCheckJobCompleted();
				}
			}
			});
		};

		this.selectJob = function( id) {
			for( var i in jobs) {
				jobs[i].setSelected(false);
			}
			jobs[id].setSelected(true);
		};
		
		this.removeJob = function(id) {
			delete jobs[id];
		};

		/**
		 * Just called at init time to display the job still stored in the session (not working with sessionID in URLs)
		 */
		this.refreshJobList= function() {
			//Processing.show("Refresh job list");
			$.getJSON("joblist", {jsessionid: sessionID, FORMAT: "json"}, function(jsondata) {
				//Processing.hide();
				if( Processing.jsonError(jsondata, "Cannot get jobs list") ) {
					return;
				}
				//Processing.show("Update Job Status");
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
				//Processing.hide();
			});		
		};
		this.displayResult = function(jdataTreePath) {
			jobs[jdataTreePath.jobid].fireJobAction();
			this.selectJob(jdataTreePath.jobid);				
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
