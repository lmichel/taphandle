jQuery.extend({

	JobModel: function(nodekey, description){
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		var that = this;

		var node = nodekey;
		var id = description.jobId;
		var href = description.href;
		var phase = description.phase;
		console.log("JobModel " + node + " " + id + " " + phase + " " + description);
		var operator = ["Refresh", "get JSon result", "Show Query", "Summary"];			
		var actions = new Array();
		actions['COMPLETED'] = ["Actions", "Display Result", "Edit Query", "Summary"];
		actions['PENDING']   = ["Actions", "Run", "Edit Query", "Summary"];
		actions['EXECUTING'] = ["Actions", "Kill", "Summary"];
		actions['QUEUED']    = ["Actions", "Kill", "Summary"];
		actions['PENDED']    = ["Actions", "Start", "Edit Query", "Summary"];
		actions['ERROR']     = ["Actions", "Show Query", "Edit Query", "Summary"];
		this.addListener = function(list){
			listeners.push(list);
		}
		
		this.initForm = function() {
			console.log("init job model " + node + " " + id + " " + phase);
			that.notifyIsInit();
		}
		this.notifyIsInit = function() {
			console.log("is init job model " + node + " " + id + " " + phase);
			$.each(listeners, function(i){
				listeners[i].isInit(node, id, phase, actions[phase]);
			});
		}
	}
});