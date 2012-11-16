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
		var joinKeys = new Array();
		var selectAttributesHandlers = new Array();
		var editors = new Array();
		var selects = new Array();
		var orderby = null;

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
		};
		/*
		 * Event processing
		 */
		this.processTreeNodeEvent = function(treepath, andsubmit, default_query){
			showProcessingDialog("Waiting on table description");
			storedTreepath = treepath;
			$.getJSON("gettableatt", {jsessionid: sessionID, node: treepath.nodekey, table:treepath.table }, function(jsondata) {
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
				table = treepath.table;
				for( var i=0 ; i<jsondata.attributes.length ; i++ ) {
					attributesHandlers[jsondata.attributes[i].name] = jsondata.attributes[i];
				}
				selectAttributesHandlers = new Array();
				for( var i=0 ; i<jsondata.attributes.length ; i++ ) {
					selectAttributesHandlers[jsondata.attributes[i].name] = jsondata.attributes[i];
				}
				that.notifyInitDone();		
				that.lookForAlphaKeyword();
				that.lookForDeltaKeyword();
				$(".table_filter").html("<option>" + table + "</option>");
				showProcessingDialog("Waiting on join keys");
				$.getJSON("gettablejoinkeys", {jsessionid: sessionID, node: treepath.nodekey, table:treepath.table }, function(data) {
					hideProcessingDialog();
					if( !(data == undefined || data == null || data.errormsg != undefined) )  {
						joinKeys = data.targets;
						for( var i=0 ; i<joinKeys.length ; i++ ) {
							$(".table_filter").append("<option>" + joinKeys[i].target_table + "</option>");	
						}
					} else {
						logMsg("Cannot get JoinKeys");
					}

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
//				if( default_query == null || default_query == "") {
//				that.notifyQueryUpdated("SELECT TOP " + getQLimit() + " * \n FROM " + jsondata.table );
//				}
//				else {
//				logMsg("@@@@@@@@@@1");
//				that.notifyQueryUpdated(default_query);				
//				logMsg("@@@@@@@@@@@@2");
//				}

//				if( andsubmit ) {
//				logMsg("@@@@@@@@@@@3");
//				that.submitQuery();
//				logMsg("@@@@@@@@@@@@@4");
//				}
			});
		};

		this.changeTable = function(newTable) {		
			table= newTable;
			showProcessingDialog("Waiting on table description");
			$.getJSON("gettableatt", {jsessionid: sessionID, node: storedTreepath.nodekey, table:newTable }, function(jsondata) {
				hideProcessingDialog();
				if( processJsonError(jsondata, "Cannot get meta data") ) {
					return;
				}
//				editors = new Array();
//				selects = new Array();
				selectattributesHandlers = new Array();
				attributesHandlers = new Array();
				alphakw = "";
				deltakw = "";
				for( var i=0 ; i<jsondata.attributes.length ; i++ ) {
					attributesHandlers[jsondata.attributes[i].name] = jsondata.attributes[i];
				}
				selectAttributesHandlers = new Array();
				for( var i=0 ; i<jsondata.attributes.length ; i++ ) {
					selectAttributesHandlers[jsondata.attributes[i].name] = jsondata.attributes[i];
				}
				that.notifyTableChanged();		
				that.lookForAlphaKeyword();
				that.lookForDeltaKeyword();
			});

		};
		this.processSelectEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = selectAttributesHandlers[kwname];
			var m = new $.KWConstraintModel(true, table, { "name" : ah.name
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
		};

		this.processOrderByEvent = function(uidraggable) {
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = selectAttributesHandlers[kwname];
			var m = new $.KWConstraintModel(true, table, { "name" : ah.name
				, "dataType" : "Select"
					, "ucd" : ah.ucd
					, "utype" : ah.utype
					, "unit" : ah.unit
					, "description" : ah.description}
			, this);
			var div_key = "kw" +  const_key;
			var v = new $.KWConstraintView(div_key, 'taporderby');
			orderby =  new $.KWConstraintControler(m, v);
			m.notifyInitDone();
			const_key++;

		};

		this.processAttributeEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			var ah = attributesHandlers[kwname];
			var first = true;
			for( k in editors ) {
				first = false;
				break;
			}
			var m = new $.KWConstraintModel(first, table, ah, this, '');
			var div_key = "kw" +  const_key;
			var v = new $.KWConstraintView(div_key, 'tapconstraintlist');
			editors[div_key] =  new $.KWConstraintControler(m, v);
			that.updateQuery();
			m.notifyInitDone();
			const_key++;
		};


		this.processInputCoord= function(coord, radius, mode){
			var frame = 'J2000,ICRS';
			that.notifyCoordDone("coo" +  const_key, 'isInCircle("' + coord + '", ' + radius + ', ' + frame + ')');
			that.updateQuery();
			var alphaname = $('#kwalpha_name').html();
			var deltaname = $('#kwdelta_name').html();
			if( alphaname == "" || deltaname.length == "" ) {
				loggedAlert('Give one KW for both alpha and delta', 'Info');
				return;
			}
			var coords = $('#tapcoordval').val().split(' ');
			if( coords.length != 2 || isNaN(coords[0]) || isNaN(coords[1])) {
				loggedAlert('Both coordinates must be given in degrees', 'Info');
				return;				
			}
			var rs = $('#tapradiusval').val();
			if( isNaN(rs) ){
				loggedAlert('Radius/Size must be given in degrees', 'Info');
				return;								
			}
			var box_summary = coords[0] + "," + coords[1] + "," + rs;
			var first = true;
			for( k in editors ) {
				first = false;
				break;
			}
			var m = new $.KWConstraintModel(first, table, { "name" : alphaname + " " + deltaname
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

		};

		this.processAlphaEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			that.setAlphaKeyword(selectAttributesHandlers[kwname]);
		};

		this.lookForAlphaKeyword = function(ah) {
			for( var ahn in selectAttributesHandlers ) {
				var ah = selectAttributesHandlers[ahn];
				if( ah.ucd == "pos.eq.ra;meta.main" ) {
					that.setAlphaKeyword(ah);	
					return;
				}
			}
			for( var ahn in selectAttributesHandlers ) {
				var ah = selectAttributesHandlers[ahn];
				if( ah.ucd  == "pos.eq.ra" || ah.ucd.match( /POS_EQ_RA/i)) {
					that.setAlphaKeyword(ah);	
					return;
				}
			}
			for( var ahn in selectAttributesHandlers ) {
				var ah = selectAttributesHandlers[ahn];
				if( ah.name  == "s_ra" || ah.name.toUpperCase()  == "RA" || ah.name.toUpperCase()  == "RAJ2000") {
					that.setAlphaKeyword(ah);	
					return;
				}
			}
		};
		this.setAlphaKeyword = function(ah) {
			var m = new $.KWConstraintModel(true, table, { "name" : ah.name
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
		};

		this.processDeltaEvent= function(uidraggable){
			var kwname = uidraggable.find(".item").text().split(' ')[0];
			that.setDeltaKeyword(selectAttributesHandlers[kwname]);
		};
		this.lookForDeltaKeyword = function(ah) {
			for( var ahn in selectAttributesHandlers ) {
				var ah = selectAttributesHandlers[ahn];
				if( ah.ucd == "pos.eq.dec;meta.main" ) {
					that.setDeltaKeyword(ah);	
					return;
				}
			}
			for( var ahn in selectAttributesHandlers ) {
				var ah = selectAttributesHandlers[ahn];
				if( ah.ucd  == "pos.eq.dec" || ah.ucd.match( /POS_EQ_DEC/i) ) {
					that.setDeltaKeyword(ah);	
					return;
				}
			}
			for( var ahn in selectAttributesHandlers ) {
				var ah = selectAttributesHandlers[ahn];
				if( ah.name  == "s_dec" || ah.name.toUpperCase()  == "DEC" || ah.name.toUpperCase()  == "DECJ2000" ) {
					that.setDeltaKeyword(ah);	
					return;
				}
			}
		};

		this.setDeltaKeyword = function(ah) {
			var m = new $.KWConstraintModel(true, table, { "name" : ah.name
				, "dataType" : "Select"
					, "ucd" : ah.ucd
					, "utype" : ah.utype
					, "unit" : ah.unit
					, "description" : ah.description}
			, this, '');
			var div_key = "kwdelta";
			var v = new $.KWConstraintView(div_key, 'tapdelta');
			alphakw =  new $.KWConstraintControler(m, v);
			m.notifyInitDone();					
		};

		this.updateQuery = function() {
			var limit = getQLimit();
			if( limit != '' ) {
				limit = ' TOP ' + limit + ' ' ;
			} else {
				limit = '';
			}
			var query = "SELECT " + limit;
			var cq = "";
			$("#tapselectlist div").each(function() {
				if( cq.length > 100 ) cq += '\n';
				if( cq.length > 0 ) cq += ", ";
				cq +=  selects[$(this).attr('id')].getADQL(true) ;
			}); 
			if( cq.length > 0 ) {
				query +=  cq ;
			} else {
				query += '*';
			}
			query += "\nFROM " + storedTreepath.table;
			query += that.getJoin();
			cq = "";
			$("#tapconstraintlist div").each(function() {
				if( cq.length > 1100 ) cq += '\n';
				cq +=  '    ' + editors[$(this).attr('id')].getADQL(true) ;
			}); 
			if( cq.length > 0 ) {
				query += "\nWHERE \n" + cq + "";
			}

			if( orderby != null ) {
				query += "\nORDER BY " + orderby.getADQL(true);
			}
			that.notifyQueryUpdated(query);
		};

		this.getJoin = function() {
			var joinTables = new Array();
			for( var kw in selects ) {
				var tbl = selects[kw].getTable();
				if( tbl != storedTreepath.table ) {
					joinTables[tbl] = true;
				}
			}
			for( var kw in editors ) {
				var tbl = editors[kw].getTable();
				if( tbl != storedTreepath.table ) {
					joinTables[tbl] = true;
				}
			}
			if( orderby != null ) {
				joinTables[orderby.getTable()] = true;
			}
			var retour = "";
			for( var jt in joinTables ) {
				for( var i=0 ; i<joinKeys.length ; i++ ) {
					if( joinKeys[i].target_table == jt ) {
						if( retour == "" ) retour = "\n";
						retour += "JOIN " + jt + " ON " + storedTreepath.table + "." + joinKeys[i].source_column 
						+ " = " + joinKeys[i].target_table + "." + joinKeys[i].target_column  + "\n";		
						break;
					}
				}
			}
			return retour;
		};

		this.submitQuery = function(){
			showProcessingDialog("Run job");
			var limit = getQLimit();
			$.ajax({type: 'POST'
				, url:"runasyncjob"
					, dataType: 'json'
						, data: {jsessionid: sessionID, NODE: storedTreepath.nodekey, TREEPATH: storedTreepath.nodekey + ";" + storedTreepath.schema + ";" + storedTreepath.table, REQUEST: "doQuery", LANG: 'ADQL', FORMAT: 'json', PHASE: 'RUN', MAXREC: limit,QUERY: ($('#adqltext').val()) }
			, success: function(jsondata) {
				if( processJsonError(jsondata, "tap/async Cannot get job status") ) {
					return;
				} else {
					jv  = new $.JobView(jsondata.status.job.jobId);
					jm = new $.JobModel(storedTreepath, jsondata.status.job, jsondata.session);
					new $.JobControler(jm, jv);
					lastJob = jv;
					lastJob.fireInitForm('tapjobs', attributesHandlers);
					lastTimer = setTimeout("tapView.fireCheckJobCompleted(\"" + storedTreepath.nodekey + "\", \"" + jsondata.status.job.jobId + "\", \"9\");", 1000);
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
				hideProcessingDialog();
				loggedAlert("Job " + jid + " not completed: processed asynchronously", 'Info');
				pendingJobs[jid] = lastJob;
				if( Object.keys(pendingJobs).length == 1 ) {
					listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);	
				}
			}
			else  if( lastJob.fireGetPhase() == 'EXECUTING' || lastJob.fireGetPhase() == 'QUEUED'
				|| lastJob.fireGetPhase() == 'PENDED'){
				showProcessingDialog("Run job " + counter );
				lastJob.fireUpdateStatus();
				lastTimer = setTimeout("tapView.fireCheckJobCompleted(\"" + nodeKey + "\", \"" + jid + "\", \"" + (counter-1) + "\");", 1000);
			}				
			else {
				hideProcessingDialog();
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
			logMsg("remove job " + id);
			if( lastTimer != null && lastJob != null && id == lastJob.getId()) {
				clearTimeout(lastTimer);
				logMsg("Remove last job");
				lastJob = null;
			}
			var timerOn = false;
			if( listTimer != null ) {timerOn = true;clearTimeout(listTimer);}			
			delete pendingJobs[id];
			if( timerOn ) { listTimer = setTimeout("tapView.fireUpdateRunningJobList();", 5000);}
		};

		this.refreshJobList= function() {
			showProcessingDialog("Refresh job list");
			$.getJSON("joblist", {jsessionid: sessionID, FORMAT: "json"}, function(jsondata) {
				hideProcessingDialog();
				if( processJsonError(jsondata, "Cannot get jobs list") ) {
					return;
				}
				showProcessingDialog("Update Job Status");
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
				hideProcessingDialog();
			});		
		};

		this.processJobAction= function(nodekey,jid, session) {
			var val = $('#' + jid + "_actions").val(); 
			logMsg("Process job action: '" + val + "'");
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
			else if( val == 'Send to SAMP') {				
				var url = rootUrl + 'jobresult?node=' + nodekey.trim() + '&jobid=' + jid.trim()+ '&session=' + sessionID;
				sampView.fireSendVOTableDownload(url);
			}			
			else if( val == 'Edit Query' ) {
				that.editQuery(nodekey,jid);
			}
		};

		this.showQuery = function(nodekey,jid) {
			$.getJSON("jobsummary" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( processJsonError(jsondata, "Cannot get summary of job") ) {
					return;
				}
				var report  = "";
				var pa = jsondata.status.job.parameters.parameter;
				for( var i=0 ; i< pa.length ;i++ ) {
					var p = pa[i];
					if( p.id.toLowerCase() == "query" ) {
						report =p.$.replace(/\\n/g,'\n            ')+ "\n";
						loggedAlert(report, 'Query of job ' + nodekey + '.' + jid);
						return;
					}
				}
				loggedAlert(report, 'No queryfound in ' + jsondata);
			});					
		};
		this.showSummary = function(nodekey, jid) {
			$.getJSON("jobsummary" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid}, function(jsondata) {
				if( processJsonError(jsondata, "Cannot get summary of job "+ nodekey + '.' + jid) ) {
					return;
				}
				var report  = "";
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
				loggedAlert(report,  "Summary of job "+ nodekey + '.' + jid);

			});					
		};
		this.displayResult = function(nodekey, jid) {
			showProcessingDialog("Get result of job " + jid);			
			$.getJSON("jobresult" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid, FORMAT: 'json'}, function(jsondata) {
				hideProcessingDialog();
				if( processJsonError(jsondata, "Cannot get result of job " + jid) ) {				
					$('#resultpane').html();
					if( lastJob != null ) {
						lastJob.fireSetOnError();
					}
					return;
				}
				else {
					var treepath = $('#' + jid).data().treepath;
					treepath.jobid = jid;
					setTitlePath(treepath);
					resultPaneView.showTapResult(storedTreepath, jid, jsondata, $('#' + jid).data("AttributeHandlers") );
				}
			});					
		};
		this.editQuery= function(nodekey,jid) {
			showProcessingDialog("Get Job summary");			
			$.getJSON("jobsummary" , {jsessionid: sessionID, NODE: nodekey, JOBID: jid}, function(jsonsum) {
				hideProcessingDialog();
				if( processJsonError(jsonsum, "Cannot get summary of job") ) {
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
			downloadLocation(url);
		};

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
				loggedAlert("No result file looking like a VOTable, sorry.", 'Error');
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
