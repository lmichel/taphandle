jQuery.extend({

	NodeFilterController: function(model, view){
		/**
		 * listen to the view
		 */
		var vlist = {
				controlGetFilteredNodes: function(node){
					model.getFilteredNodes(node);
				}
		};
		view.addListener(vlist);

		var mlist = {
		};

		model.addListener(mlist);
	}
});
