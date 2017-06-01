

var UploadManager = {
	
	dataTreeUpdate: function(retour){
		
		dataTreeView.addGoodies({"nodekey" : "myList", "table" : retour["nameVot"], "date" : retour["date"], "posNb" : retour["positions"] });
		console.log("Add goodies " + retour["nameVot"]);
	},
	
	postHandler: function (retour){
		//console.log("@@@@ postHandler : ");
		UploadManager.dataTreeUpdate(retour);
	}
};