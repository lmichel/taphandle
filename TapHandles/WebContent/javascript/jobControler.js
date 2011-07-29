jQuery.extend({

	JobControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlInitForm : function(){
				model.initForm();
			}
		}
		view.addListener(vlist);

		var mlist = {
			isInit : function(nodekey, id, phase, actions){
				view.initForm(nodekey, id, phase, actions);
			}
		}
		model.addListener(mlist);
	}
});
