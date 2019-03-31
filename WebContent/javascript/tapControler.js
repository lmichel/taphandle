jQuery.extend({

	TapController: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlSubmitQueryEvent: function(){
					model.submitQuery();
				},
				controlRefreshJobList: function(){
					model.refreshJobList();
				},
				controlSelectJob: function(id) {
					model.selectJob(id);
				},
				controlRemoveJob: function(id) {
					model.removeJob(id);
				},
				controlDisplayResult: function(dataTreePath){
					model.displayResult(dataTreePath);
				}
		};
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
