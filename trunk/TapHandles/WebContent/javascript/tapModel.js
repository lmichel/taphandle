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
		 */
		var attributesHandlers = new Array();
		var selectAttributesHandlers = new Array();
		var editors = new Array();
		var selects = new Array();
		var alphakw ;
		var deltakw ;
		var const_key = 1;
		var table ;
		var storedTreepath = new Array();
		var lastJob;
		var pendingJobs = new Array();
		var lastTimer = null;
		var listTimer = null;
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		}
		/*
		 * Event processing
		 */
		this.processTreeNodeEvent = function(treepath, andsubmit, default_query){
			var jsondata;
			var params;
			showProcessingDialog("Waiting on table description");
			if( treepath.length != 3 ) {
				logged_alert("Bad tree path " + treepath, 'Server Error');
				return;
			}
			storedTreepath = treepath;
			$.getJSON("gettableatt", {node: treepath[0], table:treepath[2] }, function(jsondata) {
				hideProcessingDialog();
				if( processJsonError(jsondata, "Cannot get meta data") ) {
					return;
				}
				editors = new Array();
				selects = new Array();
				selectattributesHandlers = new Array();
				attributesHandlers = new Array();
				alphakw = "";
				deltakw = "";
				table = treepath[2];
				for( i=0 ; i<jsondata.attributes.length ; i++ ) {
					attributesHandlers[jsondata.attributes[i].name] = jsondata.attributes[i];
				}
				selectAttributesHandlers = new Array();
				for( i=0 ; i<jsondata.attributes.length ; i++ ) {
					selectAttributesHandlers[jsondata.attributes[i].name] = jsondata.attributes[i];
				}
				that.notifyInitDone();		
				if( default_query == null || default_query == "") {
					that.notifyQueryUpdated("SELECT TOP " + getQLimit() + " * \n FROM " + jsondata.table );
				}
				else {
					that.notifyQueryUpdated(default_query);				
				}
				if( andsubmit ) {
					that.submitQuery();
				}
			});
		}

		this.processSelectEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = selectAttributesHandlers[kwname];
			var m = new $.KWConstraintModel(true, { "name" : ah.name
				, "dataType" : "Select"
					, "ucd" : ah.ucd
					, "utype" : ah.utype
					, "unit" : ah.unit
					, "description" : ah.description}
			, this);
			var div_key = "kw" +  const_key;
			var v = new $.KWConstraintView(div_key, 'tapselectlist');
			selects[div_key] =  new $.KWConstraintControler(m, v);
			m.notifyInitDone();
			const_key++;
		}

		this.processAttributeEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = attributesHandlers[kwname];
			var first = true;
			for( k in editors ) {
				first = false;
				break;
			}
			var m = new $.KWConstraintModel(first, ah, this, '');
			var div_key = "kw" +  const_key;
			var v = new $.KWConstraintView(div_key, 'tapconstraintlist');
			editors[div_key] =  new $.KWConstraintControler(m, v);
			that.updateQuery();
			m.notifyInitDone();
			const_key++;
		}


		this.processInputCoord= function(coord, radius, mode){
			var frame = 'J2000,ICRS';
			that.notifyCoordDone("coo" +  const_key, 'isInCircle("' + coord + '", ' + radius + ', ' + frame + ')');
			that.updateQuery();
			var alphaname = $('#kwalpha_name').html();
			var deltaname = $('#kwdelta_name').html();
			if( alphaname == "" || deltaname.length == "" ) {
				logged_alert('Give one KW for both alpha and delta', 'Info');
				return;
			}
			var coords = $('#tapcoordval').val().split(' ');
			if( coords.length != 2 || isNaN(coords[0]) || isNaN(coords[1])) {
				logged_alert('Both coordinates must be given in degrees', 'Info');
				return;				
			}
			var rs = $('#tapradiusval').val();
			if( isNaN(rs) ){
				logged_alert('Radius/Size must be given in degrees', 'Info');
				return;								
			}
			var box_summary = coords[0] + "," + coords[1] + "," + rs
			var first = true;
			for( k in editors ) {
				first = false;
				break;
			}
			var m = new $.KWConstraintModel(first, { "name" : alphaname + " " + deltaname
				, "dataType" : "ADQLPos"
					, "ucd" : "adql.coor.columns"
						, "utype" : ""
							, "unit" : "deg"
								, "description" : "Virtual Column"}
			, this, box_summary);

			var div_key = "kw" +  const_key;
			var v = new $.KWConstraintView(div_key, 'tapconstraintlist');
			editors[div_key] =  new $.KWConstraintControler(m, v);
			that.updateQuery();
			m.notifyInitDone();
			const_key++;

		}

		this.processAlphaEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = selectAttributesHandlers[kwname];
			var m = new $.KWConstraintModel(true, { "name" : ah.name
				, "dataType" : "Select"
					, "ucd" : ah.ucd
					, "utype" : ah.utype
					, "unit" : ah.unit
					, "description" : ah.description}
			, this, '');
			var div_key = "kwalpha";
			var v = new $.KWConstraintView(div_key, 'tapalpha');
			alphakw =  new $.KWConstraintControler(m, v);
			m.notifyInitDone();

		}

		this.processDeltaEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = selectAttributesHandlers[kwname];
			var m = new $.KWConstraintModel(true, { "name" : ah.name
				, "dataType" : "Select"
					, "ucd" : ah.ucd
					, "utype" : ah.utype
					, "unit" : ah.unit
					, "description" : ah.description}
			, this, '');
			var div_key = "kwdelta";
			var v = new $.KWConstraintView(div_key, 'tapdelta');
			deltakw =  new $.KWConstraintControler(m, v);		
			m.notifyInitDone();

		}


		this.updateQuery = function() {
			var query = "SELECT ";
			var cq = "";

			cq = "";
			$("#tapselectlist div").each(function() {
				if( cq.length > 0 ) cq += " , ";
				cq +=  '    ' + selects[$(this).attr('id')].getADQL(true) ;
				if( cq.length > 50 ) cq += '\n';
			}); 
			if( cq.length > 0 ) {
				query +=  cq ;
			}
			else {
				query += '*';
			}
			query += "\nFROM " + table;

			cq = "";
			$("#tapconstraintlist div").each(function() {
				cq +=  '    ' + editors[$(this).attr('id')].getADQL(true) ;
				if( cq.length > 50 ) cq += '\n';
			}); 
			if( cq.length > 0 ) {
				query += "\nWHERE \n" + cq + "";
			}

			that.notifyQueryUpdated(query);
		}

		this.submitQuery = function(){
			showProcessingDialog("Run job");
			var limit = getQLimit();
			$.post("runasyncjob"
					, {NODE: storedTreepath[0], TREEPATH: storedTreepath[0] + ";" + storedTreepath[1] + ";" + storedTreepath[2], REQUEST: "doQuery", LANG: 'ADQL', FORMAT: 'json', PHASE: 'RUN', MAXREC: limit,QUERY: ($('#adqltext').val()) }
					, function(jsondata, status) {
						if( processJsonError(jsondata, "tap/async Cannot get jobs list") ) {
							return;
						}
						else {
							jv  = new $.JobView(jsondata.job.jobId);
							logMsg("submitQuery " + storedTreepath[0] + " " +  jsondata);
							jm = new $.JobModel(storedTreepath[0], jsondata.job);
							new $.JobControler(jm, jv);
							lastJob = jv;
							lastJob.fireInitForm('tapjobs');
							lastTimer = setTimeout("tapView.fireCheckJobCompleted(\"" + storedTreepath[0] + "\", \"" + jsondata.job.jobId + "\", \"9\");", 1000);
						}
					});
		}

		this.checkJobCompleted = function(nodeKey, jid, counter) {
			if( lastJob == null ) {
				lastTimer = null;
				return;
			}
			else if( lastJob.fireGetPhase() == 'COMPLETED' ) {
				that.displayResult(nodeKey, jid);	
			}
			else if( counter < 0 ) {
				hideProcessingDialog();
				logged_alert("Job " + jid + " not completed: processed asynchronously", 'Info');
				pendingJobs[jid] = lastJob;
				console.log(Object.keys(pendingJobs).length);
				if( Object.keys(pendingJobs).length == 1 ) {
					listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
				}
			}
			else {
				showProcessingDialog("Run job " + counter );
				lastJob.fireUpdateStatus();
				lastTimer = setTimeout("tapView.fireCheckJobCompleted(\"" + nodeKey + "\", \"" + jid + "\", \"" + (counter-1) + "\");", 1000);
			}
		}

		this.updateRunningJobList = function() {    
			for( var k in  pendingJobs ) {
				pendingJobs[k].fireUpdateStatus();
			} 
			for( var k in  pendingJobs ) {
				var phase = pendingJobs[k].fireGetPhase();
				if( phase != 'EXECUTING' ) {
					delete pendingJobs[k];					
				}
			}
			if( Object.keys(pendingJobs).length > 0  ) {
				listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
			}
			else {
				listTimer = null;
			}
		}

		this.removeJob = function(id) {
			console.log("remove job " + id);
			if( lastTimer != null && id == lastJob.getId()) {
				clearTimeout(lastTimer);
				console.log("Remove last job");
				lastJob = null;
			}
			var timerOn = false;
			if( listTimer != null ) {timerOn = true;clearTimeout(listTimer);}			
			delete pendingJobs[id];
			if( timerOn ) { listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);}
		}

		this.refreshJobList= function() {
			logMsg('refreshJobList');
			showProcessingDialog("Refresh job list");
			$.getJSON("joblist", {FORMAT: "json"}, function(jsondata) {
				hideProcessingDialog();
				if( processJsonError(jsondata, "Cannot get jobs list") ) {
					return;
				}
				showProcessingDialog("Update Job Status");
				for( var i=0 ; i<jsondata.length ; i++) {
					var job = jsondata[i];
					logMsg("refreshJobList "+ job.nodekey + " " + job.jobid);
					jv  = new $.JobView(job.jobid);
					jm = new $.JobModel(job.nodekey, job.status.job);
					new $.JobControler(jm, jv);						
					jv.fireInitForm('tapjobs');
					if( jv.fireGetPhase() == 'EXECUTING' ) {
						pendingJobs[job.jobid] = jv;
					}
					listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
				}
				hideProcessingDialog();
			});		
		}

		this.processJobAction= function(nodekey,jid) {
			var val = $('#' + jid + "_actions").val(); 
			logMsg("processJobAction" + val);
			$('#' + jid + "_actions").val('Actions'); 
			if( val == 'Show Query') {	
				that.showQuery(nodekey,jid);				
			}
			else if( val == 'Summary') {	
				that.showSummary(nodekey,jid);				
			}
			else if( val == 'Display Result') {			
				that.displayResult(nodekey,jid);
			}			
			else if( val == 'Download Result') {			
				that.downloadVotable(nodekey,jid);
			}			
			else if( val == 'Add to Cart') {			
				cartView.fireAddJobResult(nodekey,jid);
			}			
			else if( val == 'Edit Query' ) {
				that.editQuery(nodekey,jid);
			}
		}

		this.showQuery = function(nodekey,jid) {
			$.getJSON("jobsummary" , {NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( processJsonError(jsondata, "Cannot get summary of job") ) {
					return;
				}
				var report  = "";
				report = jsondata.parameters.query.replace(/\\n/g,'\n            ')+ "\n";
				logged_alert(report, 'Query of job ' + nodekey + '.' + jid);
			});					
		}
		this.showSummary = function(nodekey, jid) {
			logMsg(storedTreepath);
			$.getJSON("jobsummary" , {NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( processJsonError(jsondata, "Cannot get summary of job "+ nodekey + '.' + jid) ) {
					return;
				}
				var report  = "";
				report += "jobId            : " + jid + "\n";
				report += "owner            : " + jsondata.job.owner+ "\n";
				report += "phase            : " + jsondata.job.phase+ "\n";
				report += "startTime        : " + jsondata.job.startTime+ "\n";
				report += "endTime          : " + jsondata.job.endTime+ "\n";
				report += "executionDuration: " + jsondata.job.executionDuration+ "\n";
				report += "destruction      : " + jsondata.job.destruction+ "\n";
				report += "parameters " + "\n";
				for( var i=0 ; i<jsondata.job.parameters.parameter.length ; i++ ) {
					report += "    "  + jsondata.job.parameters.parameter[i].id + "  : " +  jsondata.job.parameters.parameter[i].$ + "\n";

				}
				if( jsondata.job.results != null ) {
					for( var i=0 ; i<jsondata.job.results.length ; i++ ) {
						report += "results #" + (i+1) + "\n";
						report += "    id  : " + jsondata.job.results[i].id+ "\n";
						report += "    type: " + jsondata.job.results[i].type+ "\n";
						report += "    href: " + jsondata.job.results[i].href+ "\n";
					}
				}
				if( jsondata.job.errorSummary != null ) {
					report += "error: " + jsondata.job.errorSummary.message+ "\n";					
				}
				logged_alert(report,  "Summary of job "+ nodekey + '.' + jid);

			});					
		}
		this.displayResult = function(nodekey, jid) {
			showProcessingDialog("Get Job result");			
			$.getJSON("jobresult" , {NODE: nodekey, JOBID: jid, FORMAT: 'json'}, function(jsondata) {
				hideProcessingDialog();
				if( processJsonError(jsondata, "Cannot get result of job " + jid) ) {
					return;
				}
				else {
					var treenode = $('#' + jid).data().treenode;
					setTitlePath([ treenode.node, '--', ' job ' + treenode.jobid ]);

					resultPaneView.showTapResult(storedTreepath, jid, jsondata);
				}
			});					
		}
		this.editQuery= function(nodekey,jid) {
			showProcessingDialog("Get Job treepath");			
			$.getJSON("jobtreepath" , {NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( processJsonError(jsondata, "Cannot get treepath of job " + jid) ) {
					return;
				}
				var query  = "";
				$.getJSON("jobsummary" , {NODE: nodekey, JOBID: jid}, function(jsonsum) {
					if( processJsonError(jsondata, "Cannot get summary of job") ) {
						return;
					}
					for( var i=0 ; i<jsonsum.job.parameters.parameter.length ; i++ ) {
						if( jsonsum.job.parameters.parameter[i].id.toLowerCase() == 'query') {
							query = jsonsum.job.parameters.parameter[i].$.replace(/\\n/g,'\n            ')+ "\n";
						}
						that.processTreeNodeEvent(jsondata.path, false, query);
					}
				});					
			});					
		}

		this.downloadVotable= function(nodekey,jid) {
			var url = 'jobresult?NODE=' + nodekey.trim() + '&JOBID=' + jid.trim();
			window.location = url;
		}

		this.sampBroadcast= function(nodekey,jid) {
			$.getJSON("tap/async/" + jid , function(jsondata) {
				if( processJsonError(jsondata, "Cannot get summary of job " + jid) ) {
					return;
				}
				for( var i=0 ; i<jsondata.results.length ; i++ ) {
					var url = jsondata.results[i].href;
					if( url.endsWith("xml")) {
						sampView.fireSendTapDownload(url);;
						return;
					}
				}
				logged_alert("No result file looking like a VOTable, sorry.", 'Error')
			});					

		}

		this.processRemoveFirstAndOr = function(key) {
			delete editors[key];
			for( var k in editors ) {
				editors[k].controlRemoveAndOr();
				break;
			}
		}

		/*
		 * Listener notifications
		 */
		this.notifyInitDone = function(){
			$.each(listeners, function(i){
				listeners[i].isInit(attributesHandlers, selectAttributesHandlers);
			});
		}
		this.notifyCoordDone = function(key, constr){
			$.each(listeners, function(i){
				listeners[i].coordDone(key, constr);
			});
		}
		this.notifyQueryUpdated= function(query) {
			$.each(listeners, function(i){
				listeners[i].queryUpdated(query);
			});
		}
		this.notifyNewJobs= function() {
			lastJob.controlInitForm();
		}

	}
});
