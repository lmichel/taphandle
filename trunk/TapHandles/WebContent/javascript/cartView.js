jQuery.extend({

	CartView: function(jid){
		/**
		 * keep a reference to ourselves
		 */
		var that = this;

		/**
		 * datatables references
		 */
		var folderTables = new Array();
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
				listeners[i].controlAddUrl(nodekey, url);
			});
		}
		this.fireRemoveUrl = function(nodekey, url) {
			$.each(listeners, function(i){
				listeners[i].controlRemoveUrl(nodekey, url);
			});
		}
		this.fireOpenCart = function() {			
			$.each(listeners, function(i){
				listeners[i].controlOpenCart();
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
		this.fireKillArchiveBuilding = function() {
			$.each(listeners, function(i){
				listeners[i].controlKillArchiveBuilding();
			});
		}
		this.fireArchiveDownload = function() {			
			$.each(listeners, function(i){
				listeners[i].controlArchiveDownload();
			});
		}
		this.fireGetJobPhase = function() {
			var retour;
			$.each(listeners, function(i){
				retour = listeners[i].controlGetJobPhase();
			});
			return retour;
		}
		this.fireChangeName = function(nodekey, dataType, rowNum, newName){
			$.each(listeners, function(i){
				listeners[i].controlChangeName(nodekey, dataType, rowNum, newName);
			});			
		}

		this.fireCheckArchiveCompleted = function() {
			var phase = that.fireGetJobPhase();
			var jobspan = $('#cartjob_phase');
			console.log(jobspan.attr('class'));
			jobspan.attr('class', phase.toLowerCase());
			jobspan.text(phase);
			if( phase == 'nojob') {
				$('.zip').css("border", "0px");
			}
			else if( phase == 'EXECUTING') {
				$('.zip').css("border", "2px solid orange");
				setTimeout("cartView.fireCheckArchiveCompleted();", 1000);
			}
			else if( phase == 'COMPLETED') {
				$('.zip').css("border", "2px solid green");
			}
			else {
				$('.zip').css("border", "2px solid red");
			}
		}

		this.initForm = function(cartData) {
			$('#detaildiv').remove();
			if ($('#detaildiv').length == 0) {
				$(document.documentElement).append(
				"<div id=detaildiv style='width: 99%; display: none;'></div>");
			}
			var empty = true;
			for( var nodekey in cartData) {
				empty = false;
				break;
			}			
			if( empty ) {
				logged_alert("Empty Shopping Cart");
				return;
			}

			var table = '';
			var histo = '';
			var phase = that.fireGetJobPhase();

			histo += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
			histo += '<a id="qhistoright"><img src="images/historight-grey.png"></a>';

			table += '<h2> ' + histo + ' Shopping Cart</h2>';
			table += '<div id=table_div></div>';
			table += "<h4 id=\"cartjob\" class='detailhead'> <img src=\"images/tdown.png\">Processing status</h4>";
			table += '<br><span>Current Job Status</span> <span id=cartjob_phase class="' + phase.toLowerCase() + '">' + phase + '</span><BR>'
			table += "<span>Manage Content</span> <input type=button id=detaildiv_clean value='Remove Unselected Items'>";			
			table += "<input type=button id=detaildiv_cleanall value='Remove All Items'><br>";			
			table += "<span>Manage Job</span> <input type=button id=detaildiv_submit value='Start Processing'>";			
			table += "<input type=button id=detaildiv_abort value='Abort'><br>";			
			table += "<span>Get the Result</span> <input type=button id=detaildiv_download value='Download Cart'>";			


			$('#detaildiv').html(table);

			var modalbox = $('#detaildiv').modal();
			that.setTableDiv(cartData);

			$('#detaildiv_clean').click( function() {
				var tokenArray =new Array();
				for( var i=0 ; i<folderTables.length ; i++) {
					tokenArray[tokenArray.length]  = $('input',folderTables[i].fnGetNodes()).serialize();
				}
				that.fireCleanCart(tokenArray);
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
			$('#detaildiv_abort').click( function() {
				that.fireKillArchiveBuilding();
				return false;
			} );

			$('#detaildiv_download').click( function() {
				that.fireArchiveDownload();
				$('.zip').css("border", "0px");
				return false;
			} );
		}
		
		this.setTableDiv= function(cartData) {
			folderTables = new Array();
			var table = '';
			var empty = true;
			for( var nodekey in cartData) {
				empty = false;
				break;
			}			
			if( empty ) {
				logged_alert("Empty Shopping Cart");
				$.modal.close();
				return;
			}
			for( var nodekey in cartData) {
				var folder = cartData[nodekey];
				table += "<h4 id=\"mappedmeta\" class='detailhead'> <img src=\"images/tdown.png\">Node  " + nodekey + " </h4>";
				table += "<div class='detaildata'>";
				table += "<table width=99% cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"folder_" + nodekey +"\" class=\"display\"></table>";
				table += "</div>";
			}
			$('#table_div').html(table);
			for( var nodekey in cartData) {
				var folder = cartData[nodekey];
				var aaData = new Array();
				for( var i=0 ; i<folder.jobs.length ; i++) {
					aaData[aaData.length] = ["<INPUT TYPE=CHECKBOX checked name=\"" + nodekey + " job " + i + "\" value=" + i +">"
					                         , "Job", "<span>" + folder.jobs[i].name + "</span>", folder.jobs[i].uri];
				}
				for( var i=0 ; i<folder.urls.length ; i++) {
					aaData[aaData.length] = ["<INPUT TYPE=CHECKBOX checked name=\"" + nodekey + " url " + i + "\" value=" + i +">"
					                         ,  "URL", folder.urls[i].name, folder.urls[i].uri];
				}
				folderTables[folderTables.length] = $('#folder_' + nodekey).dataTable(
						{
							"aoColumns" : [{sTitle: "Keep/Discard"}, {sTitle: "Data Source"},{sTitle: "Resource Name"},{sTitle: "Resource URI"}],
							"aaData" : aaData,
							"bPaginate" : false,
							"bInfo" : false,
							"aaSorting" : [],
							"bSort" : false,
							"bFilter" : false,
							"bAutoWidth" : true
						});
				var oTable = folderTables[folderTables.length-1];
			    /* Apply the jEditable handlers to the table */
			    $('span', oTable.fnGetNodes()).editable( 
			    	function(data) {
			    		return data.replace(/[^\w]/g, "_");
			    		},
			    	{        
			    	 "callback": function( sValue, y ) {
				        var node = $(this).parent().get(0);
			            var aPos = oTable.fnGetPosition( node );
			            cartView.fireChangeName(nodekey, oTable.fnGetData( aPos[0] )[1], aPos[0], sValue);
			    	  },
			        "height": "1.33em", 
			        "width": "16em"}
			    );
			}	
		}
	}
});