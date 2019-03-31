jQuery.extend({

	ZipjobModel:function(xmlSummary){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/*
		 * Job description params
		 */
		var xmlRoot='';
		var jobId='';
		var phase='';
		var params='';
		var results='';

		this.init = function(xmlSummary) {
	       // Out.info((new XMLSerializer()).serializeToString(xmlSummary));
	        /*
	         * The pair Chrome 15 and after and Jquery 1.7 do not support NS in XML
	         * parsing. We must feed the find() function selector including both NS an no NS filed names
	         */
			var xmlRoot = $(xmlSummary).find('uws\\:job, job');
			this.jobId = xmlRoot.find('uws\\:jobId, jobId').text();
			this.phase = xmlRoot.find('uws\\:phase, phase').text();
			this.params = new Array();
			xmlRoot.find("uws\\:parameters, parameters").find("uws\\:parameter, parameter").each(function() {
				that.params[$(this).attr("id")] = $(this).text();
			});	
			that.results = new Array();
			xmlRoot.find("uws\\:results, results").find("uws\\:result, result").each(function() {
				that.results[that.results.length] = $(this).attr("xlink:href");
			});
		};
		
		that.init(xmlSummary);

		this.kill = function() {
			$.ajax({
			    data: {jsessionid: sessionID},
				type: 'DELETE',
			    dataType: "xml",
				url: "datapack/zipper/" + that.jobId,
				success: function(xmljob, status) {
					Modalinfo.info("Job " +  that.jobId + " killed");
					//that.refresh();
				},
				error: function(xhr, ajaxOptions, thrownError) {
					Modalinfo.info("Zipjob kill failed: Error " +  xhr.status + "\n" + xhr  + "\n" +ajaxOptions + "\n" + thrownError);
				}
			});
		};
		this.refresh = function() {
			$.ajax({
			    data: {jsessionid: sessionID},
			    dataType: "xml",
				type: 'GET',
				url: "datapack/zipper/" + that.jobId,
				success: function(xmljob, status) {Out.info("refresh cart job success");that.init(xmljob);},
				error: function(xhr, ajaxOptions, thrownError) {
					Modalinfo.info("Zipjob refresh failed: Error " + xhr.status + "\n" + xhr  + "\n" +ajaxOptions + "\n" + thrownError);
				}
			});
//			$.get("datapack/zipper/" + that.jobId
//				, function(data) {that.init(data);}
//			    , "xml") ;
		};
		this.download = function() {
			if( that.results.length >= 1 ) {
				var url = that.results[0];
				PageLocation.changeLocation(url);
			} else {
				Modalinfo.info("No ZIP archive available");
			}
 		};
	}
});