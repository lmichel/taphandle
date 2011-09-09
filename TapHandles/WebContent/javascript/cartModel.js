jQuery.extend({

	CartModel: function(nodekey, description){

		var listeners = new Array();
		var that = this;

		var cartData = {};
		var zipJob;
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		}
		this.addJobResult = function(nodekey, jobid) {
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				cartData[nodekey] = {jobs: new Array(), urls: new Array};
				cartData[nodekey].jobs[0] = {name: jobid, uri: jobid};
				console.log(cartData[nodekey]);
			}
			else {
				var jobs = entry.jobs;
				for( var i=0 ; i<jobs.length ; i++ ) {
					if( jobs[i] == jobid ) {
						logged_alert("Result of job " + nodekey + "." + jobid + " already in the cart", "input Error");
						return;
					}
				}
				cartData[nodekey].jobs[i] = {name: jobid, uri: jobid};			
			}
		}
		this.removeJobResult = function(nodekey, jobid) {
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				logged_alert("Ther is no data associated with node " + nodekey + " in the cart", "input Error")
			}
			else {
				var jobs = entry.jobs;
				for( var i=0 ; i<jobs.length ; i++ ) {
					if( jobs[i].uri == jobid ) {
						console.log("remove job " + nodekey + "." + jobid+ " from the cart");
						jobs.splice(i,1);
						if( jobs.length == 0 && entry.urls.length == 0 ) {
							console.log("Remove folder " + nodekey + " from the cart")
							delete cartData[nodekey];
						}
						return;
					}
				}
				logged_alert("Job " + nodekey + "." + jobid+ " not found in from the cart", "input Error");
			}			
		}
		this.addJobUrl = function(nodekey, url) {
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				cartData[nodekey] = {jobs: new Array(), urls: new Array};
				cartData[nodekey].urls[0] = {name: url, uri: url};
			}
			else {
				var urls = entry.urls;
				for( var i=0 ; i<jobs.length ; i++ ) {
					if( urls[i].uri == url ) {
						logged_alert("This url of node " + nodekey  + " is already in the cart", "input Error");
						return;
					}
				}
				cartData[nodekey].urls[i] = {name: url, uri: url};			
			}			
		}
		this.removeUrl = function(nodekey, url) {
			var entry;
			if( (entry = cartData[nodekey]) == undefined ) {
				logged_alert("Ther is no data associated with node " + nodekey + " in the cart", "input Error")
			}
			else {
				var urls = entry.urls;
				for( var i=0 ; i<urls.length ; i++ ) {
					if( urls[i].uri == url ) {
						console.log("remove url from the cart");
						urls.splice(i,1);
						if( urls.length == 0 && entry.jobs.length == 0 ) {
							console.log("Remove folder " + nodekey + " from the cart")
							delete cartData[nodekey];
						}
						return;
					}
				}
				logged_alert("URL not found in from the cart", "input Error");
			}						
		}
		this.cleanCart = function(tokens) {
			console.log(tokens);
			var tkList = tokens.split("&");
			var old_cartData = cartData;
			cartData = {};
			for( var i=0 ; i<tkList.length ; i++ ){
				var row  = tkList[i].split('=');
				var num  = row[1];
				var key  = row[0].split('+');
				var node = key[0];
				if( key[1] == 'job' ) {
					that.addJobResult(node, (old_cartData[node]).jobs[num].uri);
				}
			}
			that.downloadCart();
		}

		this.downloadCart = function() {
			$.each(listeners, function(i){
				listeners[i].isInit(cartData);
			});			
		}

		this.startArchiveBuilding = function() {
			$.ajax({
				type: 'POST',
				url: "datapack/zipper",
				data: {PHASE: 'RUN', FORMAT: 'json',CART: JSON.stringify(cartData) },
				success: function(xmljob, status) {
					$(".zip").css("background-image", "url(http://jacds.u-strasbg.fr/saadasvn/images/connecting.gif)");					
					//setTimeout("resultPaneView.fireCheckZipCompleted(\"cocu\");", 1000);
					that.zipJob = new $.ZipjobModel(xmljob);
					alert(that.zipJob.phase);
				},
				dataType: "xml",
				error: function(xmljob, textStatus, errorThrown) {
					alert("Error: " + textStatus);
				}
			});
		}

		this.getJobPhase= function() {
			if( zipJob == null ) {
				return "nojob";
			}
			else {
				return zipJob.phase;
			}
		}
	}
});
