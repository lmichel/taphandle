jQuery.extend({

	CartView: function(jid){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list){
			listeners.push(list);
		}

		this.fireAddJobResult = function(nodekey, jobid) {
			$.each(listeners, function(i){
				listeners[i].controlAddJobResult(nodekey, jobid);
			});
		}
		this.fireRemoveJobResult = function(nodekey, jobid) {
			$.each(listeners, function(i){
				listeners[i].controlRemoveJobResult(nodekey, jobid);
			});
		}
		this.fireAddUrl = function(nodekey, url) {
			$.each(listeners, function(i){
				listeners[i].controlAddJobResult(url);
			});
		}
		this.fireRemoveUrl = function(nodekey, url) {
			$.each(listeners, function(i){
				listeners[i].controlRemoveJobResult(url);
			});
		}
		this.fireDownloadCart = function() {			
			$.each(listeners, function(i){
				listeners[i].controlDownloadCart();
			});
		}
		this.fireCleanCart = function(tokens) {
			$.each(listeners, function(i){
				listeners[i].controleCleanCart(tokens);
			});
		}
		this.fireStartArchiveBuilding = function() {
			$.each(listeners, function(i){
				listeners[i].controlStartArchiveBuilding();
			});
		}
		this.fireGetJobPhase = function() {
			var retour;
			$.each(listeners, function(i){
				retour = listeners[i].controlGetJobPhase();
			});
			return retour;
		}
		this.initForm = function(cartData) {
			var table = '';
			var histo = '';
			var phase = that.fireGetJobPhase();
			
			histo += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
			histo += '<a id="qhistoright"><img src="images/historight-grey.png"></a>';

			var title = "Shopping Cart";
			table += '<h2> ' + histo + ' DETAIL <span>' + title
			+ '</span></h2>';
			var empty = true;
			for( var nodekey in cartData) {
				var folder = cartData[nodekey];
				table += "<h4 id=\"mappedmeta\" class='detailhead'> <img src=\"images/tdown.png\">Node  " + nodekey + " </h4>";
				table += "<div class='detaildata'>";
				table += "<table width=99% cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"folder_" + nodekey +"\" class=\"display\"></table>";
				table += "</div>";


				if ($('#detaildiv').length == 0) {
					$(document.documentElement).append(
					"<div id=detaildiv style='width: 99%; display: none;'></div>");
				}

				empty = false;
			}
			if( empty ) {
				logged_alert("Empty Shopping Cart");
				return;
			}
			table += "<h4 id=\"cartjob\" class='detailhead'> <img src=\"images/tdown.png\">Processing status</h4>";
			table += 'Current Job Status <span id=cartjob_phase class="' + phase.toLowerCase() + '">' + phase + '</span><BR>'
			table += "<input type=button id=detaildiv_clean value='Remove Unselected Items'>";			
			table += "<input type=button id=detaildiv_cleanall value='Remove All Items'>";			
			table += "<input type=button id=detaildiv_submit value='Start Processing'>";			
			table += "<input type=button id=detaildiv_doanload value='Download Cart'>";			
			table += "<input type=button id=detaildiv_abort value='Abort'>";			
			$('#detaildiv').html(table);
			var oTable;
			for( var nodekey in cartData) {
				var aaData = new Array();
				for( var i=0 ; i<folder.jobs.length ; i++) {
					aaData[aaData.length] = ["<INPUT TYPE=CHECKBOX checked name=\"" + nodekey + " job " + i + "\" value=" + i +">"
					                         , "Job", folder.jobs[i].name, folder.jobs[i].uri];
				}
				for( var i=0 ; i<folder.urls.length ; i++) {
					aaData[aaData.length] = ["<INPUT TYPE=CHECKBOX checked name=\"" + nodekey + " url " + i + "\" value=" + i +">"
					                         ,  "URL", folder.urls[i].name, folder.urls[i].uri];
				}
				$('#detaildiv').html(table);
				oTable = $('#folder_' + nodekey).dataTable(
						{
							"aoColumns" : [{sTitle: "Keep/Discard"}, {sTitle: "Data Source"},{sTitle: "Resource Name"},{sTitle: "Resource URI"}],
							"aaData" : aaData,
							"sDom" : '<"top"f>rt<"bottom">',
							"bPaginate" : false,
							"aaSorting" : [],
							"bSort" : false,
							"bFilter" : true,
							"bAutoWidth" : true
						});
			}
			var modalbox = $('#detaildiv').modal();
			$('#detaildiv_clean').click( function() {
				var sData = $('input', oTable.fnGetNodes()).serialize();
				that.fireCleanCart(sData);
				return false;
			} );
			$('#detaildiv_cleanall').click( function() {
				that.fireCleanCart("");
				modalbox.close();
				return false;
			} );
			$('#detaildiv_submit').click( function() {
				that.fireStartArchiveBuilding();
				return false;
			} );

		}
	}
});