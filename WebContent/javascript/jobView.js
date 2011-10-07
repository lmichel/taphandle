jQuery.extend({

	JobView: function(jid){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		var containerID ;
		var id = jid;
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
		this.fireInitForm = function(containerID) {
			that.containerID = containerID;
			$.each(listeners, function(i){
				listeners[i].controlInitForm();
			});
		}

		this.fireUpdateStatus = function() {
			$.each(listeners, function(i){
				listeners[i].controlUpdateStatus();
			});
		}
		this.fireSetOnError = function() {
			$.each(listeners, function(i){
				listeners[i].controlSetOnError();
			});
		}

		this.getId = function() {
			return id;
		}
		this.fireGetPhase = function() {
			var retour = false
			$.each(listeners, function(i){
				retour = listeners[i].controlGetPhase();
			});		
			return retour;
		}

		this.initForm = function(treepath, id, phase, actions){
			logMsg("init job form " + JSON.stringify(treepath) );
			var nodekey  = treepath.nodekey;
			$('#' + that.containerID).prepend("<div id=" + id + " style='float: none;'></div>");
			$('#' + id).html('');
			$('#' + id).data('treepath', treepath);

			$('#' + id).append('<span id=' + id + '_id>Job "' + nodekey + ' ' + id + '"</span>');
			$('#' + id).append('&nbsp;<span id=' + id + '_phase class="' + phase.toLowerCase() + '">' + phase + '</span>');
			$('#' + id).append('<select id=' + id + '_actions style="font-size: small;" onChange="tapView.fireJobAction(\'' + nodekey + '\', \'' + id + '\');"></select>');
			for( var i=0 ; i<actions.length ; i++ ) {
				$('#' + id + '_actions').append('<option value="' + actions[i] + '">' +  actions[i] + '</option>');
			}
			$('#' + id).append('<a id=' + id + '_close href="javascript:void(0);" class=closekw></a>');
			$('#' + id + "_close").click(function() {
				tapView.fireRemoveJob( id);
				$.post("killjob"
						, {NODE: nodekey, JOBID: id}
						, function(jsondata, status) {
							if( processJsonError(jsondata, "Cannot delete job: " +id) ) {
								return;
							}
							else {
								$('#' +  id).remove();		
							}
						});
			});
			$("#taptab").tabs({
				selected: 3
			});
		}

		this.updateForm = function(treepath, id, phase, actions){
			logMsg("update form " + treepath );
			var status = $('#' + id + '_phase');
			status.attr("class", phase.toLowerCase());
			status.text(phase);
			var actionMenu = $('#' + id + '_actions');
			actionMenu.html('');
			for( var i=0 ; i<actions.length ; i++ ) {
				actionMenu.append('<option value="' + actions[i] + '">' +  actions[i] + '</option>');
			}
		}
	}
});