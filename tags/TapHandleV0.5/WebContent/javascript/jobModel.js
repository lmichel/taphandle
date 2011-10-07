jQuery.extend({

	JobModel: function(treepath, description){
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		var that = this;

		var treePath = treepath;
		var id = description.jobId;
		var href = description.href;
		var phase = description.phase;
		var operator = ["Refresh", "get JSon result", "Show Query", "Summary"];			
		var actions  = new Array();
		actions['COMPLETED'] = ["Actions", "Display Result", "Download Result", "Add to Cart", "Edit Query", "Summary"];
		actions['PENDING']   = ["Actions", "Run", "Edit Query", "Summary"];
		actions['EXECUTING'] = ["Actions", "Kill", "Summary"];
		actions['QUEUED']    = ["Actions", "Kill", "Summary"];
		actions['PENDED']    = ["Actions", "Start", "Edit Query", "Summary"];
		actions['ERROR']     = ["Actions", "Show Query", "Edit Query", "Summary"];
		this.addListener = function(list){
			listeners.push(list);
		}
		
		this.initForm = function() {
			logMsg("init job model " + treePath + " " + id + " " + phase);
			that.notifyIsInit();
		}
		
		this.updateStatus = function() {
			$.getJSON("jobsummary", {NODE: treepath.nodekey, JOBID: id}, function(jsondata) {
				if( processJsonError(jsondata, "Cannot get summary of job " + id) ) {
					return;
				}
				logMsg("checkJobCompleted " + id + " " +  jsondata.job.phase);
				phase = jsondata.job.phase;
				that.notifyUpdated();
			});		

		}
		this.setOnError = function() {
			phase = 'ERROR';
			that.notifyUpdated();		
		}
		this.getPhase = function() {
			logMsg('getPhase ' + phase);
			return  phase;
		}
		this.notifyIsInit = function() {
			logMsg("is init job model " + treePath + " " + id + " " + phase);
			$.each(listeners, function(i){
				listeners[i].isInit(treePath, id, phase, actions[phase]);
			});
		}
		this.notifyUpdated = function() {
			logMsg("update job model " + treePath + " " + id + " " + phase);
			$.each(listeners, function(i){
				listeners[i].isUpdated(treePath, id, phase, actions[phase]);
			});
		}
	}
});