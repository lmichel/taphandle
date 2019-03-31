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
			 * Build a list with all selected tables
			 * If all table are selected, take "any" as parameter
			 */
			var any = true;
			$("#nodeFilterList span").each(function() {
				if( $(this).parent().attr('class') == 'tableNotSelected') {
					any = false;
				}
			});
			if( ! any ){
				$("#nodeFilterList span").each(function() {
					if( $(this).parent().attr('class') == 'tableSelected') {
						tr[tr.length ] = $(this).text();
					}
				});
			} else {
				tr.push("any");
			}
			/*
			 * Ask for the new table list
			 */
			Processing.show("Waiting on " + node + " filtered node description");
			$.getJSON("getnode", {jsessionid: sessionID, node: node , filter: $("#nodeFilter").val(), selected:tr.join(',') }, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot make data tree") ) {
					return;
				} else {
					dataTreeView.fireBuildTree(jsdata);
					$.modal.close();
				}
			});
		};
	}
});
