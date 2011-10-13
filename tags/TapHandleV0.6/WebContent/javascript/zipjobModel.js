jQuery.extend({

	ZipjobModel:function(xmlSummary){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/*
		 * Job description params
		 */
		var xmlRoot;
		var jobId;
		var phase;
		var params;
		var results;

		this.init = function(xmlSummary) {
			var xmlRoot = $(xmlSummary).find("[nodeName=uws:job]");
			that.jobId = xmlRoot.find("[nodeName=uws:jobId]").text();
			that.phase = xmlRoot.find("[nodeName=uws:phase]").text();
			that.params = new Array();
			xmlRoot.find("[nodeName=uws:parameters]").find("[nodeName=uws:parameter]").each(function() {
				that.params[$(this).attr("id")] = $(this).text();
			});	
			that.results = new Array();
			xmlRoot.find("[nodeName=uws:results]").find("[nodeName=uws:result]").each(function() {
				that.results[that.results.length] = $(this).attr("xlink:href");
			});
		}
		
		that.init(xmlSummary);

		this.kill = function() {
			$.ajax({
				type: 'DELETE',
				url: "datapack/zipper/" + that.jobId,
				success: function(xmljob, status) {
					logged_alert("Job killed");
					that.refresh();
				}
			});
		}

		this.refresh = function() {
			$.get("datapack/zipper/" + that.jobId
				, function(data) {that.init(data);}
			    , "xml") ;
		}
		this.download = function() {
			if( that.results.length >= 1 ) {
				var url = that.results[0];
				logMsg("download " + url);
				window.location = url;
			}
			else {
				logged_alert("No ZIP archive available");
			}
 		}
	}
});