jQuery.extend({

	JobControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlInitForm : function(attributesHandlers){
					model.initForm(attributesHandlers);
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
				isInit : function(treepath, id, session, phase, actions, attributesHandlers){
					view.initForm(treepath, id, session, phase, actions, attributesHandlers);
				},
				isUpdated : function(treepath, id, phase, actions){
					view.updateForm(treepath, id, phase, actions);
				}
		}
		model.addListener(mlist);
	}
});
