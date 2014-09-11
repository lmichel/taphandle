jQuery.extend({

	CartModel: function(nodekey, description){

		var listeners = new Array();
		var that = this;

		var cartData = {};
		var zipJob = null;
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		};
		this.addJobResult = function(treepath, jobid) {
			var nodekey = treepath.nodekey;
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				cartData[nodekey] = {jobs: new Array(), urls: new Array()};
				cartData[nodekey].jobs[0] = {name: jobid, uri: jobid};
			}
			else {
				var jobs = entry.jobs;
				for( var i=0 ; i<jobs.length ; i++ ) {
					if( jobs[i].uri == jobid ) {
						Modalinfo.info("Result of job " + nodekey + "." + jobid + " already in the cart", "input Error");
						return;
					}
				}
				cartData[nodekey].jobs[i] = {name: jobid, uri: jobid};			
			}
		};
		this.removeJobResult = function(treepath, jobid) {
			var nodekey = treepath.nodekey;
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				//Modalinfo.info("There is no data associated with node " + nodekey + " in the cart", "input Error");
			}
			else {
				var jobs = entry.jobs;
				for( var i=0 ; i<jobs.length ; i++ ) {
					if( jobs[i].uri == jobid ) {
						jobs.splice(i,1);
						if( jobs.length == 0 && entry.urls.length == 0 ) {
							delete cartData[nodekey];
						}
						return;
					}
				}
			//	Modalinfo.info("Job " + nodekey + "." + jobid+ " not found in the cart", "input Error");
			}			
		};
		this.addUrl = function(treepath, url) {
			var nodekey = treepath.nodekey;
			var entry;
//			var ch  = url.split("/");
//			var name = ch[ch.length - 1].replace(/[^\w]/, "_");
			var name = "preserve";
			if( (entry = cartData[nodekey]) == undefined ) {
				cartData[nodekey] = {jobs: new Array(), urls: new Array};
				cartData[nodekey].urls[0] = {name: name, uri: url};
			}
			else {
				var urls = entry.urls;
				for( var i=0 ; i<urls.length ; i++ ) {
					if( urls[i].uri == url ) {
						Modalinfo.info("This url of node " + nodekey  + " is already in the cart", "input Error");
						return;
					}
				}
				cartData[nodekey].urls[i] = {name: name, uri: url};			
			}			
		};
		this.removeUrl = function(treepath, url) {
			var nodekey = treepath.nodekey;
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				Modalinfo.info("There is no data associated with node " + nodekey + " in the cart", "input Error");
			}
			else {
				var urls = entry.urls;
				for( var i=0 ; i<urls.length ; i++ ) {
					if( urls[i].uri == url ) {
						urls.splice(i,1);
						if( urls.length == 0 && entry.jobs.length == 0 ) {
							delete cartData[nodekey];
						}		logger.debug("download " + zer.getUri() + " in " + fcopyName);

						return;
					}
				}
				//Modalinfo.info("URL not found in from the cart", "input Error");
			}						
		};
		this.cleanCart = function(tokenArray) {
			var old_cartData = cartData;
			cartData = {};
			for( var t=0 ; t<tokenArray.length ; t++ ) {
				var tokens = tokenArray[t];

				var tkList = tokens.split("&");
				for( var i=0 ; i<tkList.length ; i++ ){
					var row  = tkList[i].split('=');
					var num  = row[1];
					var key  = row[0].split('+');
					var node = key[0];
					if( key[1] == 'job' ) {
						that.addJobResult(node, (old_cartData[node]).jobs[num].uri);
					}
					else if( key[1] == 'url' ) {
						that.addUrl(node, (old_cartData[node]).urls[num].uri);
					}
				}
			}
			this.notifyCartCleaned();
		};

		this.changeName= function(nodekey, dataType, rowNum, newName) {
			if( dataType.toLowerCase() == "job" ) {
				cartData[nodekey].jobs[rowNum].name = newName;
			}
			else {
				cartData[nodekey].urls[rowNum].name = newName;
			}
			this.notifyCartCleaned();			
		};

		this.notifyCartOpen = function() {
			$.each(listeners, function(i){
				listeners[i].isInit(cartData);
			});                     
		};

		this.startArchiveBuilding = function() {
			$.ajax({
				type: 'POST',
				url: "datapack/zipper",
				data: {jsessionid: sessionID, PHASE: 'RUN', FORMAT: 'json',CART: JSON.stringify(cartData) },
				success: function(xmljob, status) {
					zipJob = new $.ZipjobModel(xmljob);
					setTimeout("cartView.fireCheckArchiveCompleted();", 1000);
				},
				dataType: "xml",
				error: function(xhr, textStatus, errorThrown) {
					Modalinfo.info("Archive building failed: Error " +  xhr.status  + "\n" +ajaxOptions + "\n" + thrownError);
				}
			});
		};

		this.killArchiveBuilding = function() {
			if( zipJob == null ) {
				return "nojob";
			}
			else {
				zipJob.kill();
				Out.info(zipJob.phase);
				return zipJob.phase;
			}
		};

		this.getJobPhase= function() {
			if( zipJob == null ) {
				return "nojob";
			}
			else {
				zipJob.refresh();
				return zipJob.phase;
			}
		};

		this.archiveDownload = function() {
			if( zipJob == null ) {
				Modalinfo.info("There is no active ZIP builder");
			}
			else {
				zipJob.download();
			}
		};

		this.notifyCartCleaned = function() {
			$.each(listeners, function(i){
				listeners[i].isCartCleaned(cartData);
			});			
		};
		
		this.resetZipjob = function() {
			Out.info("Reset Zipjob");
			zipJob = null ;
		};
	}
});
