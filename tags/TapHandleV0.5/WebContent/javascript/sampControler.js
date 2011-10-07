jQuery.extend({

	SampController: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlSampInit : function(){
					model.sampInit();
				}
		}
		view.addListener(vlist);

		var mlist = {
				connectionDone: function(){
					view.isConnected();
				}
		}

		model.addListener(mlist);
	}
});
