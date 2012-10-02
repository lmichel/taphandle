jQuery.extend({

	NodeFilterController: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlShowRecord: function(oid){
					model.processShowRecord(oid);
				},
				controlShowMeta: function(){
					model.processShowMeta();
				},
				controlShowMetaNode: function(treepath){
					model.processShowMetaNode(treepath);
				},
				controlDownloadVOTable: function(){
					model.downloadVOTable();				
				},
				controlDownloadFITS: function(){
					model.downloadFITS();				
				},
				controlDownloadZip: function(){
					model.downloadZip();				
				},
				controlSampBroadcast: function(){
					model.sampBroadcast();				
				},
				controlSetTreePath : function(treepath){
					model.setTreePath(treepath);
				}

		}
		view.addListener(vlist);

		var mlist = {
				jobInProgress : function(){
					view.showProgressStatus();
				},
				jobFailed : function(textStatus){
					view.showFailure(textStatus);
				},
				jobIsDone : function(dataJSONObject){
					view.displayResult(dataJSONObject);
				},
				tableIsInit : function(dataJSONObject, query){
					view.initTable(dataJSONObject, query);
				},
				detailIsLoaded: function(oid, dataJSONObject){
					view.showDetail(oid, dataJSONObject);
				},
				metaIsLoaded: function(dataJSONObject){
					view.showMeta(dataJSONObject);
				},
				counterpartsAreLoaded: function(dataJSONObject){
					view.showCounterparts(dataJSONObject);
				}
		}

		model.addListener(mlist);
	}
});
