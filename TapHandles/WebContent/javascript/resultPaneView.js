jQuery.extend({

	ResultPaneView : function() {
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
		this.addListener = function(list) {
			listeners.push(list);
		};

		this.fireGetProductInfo = function(url) {
			Processing.show("Waiting on product info");

			$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot get product info") ) {
					return;
				}
				else {
					retour = "url: " + url + "\n";
					$.each(jsdata, function(k, v) {
						retour += k + ": " + v  + "\n";
					});
					Modalinfo.info(retour, "Product Info");
				}
			});
		}	;	
		this.fireSendVoreportWithInfo = function (url){
			Processing.show("Waiting on product info");

			$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot get product info") ) {
					return;
				}
				else {
					var mtype=null, name=null;
					$.each(jsdata, function(k, v) {
						if( k.match(/contenttype/i) ) {
							if( v.match(/fits$/) ) {
								mtype = "table.load.fits";
							} else {
								mtype = "table.load.votable";
							}
						} else if( k.match(/contentdisposition/i) ) {
							var regex = new RegExp(/filename=(.*)$/) ;
							var results = regex.exec(v);
							if(results){
								name = results[1];
							}
						}
					});
					WebSamp_mVc.fireSendVoreport(url, mtype, name);
				}
			});
		}	;	

		this.fireGetDataLink = function(url) {
			Processing.show("Waiting on product info");

			$.getJSON("getdatalink", {jsessionid: sessionID, url: url}, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot get datalink") ) {
					return;
				}
				else {
					var table = '';
					var title = "Data link provided by <i>"
						+ url 
						+ "</i>";
					table += '<h2><img src="images/Relation.png"><span>' + title
					+ '</span></h2>';
					table += "<h4 id=\"mappedmeta\" class='detailhead'> <img src=\"images/tdown.png\"> Links </h4>";
					table += "<div class='detaildata'>";
					table += "<table width=99% cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"detailtable\" class=\"display\"></table>";
					table += "</div>";


					if ($('#detaildiv').length == 0) {
						$(document.documentElement).append(
						"<div id=detaildiv style='width: 99%; display: none;'></div>");
					}
					$('#detaildiv').html(table);
					$('#detailtable').dataTable(
							{
								"aoColumns" : jsdata.columns,
								"aaData" : jsdata.data,
								//	"sDom" : '<"top"f>rt<"bottom">',
								"bPaginate" : false,
								"aaSorting" : [],
								"bSort" : false,
								"bFilter" : true,
								"bAutoWidth" : true,
								"fnRowCallback": function( nRow, aData, iDisplayIndex ) {
									for( var c=0 ; c<aData.length ; c++ ) {
										formatValue(this.fnSettings().aoColumns[c].sTitle, aData[c], $('td:eq(' + c + ')', nRow));
									}
									return nRow;
								}

							});

					$('#detaildiv').modal();

				}
			});
		}	;	
		this.fireDownloadProduct = function(url) {
			Processing.show("Waiting on product info");

			$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
				Processing.hide();
				if( jsdata == undefined || jsdata == null ) {
					window.open(url);
					return;
				}
				else {
					var ct, ce;
					$.each(jsdata, function(k, v) {
						if( k == 'ContentDisposition')    fn = v;
						else if( k == 'ContentType' )     ct = v;
						else if( k == 'ContentEncoding' ) ce = v;
					});
					/*
					 * Will be downloaded by the browser: no need to open a new tab
					 */
					if( (ce != null && (ce == 'gzip' || ce == 'zip')) ||
							(ct != null && (ct.match(/\.fit/i) || ct.match(/fits/))) ){
						document.location = url;
					} else {
						window.open(url);
					}

				}
			});

		};

		this.fireSubmitQueryEvent = function() {
			$("#resultpane").html();
			tapView.fireSubmitQueryEvent();
		};
		this.fireSetTreePath = function(treepath) {
			$.each(listeners, function(i) {
				listeners[i].controlSetTreePath(treepath);
			});
		};
		this.fireHisto = function(direction) {
		};
		this.fireStoreHisto = function(query) {
		};

		this.fireDownloadVOTable = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlDownloadVOTable();
			});
		};
		this.fireDownloadFITS = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlDownloadFITS();
			});
		};
		this.fireDownloadCart = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlDownloadCart();
			});
		};
		this.fireSampBroadcast = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlSampBroadcast();
			});
		};
		this.fireShowRecord = function(oid) {
			$.each(listeners, function(i) {
				listeners[i].controlShowRecord(oid);
			});
		};
		this.fireShowMeta = function() {
			$.each(listeners, function(i) {
				listeners[i].controlShowMeta();
			});
		};
		this.fireShowMetaNode = function(treepath) {
			$.each(listeners, function(i) {
				listeners[i].controlShowMetaNode(treepath);
			});
		};
		this.fireShowSources = function(oid) {
			$('#saadaqllang').attr('checked', 'checked');
			$('#taptab').hide();
			$('#saptab').hide();
			$('#saadaqltab').show('slow');
			$("#qhistocount").css("visibility", "visible");
			saadaqlView.fireDisplayHisto();

			$.each(listeners, function(i) {
				listeners[i].controlShowSources(oid);
			});
		};
		this.fireShowSimbad = function(coord) {
			$.each(listeners, function(i) {
				listeners[i].controlShowSimbad(coord);
			});
		};
		this.fireShowVignette = function(oid, title) {
			ModalInfo.info('Preview of ' + title,
					"<img class=vignette src='getvignette?oid=" + oid
					+ "'>");
		};
		this.fireShowPreview = function(preview_url, title) {
			ModalInfo.info('Preview of ' + title,
					"<img class=vignette src='" + preview_url + "'>");
		};

		this.fireExpendForm= function() {
			var height = $(window).height() ;
			var icon = $('#formexpender').css("background-image");
			if( icon.match("screen_up") != null ) {
				$('#formexpender').css("background-image", "url(images/screen_down.png)");
				$('#formexpender').attr("title", "Expend query form");
				height='10%';
			}
			else {
				$('#formexpender').css("background-image", "url(images/screen_up.png)");
				$('#formexpender').attr("title", "Minimize query form");
				height='90%';
			}
			layoutPane.sizePane("south", height);
			//	$("div#accesspane").trigger("resize",[ height]);		
		};
		this.fireRemoveAllJobs= function() {
			openConfirm({title: "Removing Jobs"
				, message: "Do you really want to remove all jobs?"
					, handler: function(){$("#tapjobs a").click();}
			});
		};
		this.showProgressStatus = function() {
			Modalinfo.info("Job in progress", 'Info');
		};
		this.showFailure = function(textStatus) {
			Modalinfo.info("view: " + textStatus, 'Failutr');
		};

		this.showMeta = function(jsdata) {
			if (jsdata.errormsg != null) {
				Modalinfo.info("FATAL ERROR: Cannot show object detail: "
						+ jsdata.errormsg, 'Server Error');
				return;
			}

			var table = '';
			var histo = '<img src="images/question.png">';


			var title = "Columns of table <i>"
				+ jsdata.table
				+ "</i> of node <i>"
				+ jsdata.nodekey 
				+ "</i>";
			table += '<h2> ' + histo + ' META <span>' + title
			+ '</span></h2>';
			table += "<h4 id=\"mappedmeta\" class='detailhead'> <img src=\"images/tdown.png\"> Table Columns </h4>";
			table = "<div class='detaildata'>";
			table += "<table width=99% cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"detailtable\" class=\"display\"></table>";
			table += "</div>";


			if ($('#detaildiv').length == 0) {
				$(document.documentElement).append(
				"<div id=detaildiv style='width: 99%; display: none;'></div>");
			}
//			$('#detaildiv').html(table);
			Modalinfo.dataPanel(title, table, null);
			$('#detailtable').dataTable(
					{
						"aoColumns" : jsdata.attributes.aoColumns,
						"aaData" : jsdata.attributes.aaData,
						//	"sDom" : '<"top"f>rt<"bottom">',
						"bPaginate" : false,
						"aaSorting" : [],
						"bSort" : false,
						"bFilter" : true,
						"bAutoWidth" : true
					});
//			$('#detaildiv').modal(title, table, null);

		};

		this.showTapResult = function(treepath, jid, jsdata, attributeHandlers) {
			var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"1\"  id=\"datatable\" class=\"display\"></table>";
			$("#resultpane").html(table);
			var nb_cols = jsdata.aoColumns.length;
			for( var r=0 ; r<jsdata.aaData.length ; r++) {
				var line = jsdata.aaData[r];
				for( var l=0 ; l<nb_cols ; l++) {
					var num = line[l];
					//line[l] = formatValue(jsdata.aoColumns[l].sTitle, num);
				}
			}

			var aoColumns = new Array();
			for(var i=0 ; i<jsdata.aoColumns.length ; i++) {
				var title ;
				if( attributeHandlers == undefined ) {
					title = "No descritption available"
						+ " - This job has likely been initiated in a previous session" ;
				}
				else {
					var ah = attributeHandlers[jsdata.aoColumns[i].sTitle];/*
					/*
					 * Column name could be published in upper case but returned by the DBMS in lower case.
					 */
					if(ah == undefined  ) {
						ah = attributeHandlers[jsdata.aoColumns[i].sTitle.toLowerCase()];
					}
					if(ah == undefined  ) {
						ah = attributeHandlers[jsdata.aoColumns[i].sTitle.toUpperCase()];
					}
					if( ah == undefined ) {
						title = "Column not published";
					} else {
						title = ah.description
						+ " - Name: " + ah.name
						+ " - Unit: " + ah.unit
						+ " - UCD: " + ah.ucd
						+ " - UType: " + ah.utype
						+ " - DataType: " + ah.dataType;
					}
				}
				aoColumns[i] = {sTitle: '<span title="' + title + '">' + jsdata.aoColumns[i].sTitle + '</span>'};
			}

			var t = $('#datatable').dataTable({
				"aLengthMenu": [5, 10, 25, 50, 100],
				"aoColumns" : aoColumns,
				"aaData" : jsdata.aaData,
				//"sDom" : '<"top"f>rt',
				"bPaginate" : true,
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true,
				"fnRowCallback": function( nRow, aData, iDisplayIndex ) {
					for( var c=0 ; c<aData.length ; c++ ) {
						formatValue(this.fnSettings().aoColumns[c].sTitle, aData[c], $('td:eq(' + c + ')', nRow));
					}
					return nRow;
				}
			} );

			$('#datatable span').tooltip( { 
				track: true, 
				delay: 0, 
				showURL: false, 
				opacity: 1, 
				fixPNG: true, 
				showBody: " - ", 
				// extraClass: "pretty fancy", 
				top: -15, 
				left: 5 	
			});	
		};;

		this.displayResult = function(dataJSONObject) {
		};

		this.initTable = function(dataJSONObject, query) {
			if( Processing.jsonError(dataJSONObject, "") ) {
				return;
			}
			else {
				/*
				 * Get table columns
				 */
				var ahs = dataJSONObject["attributes"];
				var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"datatable\" class=\"display\">"
					+ "<thead>" + "<tr>";
				for (i = 0; i < ahs.length; i++) {
					table += "<th>" + ahs[i].name + "</th>";
				}
				/*
				 * Build empty table
				 */
				table += "</tr>"
					+ "</thead>"
					+ "<tbody>"
					+ "<tr><td colspan="
					+ i
					+ " class=\"dataTables_empty\">Loading data from server</td></tr>"
					+ "</tbody>" + "</table>";
				$("#resultpane").html(table);
				/*
				 * Connect the table with the DB
				 */
				$('#datatable').dataTable({
					"bServerSide" : true,
					"bProcessing" : true,
					"aaSorting" : [],
					"bSort" : false,
					"bFilter" : false,
					"sAjaxSource" : "nextpage?jsessionid=" + sessionID
				});
			}
		};
	}
});
