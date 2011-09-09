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
			logMsg('init ' + xmlRoot.find("[nodeName=uws:jobId]").text());
			that.jobId = xmlRoot.find("[nodeName=uws:jobId]").text();
			logMsg('init ' + xmlRoot.find("[nodeName=uws:phase]").text());
			that.phase = xmlRoot.find("[nodeName=uws:phase]").text();
			that.params = new Array();
			xmlRoot.find("[nodeName=uws:parameters]").find("[nodeName=uws:parameter]").each(function() {
				that.params[$(this).attr("id")] = $(this).text();
			});	
			that.results = new Array();
			xmlRoot.find("[nodeName=uws:results]").find("[nodeName=uws:result]").each(function() {
				logMsg("href " +  $(this).attr("xlink:href"));
				that.results[that.results.length] = $(this).attr("xlink:href");
				logMsg("href2 " +  that.results);
			});
		}
		
		that.init(xmlSummary);

		this.kill = function() {
			$.ajax({
				type: 'DELETE',
				url: "datapack/zipper/" + that.jobId,
				success: function(xmljob, status) {
					alert("Job killed");
				}
			});
		}

		this.refresh = function(status) {
			$.get("datapack/zipper/" + that.jobId
				, function(data) {that.init(data);status = that.phase;}
			    , "xml") ;
		}
	}
});