jQuery.extend({

	TapController: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlTreeNodeEvent : function(treepath, andsubmit, default_query){
					model.processTreeNodeEvent(treepath, andsubmit, default_query);
				},
				controlSubmitQueryEvent: function(){
					model.submitQuery();
				},
				controlRefreshJobList: function(){
					model.refreshJobList();
				},
				controlJobAction: function(nodekey, jid, session){
					model.processJobAction(nodekey, jid, session);
				},
				controlDownloadVotable: function(nodekey, jid){
					model.downloadVotable(nodekey, jid);
				},
				controlCheckJobCompleted: function(nodekey, jid, counter){
					model.checkJobCompleted(nodekey, jid, counter);
				},
				controlUpdateRunningJobList: function() {
					model.updateRunningJobList();
				},
				controlRemoveJob: function(id) {
					model.removeJob(id);
				},
				controlSampBroadcast: function(nodekey, jid){
					model.sampBroadcast(nodekey, jid);
				},
				controlDisplayResult: function(nodekey, jid){
					model.displayResult(nodekey, jid);
				},
				controlChangeTable: function(newTable){
					model.changeTable(newTable);
				}
		}
		view.addListener(vlist);

		var mlist = {
				isInit : function(attributesHandlers, selectAttributesHandlers){
					view.initForm(attributesHandlers, selectAttributesHandlers);
				},
				tableChanged : function(attributesHandlers, selectAttributesHandlers){
					view.setNewTable(attributesHandlers, selectAttributesHandlers);
				},
				coordDone : function(key, constr){
					view.coordDone(key, constr);
				},
				queryUpdated : function(query){
					view.queryUpdated(query);
				},
				newJob: function(jobcontroleur){
					view.jobView(jobcontroler);
				}
		}
		model.addListener(mlist);
	}
});
