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
			Processing.show("Waiting on " + node + " filtered node description");
			$.getJSON("getnode", {jsessionid: sessionID, node: node , filter: $("#nodeFilter").val(), rejected:tr.join(',') }, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot make data tree") ) {
					return;
				} else {
					resultPaneView.fireBuildTree(jsdata);
					$.modal.close();
				}
			});
		};
	}
});
