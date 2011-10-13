jQuery.extend({

	TapView: function(){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		}
		/*
		 * Fire external events
		 */
		this.fireTreeNodeEvent = function(treepath, andsubmit){
			$.each(listeners, function(i){
				listeners[i].controlTreeNodeEvent(treepath, andsubmit, null);
			});
		}
		this.fireAttributeEvent = function(uidraggable){
			$.each(listeners, function(i){
				listeners[i].controlAttributeEvent(uidraggable);
			});
		}
		this.fireSelectEvent = function(uidraggable){
			$.each(listeners, function(i){
				listeners[i].controlSelectEvent(uidraggable);
			});
		}
		this.fireOrderByEventEvent= function(uidraggable){
			$("#taporderby").html('');
			$.each(listeners, function(i){
				listeners[i].controlOrderByEventEvent(uidraggable);
			});
		}
		this.fireInputCoordEvent = function(){
			if( $("#tapcoordval").val() == '' || $("#tapradiusval").val() == '' ) {
				logged_alert("Both position and radius must be given", 'Info');
				return;
			}

			$.each(listeners, function(i){
				listeners[i].controlInputCoord($("#tapcoordval").val()
						, $("#tapradiusval").val(), $('#tapboxcircle').val());
			});
		}
		this.fireAlphaEvent = function(uidraggable){
			$.each(listeners, function(i){
				listeners[i].controlAlphaEvent(uidraggable);
			});
		}
		this.fireDeltaEvent = function(uidraggable){
			$.each(listeners, function(i){
				listeners[i].controlDeltaEvent(uidraggable);
			});
		}
		this.fireUpdateQueryEvent = function(){
			$.each(listeners, function(i){
				listeners[i].controlUpdateQueryEvent();
			});
		}
		this.fireSubmitQueryEvent = function(){
			$.each(listeners, function(i){
				listeners[i].controlSubmitQueryEvent();
			});
		}
		this.fireRefreshJobList = function(){
			$('#tapjobs').html('');
			$.each(listeners, function(i){
				listeners[i].controlRefreshJobList();
			});
		}
		this.fireJobAction = function(nodekey, jid, session){
			$.each(listeners, function(i){
				listeners[i].controlJobAction(nodekey, jid, session);
			});
		}
		this.fireDownloadVotable = function(nodekey, jid){
			$.each(listeners, function(i){
				listeners[i].controlDownloadVotable(nodekey, jid);
			});
		}
		this.fireCheckJobCompleted= function(nodekey, jid, counter){
			$.each(listeners, function(i){
				listeners[i].controlCheckJobCompleted(nodekey, jid, counter);
			});
		}
		
		this.fireUpdateRunningJobList= function() {			
			$.each(listeners, function(i){
				listeners[i].controlUpdateRunningJobList();
			});
		}
		this.fireRemoveJob = function(id) {
			$.each(listeners, function(i){
				listeners[i].controlRemoveJob(id);
			});		
		}
		this.fireSampBroadcast= function(nodekey, jid){
			$.each(listeners, function(i){
				listeners[i].controlSampBroadcast(nodekey, jid);
			});
		}
		this.fireDisplayResult= function(nodekey, jid){
			$.each(listeners, function(i){
				listeners[i].controlDisplayResult(nodekey, jid);
			});
		}
		this.fireFilterColumns = function(val) {
			$('.kw_list').find('span').each(
					function(){

						var attr = ($(this).text().split("("))[0];
						if( val == '' || attr.indexOf(val) != -1 ) {
							$(this).parent().show();
						}
						else {
							$(this).parent().hide();							
						}
					});
		}
		/*
		 * Local processing
		 */

		this.showProgressStatus = function(){
			logged_alert("Job in progress", 'Info');
		}
		this.showFailure = function(textStatus){
			logged_alert("view: " + textStatus, 'Info');
		}		
		this.initForm= function(attributesHandlers, selectAttributesHandlers){
			/*
			 * Reset form
			 */
			//$('#adqltext').val('');
			$('#tapconstraintlist').html('');
			$('#kwalpha').html('');
			$('#kwdelta').html('');
			$('#attlist').html('');
			$('#tapselectlist').html('');
			$('#taporderby').html('');
			$('#tapselectmeta').html('');
			$('.kw_filter').val('');
			/*
			 * Get table columns for where clause
			 */
			var table  = "<ul class=attlist>";
			for( i in attributesHandlers  ) {
				table += "<li class=\"ui-state-default\"><span class=item>" 
					+ attributesHandlers[i].name
					+ " (" + attributesHandlers[i].dataType 
					+ ") " + attributesHandlers[i].unit 
					+ "</span></li>";
			}
			table += "</select>";
			$("#tapmeta").html(table);
			$(function() {
				$("#tapmeta" ).sortable({
					revert: "true"
				});
				$( "div#tapmeta li" ).draggable({
					connectToSortable: "#tapconstraintslist",
					helper: "clone",
					revert: "invalid"
				});

			});
			/*
			 * Get table columns for select clause
			 */
			var table  = "<ul class=attlist>";
			for( i in selectAttributesHandlers  ) {
				table += "<li class=\"ui-state-default\"><span class=item>" 
					+ selectAttributesHandlers[i].name
					+ " (" + selectAttributesHandlers[i].dataType 
					+ ") " + selectAttributesHandlers[i].unit 
					+ "</span></li>";
			}
			table += "</select>";
			$("#tapselectmeta").html(table);
			$(function() {
				$("#tapselectmeta" ).sortable({
					revert: "true"
				});
				$( "div#tapselectmeta li" ).draggable({
					connectToSortable: "#tapselectlist",
					helper: "clone",
					revert: "invalid"
				});

			});
			$("#taptab").tabs({
				selected: 2
			});
		}

		this.coordDone= function(key, constr){
			$('#CoordList').append("<div id=" + key + "></div>");

			$('#' + key).html('<span id=' + key + '_name>' + constr + '</span>');
			$('#' + key).append('<a id=' + key + '_close href="javascript:void(0);" class=closekw></a>');
			$('#' +  key + "_close").click(function() {
				$('#' +  key).remove();
				that.fireUpdateQueryEvent();
			});
		}

		this.queryUpdated= function(query){
			$('#adqltext').val(query);
		}

		this.jobView= function(jobcontroler){
			jobcontroler.fireInitForm('tapjobs');
		}

		this.fireDisplayHisto = function(){
			var result = '';
			result += '<img src="images/histoleft-grey.png">';
			result += '<img src="images/historight-grey.png">';	
			$('#histoarrows').html('');
			$('#histoarrows').html(result);
		}
	}
});