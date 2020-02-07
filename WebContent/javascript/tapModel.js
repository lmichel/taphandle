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
			var limit = getQLimit();
			var upload = tapPosSelector.getUploadedFile();
			var post_data = {jsessionid: sessionID
					, NODE: dataTreeView.dataTreePath.nodekey
					, TREEPATH: dataTreeView.dataTreePath.nodekey + ";" + dataTreeView.dataTreePath.schema + ";" + dataTreeView.dataTreePath.table
					, REQUEST: "doQuery"
					, LANG: 'ADQL'
					, FORMAT: 'json'
					, PHASE: 'RUN'
					, MAXREC: limit
					, QUERY: adqlQueryView.getQuery() };
			if( upload ){
				 post_data.UPLOAD = upload;
			} 
			$.ajax({type: 'POST'
				, url:"runasyncjob"
				, dataType: 'json'
				, data: post_data
			, beforeSend: function(  jqXHR, settins) {
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
		
		this.alixsubmitQuery = function(){
			if( dataTreeView.dataTreePath == null) {
				Modalinfo.error("No data node selected: cannot process any query\nSelect the data table table you want to query in the 'Tap Nodes' panel\nand ClickClick on it");
				return;
			}
			var s_ra = $("#tapwhereposition_rafield_name").html();
			 var s_dec = $("#tapwhereposition_decfield_name").html();
			if(adqlQueryView.getQuery().indexOf("POINT('ICRS', ra, dec)")!=-1){
				var url_base=dataTreeView.info.url;
				var url_query=adqlQueryView.getQuery();
				url_query=url_query.replace(/[\r\n]/g," ");
				url_query=url_query.replace(/\s+/g,' ');
				var format = "votable/td";
				var RUNID = 'TapHandle-archivestsciedu-caomtap;ivoa;obscore';
				var label = "Tap";
				var position = $("#tapPosName_CScoofield").val();
				Alix_Modalinfo.showPopup(position);
				TapCatalog.setTapTableAsMaster({url_base: url_base,
					url_query: url_query,
					format: format,
					RUNID : RUNID,
					label : label});
			}
			else if(s_ra!=undefined && s_dec!=undefined){
				var url_base=dataTreeView.info.url;
				var url_query=adqlQueryView.getQuery();
				url_query=url_query+"WHERE CONTAINS(POINT('ICRS', "+ s_ra + ", "+s_dec+"), CIRCLE('ICRS', {$ra}, {$dec}, {$fov})) = 1";
				//url_query=url_query+"WHERE CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', {$ra}, {$dec}, {$fov})) = 1";
				url_query=url_query.replace(/[\r\n]/g," ");
				url_query=url_query.replace(/\s+/g,' ');
				var format = "votable/td";
				var RUNID = 'TapHandle-archivestsciedu-caomtap;ivoa;obscore';
				var label = "Tap";
				Alix_Modalinfo.showPopup();
				TapCatalog.setTapTableAsMaster({url_base: url_base,
					url_query: url_query,
					format: format,
					RUNID : RUNID,
					label : label});
			}
			else{
				Modalinfo.error("Lack of information");
			}
			
			
			/*var limit = getQLimit();
			var upload = tapPosSelector.getUploadedFile();
			var post_data = {jsessionid: sessionID
					, NODE: dataTreeView.dataTreePath.nodekey
					, TREEPATH: dataTreeView.dataTreePath.nodekey + ";" + dataTreeView.dataTreePath.schema + ";" + dataTreeView.dataTreePath.table
					, REQUEST: "doQuery"
					, LANG: 'ADQL'
					, FORMAT: 'json'
					, PHASE: 'RUN'
					, MAXREC: limit
					, QUERY: adqlQueryView.getQuery() };
			if( upload ){
				 post_data.UPLOAD = upload;
			} 
			$.ajax({type: 'POST'
				, url:"runasyncjob"
				, dataType: 'json'
				, data: post_data
			, beforeSend: function(  jqXHR, settins) {
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
					if(post_data.QUERY.indexOf("POINT('ICRS', ra, dec)")!=-1){
						var url_base=dataTreeView.info.url;
						var url_query=post_data.QUERY;
						var format = "votable/td";
						var RUNID = 'TapHandle-archivestsciedu-caomtap;ivoa;obscore';
						var label = jsondata.treepath.nodekey;
						var position = $("#tapPosName_CScoofield").val();
						Alix_Modalinfo.showPopup(position);
						TapCatalog.setTapTableAsMaster({url_base: url_base,
							url_query: url_query,
							format: format,
							RUNID : RUNID,
							label : label});
					}
					
				}
			}
			});*/
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
