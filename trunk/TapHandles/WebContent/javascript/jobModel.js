jQuery.extend({

	JobModel: function(treepath, description, session){
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		var that = this;

		var sessionId = session;
		var treePath = $.extend({}, treepath);
		var id = description.jobId;
		var href = description.href;
		var phase = description.phase;
		var operator = ["Refresh", "get JSon result", "Show Query", "Summary"];			
		var actions  = new Array();
		actions['COMPLETED'] = ["Actions", "Show Query", "Display Result", "Download Result", "Add to Cart", "Send to SAMP", "Add to Goodies", "Edit Query", "Summary"];
		actions['PENDING']   = ["Actions", "Show Query", "Run", "Edit Query", "Summary"];
		actions['EXECUTING'] = ["Actions", "Show Query", "Kill", "Summary"];
		actions['QUEUED']    = ["Actions", "Show Query", "Kill", "Summary"];
		actions['PENDED']    = ["Actions", "Show Query", "Start", "Edit Query", "Summary"];
		actions['ERROR']     = ["Actions", "Show Query", "Edit Query", "Summary"];
		this.addListener = function(list){
			listeners.push(list);
		};
		
		this.initForm = function(attributesHandlers) {
			that.notifyIsInit(attributesHandlers);
		};
		
		this.updateStatus = function() {
			$.getJSON("jobsummary", {jsessionid: sessionID, NODE: treepath.nodekey, JOBID: id}, function(jsondata) {
				if( Processing.jsonError(jsondata, "Cannot get summary of job " + id) ) {
					return;
				}
				phase = jsondata.status.job.phase;
				that.notifyUpdated();
			});		

		};
		this.setOnError = function() {
			phase = 'ERROR';
			that.notifyUpdated();		
		};
		this.getPhase = function() {
			return  phase;
		};
		this.notifyIsInit = function(attributesHandlers) {
			$.each(listeners, function(i){
				listeners[i].isInit(treePath, id, sessionId, phase, actions[phase], attributesHandlers);
			});
		};
		this.notifyUpdated = function() {
			$.each(listeners, function(i){
				listeners[i].isUpdated(treePath, id, phase, actions[phase]);
			});
		};
	}
});