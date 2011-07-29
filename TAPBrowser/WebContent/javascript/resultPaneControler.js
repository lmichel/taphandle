jQuery.extend({

	ResultPaneController: function(model, view){
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
				controlShowSources: function(oid){
					model.processShowSources(oid);
				},
				controlShowSimbad: function(coord){
					model.processShowSimbad(coord);
				},
				controlShowPreviousRecord: function(){
					model.processPreviousRecord();
				},
				controlShowNextRecord: function(oid){
					model.processNextRecord();
				},
				controlShowCounterparts: function(oid, relation){
					model.processShowCounterparts(oid, relation);				
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
				detailIsLoaded: function(oid, dataJSONObject, limit){
					view.showDetail(oid, dataJSONObject, limit);
				},
				metaIsLoaded: function(dataJSONObject, limit){
					view.showMeta(dataJSONObject, limit);
				},
				counterpartsAreLoaded: function(dataJSONObject){
					view.showCounterparts(dataJSONObject);
				}
		}

		model.addListener(mlist);
	}
});
