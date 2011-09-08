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
				controlJobCompleted: function(){
					return model.isCompleted();
				}
		}
		view.addListener(vlist);

		var mlist = {
				isInit : function(nodekey, id, phase, actions){
					view.initForm(nodekey, id, phase, actions);
				},
				isUpdated : function(nodekey, id, phase, actions){
					view.updateForm(nodekey, id, phase, actions);
				}
		}
		model.addListener(mlist);
	}
});
