jQuery.extend({

	JobControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlInitForm : function(){
					model.initForm();
				},
				controlUpdateStatus : function(){
					model.updateStatus();
				},
				controlGetPhase: function(){
					return model.getPhase();
				},
				controlSetOnError: function(){
					return model.setOnError();
				}
				
		}
		view.addListener(vlist);

		var mlist = {
				isInit : function(treepath, id, phase, actions){
					view.initForm(treepath, id, phase, actions);
				},
				isUpdated : function(treepath, id, phase, actions){
					view.updateForm(treepath, id, phase, actions);
				}
		}
		model.addListener(mlist);
	}
});
