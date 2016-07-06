jQuery.extend({

	JobControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlInitForm : function(attributesHandlers){
					model.initForm(attributesHandlers);
				},
				controlJobAction : function(action){
					model.processJobAction(action);
				},
				controlUpdateStatus : function(){
					model.updateStatus();
				},
				controlGetPhase: function(){
					return model.getPhase();
				},
				controlSetOnError: function(){
					return model.setOnError();
				},
				controlCheckJobCompleted: function(){
					return model.checkJobCompleted();
				},
				controlRemoveJob: function(){
					return model.removeJob();
				}
				
		};
		view.addListener(vlist);

		var mlist = {
				isInit : function(jobsDescription, actions){
					view.initForm(jobsDescription, actions);
				},
				isUpdated : function(jobsDescription, actions){
					view.updateForm(jobsDescription, actions);
				}
		};
		model.addListener(mlist);
	}
});
