jQuery.extend({
	/**
	 * Example of job description returned by /runasyncjob
	{
	    "session": "45893CC5983E62F0A7AAB426228CB327",
	    "status": {
	        "job": {
	            "startTime": "2013-11-26T11:09:03.326+0100",
	            "results": null,
	            "jobId": "64_CATALOGUE",
	            "quote": {
	                "nil": true
	            },
	            "ownerId": "850C078372883BAAF323A88BD5FF3C77",
	            "destruction": {
	                "nil": true
	            },
	            "executionDuration": 0,
	            "parameters": {
	                "parameter": [
	                    {
	                        "id": "query",
	                        "$": "SELECT  TOP 100  *\nFROM CATALOGUE.CatalogueEntry\n"
	                    },
	                    {
	                        "id": "request",
	                        "$": "doQuery"
	                    },
	                    {
	                        "id": "lang",
	                        "$": "ADQL"
	                    }
	                ]
	            },
	            "runId": "TapHandle-127.0.0.1",
	            "errorSummary": {
	                "nil": true
	            },
	            "endTime": {
	                "nil": true
	            },
	            "phase": "EXECUTING"
	        }
	    },
	    "dataTreePath": {
	        "schema": "CATALOGUE",
	        "nodekey": "saadatap",
	        "table": "CatalogueEntry",
	        "jobid": "64_CATALOGUE"
	    }
	}
	 */

	JobView: function(){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		/**
		 * Container of the job info
		 */
		var jobDiv = null;
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		};


		this.fireInitForm = function(containerID, attributesHandlers) {
			this.containerID = containerID;
			$.each(listeners, function(i){
				listeners[i].controlInitForm(attributesHandlers);
			});
		};
		this.fireJobAction = function(action){
			$.each(listeners, function(i){
				listeners[i].controlJobAction(action);
			});			
		};

		this.fireUpdateStatus = function() {
			$.each(listeners, function(i){
				listeners[i].controlUpdateStatus();
			});
		};
		this.fireSetOnError = function() {
			$.each(listeners, function(i){
				listeners[i].controlSetOnError();
			});
		};
		this.fireCheckJobCompleted = function() {
			$.each(listeners, function(i){
				return listeners[i].controlCheckJobCompleted();
			});
		};
		this.fireRemoveJob = function() {
			$.each(listeners, function(i){
				return listeners[i].controlRemoveJob();
			});
		};
		this.getId = function() {
			return id;
		};
		this.fireGetPhase = function() {
			var retour = false;
			$.each(listeners, function(i){
				retour = listeners[i].controlGetPhase();
			});		
			return retour;
		};

		this.initForm = function(jobDescription, actions, attributesHandlers){
			Out.info("init job form " + JSON.stringify(jobDescription.dataTreePath) + " "  + jobDescription.session);		

			var nodekey  = jobDescription.dataTreePath.nodekey;
			var id       = jobDescription.status.job.jobId;
			var phase    = jobDescription.status.job.phase;
			$('#' + that.containerID).prepend("<div id=" + id + " style='float: none;'></div>");
			$('#' + id).data("AttributeHandlers", attributesHandlers);
			$('#' + id).html('');

			$('#' + id).append('<span id=' + id + '_id>' + nodekey + '.' 
					+ jobDescription.dataTreePath.schema + '.' 
					+ jobDescription.dataTreePath.table + ': job ' + id + '</span>');
			$('#' + id).append('&nbsp;<span id=' + id + '_phase class="' + phase.toLowerCase() + '">' + phase + '</span>');
			$('#' + id).append('<select class="select-job" id=' + id + '_actions style="font-size: small;"></select>');
			for( var i=0 ; i<actions.length ; i++ ) {
				$('#' + id + '_actions').append('<option value="' + actions[i] + '">' +  actions[i] + '</option>');
			}
			$('#' + id).append('<a id=' + id + '_close href="javascript:void(0);" class=closekw></a>');
			
			$('#' + id + "_actions").change(function() {
				that.fireJobAction ( $(this).val());
				$(this).val(0);
			});
			$('#' + id + "_close").click(function() {
				that.fireRemoveJob();
			});
			$("#taptab").tabs({
				selected: 3
			});
			jobDiv = $("#" + jobDescription.status.job.jobId);
		};

		this.updateForm = function(jobDescription, actions){
			var id       = jobDescription.status.job.jobId;
			var phase    = jobDescription.status.job.phase;
			var status = $('#' + id + '_phase');
			Out.info("update form for jobh " + id);
			status.attr("class", phase.toLowerCase());
			status.text(phase);
			var actionMenu = $('#' + id + '_actions');
			actionMenu.html('');
			for( var i=0 ; i<actions.length ; i++ ) {
				actionMenu.append('<option value="' + actions[i] + '">' +  actions[i] + '</option>');
			}
		};
		
		this.setSelected = function(select) {
			if( select )
				jobDiv.css("background-color", "whitesmoke");
			else 
				jobDiv.css("background-color", "transparent");
		};
		
	}
});