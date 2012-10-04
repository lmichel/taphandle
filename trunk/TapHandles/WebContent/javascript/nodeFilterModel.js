jQuery.extend({

	NodeFilterModel: function(){
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		};
		this.getFilteredNodes  = function(node){
			var tr = Array();
			/*
			 * Build a list with all unselected tables
			 */
			$("#nodeFilterList span").each(function() {
				if( $(this).parent().attr('class') == 'tableNotSelected') tr[tr.length ] = $(this).text();
			});
			/*
			 * Ask for the new table list
			 */
			showProcessingDialog("Waiting on " + node + " filtered node description");
			$.getJSON("getnode", {node: node , filter: $("#nodeFilter").val(), rejected:tr.join(',') }, function(jsdata) {
				hideProcessingDialog();
				if( processJsonError(jsdata, "Cannot make data tree") ) {
					return;
				} else {
					resultPaneView.fireBuildTree(jsdata);
					$.modal.close();
				}
			});
		};
	}
});
