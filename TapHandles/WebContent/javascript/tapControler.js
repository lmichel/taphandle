jQuery.extend({

	TapController: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlTreeNodeEvent : function(treepath, andsubmit, default_query){
					model.processTreeNodeEvent(treepath, andsubmit, default_query);
				},
				controlAttributeEvent: function(uidraggable){
					model.processAttributeEvent(uidraggable);
				},
				controlSelectEvent: function(uidraggable){
					model.processSelectEvent(uidraggable);
				},
				controlInputCoord: function(coord, radius, mode){
					model.processInputCoord(coord, radius, mode);
				},
				controlAlphaEvent: function(uidraggable){
					model.processAlphaEvent(uidraggable);
				},
				controlDeltaEvent: function(uidraggable){
					model.processDeltaEvent(uidraggable);
				},
				controlUpdateQueryEvent: function(){
					model.updateQuery();
				},
				controlSubmitQueryEvent: function(){
					model.submitQuery();
				},
				controlRefreshJobList: function(){
					model.refreshJobList();
				},
				controlJobAction: function(nodekey, jid){
					model.processJobAction(nodekey, jid);
				},
				controlDownloadVotable: function(nodekey, jid){
					model.downloadVotable(jid);
				},
				controlCheckJobCompleted: function(nodekey, jid, counter){
					model.checkJobCompleted(nodekey, jid, counter);
				},
				controlSampBroadcast: function(nodekey, jid){
					model.sampBroadcast(nodekey, jid);
				}
		}
		view.addListener(vlist);

		var mlist = {
				isInit : function(attributesHandlers, selectAttributesHandlers){
					view.initForm(attributesHandlers, selectAttributesHandlers);
				},
				coordDone : function(key, constr){
					view.coordDone(key, constr);
				},
				queryUpdated : function(query){
					view.queryUpdated(query);
				},
				newJob: function(jobview){
					view.jobView(jobview);
				}
		}

		model.addListener(mlist);
	}
});
