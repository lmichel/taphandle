

var UploadManager = {
	
	/**
	 * 
	 */
	dataTreeUpdate: function(retour){		
		dataTreeView.addGoodies({"nodekey" : "myList", "table" : retour["nameVot"], "date" : retour["date"], "posNb" : retour["positions"] });
	},
	/**
	 * Invoked after the source list has been uploaded
	 */
	postHandler: function (retour){
		var ul = UploadManager.preloadedGetter();
		for( var i=0 ; i<ul.length ; i++ ){
			if( (ul[i] + "_xml") == retour.nameVot ) 
				return;
		}

		UploadManager.dataTreeUpdate(retour);
		Modalinfo.close();
	},
	
	/**
	 * invoked to propose to reuse a list already loaded instaead of loading a new one
	 */
	preloadedGetter: function (){
		return dataTreeView.getLists();
	}
};