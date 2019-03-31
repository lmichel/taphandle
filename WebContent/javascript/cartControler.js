jQuery.extend({

	CartControler: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlAddJobResult : function(dataTreePath, jobid){
					model.addJobResult(dataTreePath, jobid);
				},
				controlRemoveJobResult : function(dataTreePath, jobid){
					model.removeJobResult(dataTreePath, jobid);
				},
				controlAddUrl : function(dataTreePath, url){
					model.addUrl(dataTreePath, url);
				},
				controlRemoveUrl : function(dataTreePath, url){
					model.removeJobUrl(dataTreePath, url);
				},
				controlOpenCart : function(){
					model.notifyCartOpen();
				},
				controleCleanCart: function(tokens){
					model.cleanCart(tokens);
				},
				controlStartArchiveBuilding: function() {
					model.startArchiveBuilding();
				},
				controlKillArchiveBuilding: function() {
					model.killArchiveBuilding();
				},
				controlGetJobPhase: function() {
					return model.getJobPhase();
				},
				controlArchiveDownload: function() {
					return model.archiveDownload();
				},
				controlChangeName: function(nodekey, dataType, rowNum, newName) {
					model.changeName(nodekey, dataType, rowNum, newName);				
				},
				controlResetZipjob: function() {
					model.resetZipjob();				
				}

		};
		view.addListener(vlist);

		var mlist = {
				isCartCleaned : function(cartData){
					view.setTableDiv(cartData);
				},
				isInit : function(cartData){
					view.initForm(cartData);
				}
		};
		model.addListener(mlist);

	}
});
