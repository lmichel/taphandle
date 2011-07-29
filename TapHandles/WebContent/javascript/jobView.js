jQuery.extend({

	JobView: function(){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		var containerID ;

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
		this.initForm = function(nodekey, id, phase, actions){
			$('#' + that.containerID).prepend("<div id=" + id + " style='float: none;'></div>");
			$('#' + id).html('');
			$('#' + id).append('<span id=' + id + '_id>Job "' + nodekey + ' ' + id + '"</span>');
			$('#' + id).append('&nbsp;<span id=' + id + '_phase>' + phase + '</span>');
			$('#' + id).append('<select id=' + id + '_actions style="font-size: small;" onChange="tapView.fireJobAction(\'' + nodekey + '\', \'' + id + '\');"></select>');
			for( var i=0 ; i<actions.length ; i++ ) {
				$('#' + id + '_actions').append('<option value="' + actions[i] + '">' +  actions[i] + '</option>');
				}
			$('#' + id).append('<a id=' + id + '_close href="javascript:void(0);" class=closekw></a>');
			$('#' + id + "_close").click(function() {
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

//			$('#' +  id_root + "_op").change(function() {
//			that.fireEnterEvent($('#' +  id_root + "_andor option:selected").text()
//			, this.value
//			, $('#' +  id_root + "_val").val());				
//			});

		}


	}
});