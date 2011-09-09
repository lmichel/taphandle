jQuery.extend({

	CartControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
			controlAddJobResult : function(nodekey, jobid){
				model.addJobResult(nodekey, jobid);
			},
			controlRemoveJobResult : function(nodekey, jobid){
				model.removeJobResult(nodekey, jobid);
			},
			controlAddUrl : function(nodekey, url){
				model.addUrl(nodekey, url);
			},
			controlRemoveUrl : function(nodekey, url){
				model.removeJobUrl(nodekey, url);
			},
			controlDownloadCart : function(){
				model.downloadCart();
			},
			controleCleanCart: function(tokens){
				model.cleanCart(tokens);
			},
			controlStartArchiveBuilding: function() {
				model.startArchiveBuilding();
			},
			controlGetJobPhase: function() {
				return model.getJobPhase();
			}
		}
		view.addListener(vlist);

		var mlist = {
			isInit : function(cartData){
				view.initForm(cartData);
			}
		}
		model.addListener(mlist);
		
	}
});
