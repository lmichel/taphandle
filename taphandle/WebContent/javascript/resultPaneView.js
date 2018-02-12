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
		this.fireShowMetaNode = function(dataTreePath) {
			$.each(listeners, function(i) {
				listeners[i].controlShowMetaNode(dataTreePath);
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

		this.fireSwitchForm= function() {
			var height = $(window).height() ;
			var icon = $('#formexpender').css("background-image");
			if( icon.match("screen_up") != null ) {
				$('#formexpender').css("background-image", "url(images/screen_down.png)");
				$('#formexpender').attr("title", "Expend query form");
				height='30%';
			}
			else {
				$('#formexpender').css("background-image", "url(images/screen_up.png)");
				$('#formexpender').attr("title", "Minimize query form");
				height='90%';
			}
			layoutPane.sizePane("south", height);
			//	$("div#accesspane").trigger("resize",[ height]);		
		};
		/*this.fireExpandForm= function() {
			var height = $(window).height() ;
			var icon = $('#formexpender').css("background-image");
			if( icon.match("screen_up") == null ) {
				$('#formexpender').css("background-image", "url(images/screen_up.png)");
				$('#formexpender').attr("title", "Minimize query form");
				height='90%';
				layoutPane.sizePane("south", height);
			}
			//	$("div#accesspane").trigger("resize",[ height]);		
		};*/

		this.fireRemoveAllJobs= function() {
			Modalinfo.confirm("Do you really want to remove all jobs?"
					, function(){$("#tapjobs a").click();}
					, "Removing Jobs");
		};
		this.clearTapResult = function() {
			$("#resultpane").html("");
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
				+ jsdata.dataTreePath.schema
				+ "."
				+ jsdata.dataTreePath.table
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

			Modalinfo.dataPanel(title, table, null);
			
			var options = {
					"aoColumns" : jsdata.attributes.aoColumns,
					"aaData" : jsdata.attributes.aaData,
					"bPaginate" : false,
					"aaSorting" : [],
					"bSort" : false,
					"bFilter" : true,
					"bAutoWidth" : true
				};
				
			var positions = [
     			{ "name": 'filter',
     	 		  "pos" : "top-left"
     	 		}
     	 	];
				
			CustomDataTable.create("detailtable", options, positions);
			Modalinfo.center();
		};

		this.showTapResult = function(dataTreePath, jid, jsdata, attributeHandlers) {
			var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"1\" width= 100% id=\"datatable\" class=\"display\"></table>";
			
			var job = ( !dataTreePath.jobid || dataTreePath.jobid == "")? "": '&gt;'+ dataTreePath.jobid;
			
			$("#resultpane").prepend('<p id="title-table" class="pagetitlepath"></p>');
			if (dataTreePath.schema != undefined && dataTreePath.table != undefined) {
				$("#title-table").html('&nbsp;' + dataTreePath.nodekey + '&gt;' + dataTreePath.schema + '&gt;'+ dataTreePath.table + job);
			}
			
			$("#resultpane").append(table);
//			var nb_cols = jsdata.aoColumns.length;
//			for( var r=0 ; r<jsdata.aaData.length ; r++) {
//			var line = jsdata.aaData[r];
//			for( var l=0 ; l<nb_cols ; l++) {
//			var num = line[l];
//			//line[l] = formatValue(jsdata.aoColumns[l].sTitle, num);
//			}
//			}
			
			attributeHandlers = tapConstraintEditor.getAttributeHandlers();
			var aoColumns = new Array();
			var columnMap = {access_format: -1, s_ra: -1, s_dec: -1, s_fov: -1, currentColumn: -1};
			for(var i=0 ; i<jsdata.aoColumns.length ; i++) {
				var title ;
				if( attributeHandlers == undefined ) {
					title = "No descritption available"
						+ " - This job has likely been initiated in a previous session" ;
				} else {
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
						title = "No description available (joined query?)";
					} else {
						/*
						 * Title must be filtered to be understood by the tooltip plugin
						 */
						title = ah.description.replace(/&[a-z]+;/g, '').replace(/[<>]/g, ' ').replace(/"/g, '');
						+ " - Name: " + ah.nameorg
						+ " - Unit: " + ah.unit
						+ " - UCD: " + ah.ucd
						+ " - UType: " + ah.utype
						+ " - DataType: " + ah.dataType;
						if( ah.nameorg == "access_format" || ah.ucd == "meta.code.mime" ) {
							columnMap.access_format = i;
						} else if( ah.nameorg == "s_ra" || ah.ucd == "pos.eq.ra;meta.main" || ah.ucd == "pos.eq.ra") {
							columnMap.s_ra = i;
						} else if( ah.nameorg == "s_dec" || ah.ucd == "pos.eq.dec;meta.main" || ah.ucd == "pos.eq.dec") {
							columnMap.s_dec = i;
						} else if( ah.nameorg == "s_fov" || ah.nameorg.match(/.*instr\.fov/) ) {
							columnMap.s_fov = i;
						} else if( ah.nameorg == "target_name"  ) {
							columnMap.target_name = i;
						}
					}
				}
				aoColumns[i] = {sTitle: '<span title="' + title + '">' + jsdata.aoColumns[i].sTitle + '</span>'};
			}
			var schema = dataTreePath.schema;
			var options = {
				"aLengthMenu": [5, 10, 25, 50, 100],
				"aoColumns" : aoColumns,
				"aaData" : jsdata.aaData,
				"pagingType" : "simple",
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true,
				"fnRowCallback": function( nRow, aData, iDisplayIndex ) {
					ValueFormator.reset();
					for( var c=0 ; c<aData.length ; c++ ) {
						var copiedcolumnMap = jQuery.extend(true, {}, columnMap);
						var colName = $(this.fnSettings().aoColumns[c].sTitle).text();;
						/*
						 * Makes sure the mime type is for the current column 
						 */
						if( colName != "access_url" ) {
							copiedcolumnMap.access_format = -1;
						}
						copiedcolumnMap.currentColumn = c;
						/*
						 * Not formatting for the relational registry
						 */
						if( schema != "rr")
							ValueFormator.formatValue(colName, aData, $('td:eq(' + c + ')', nRow), copiedcolumnMap);
					}
					return nRow;
				}
			};
			
			var positions = [
     			{ "name": "pagination",
     			  "pos": "bottom-left"
     			},
     			{ "name": "length",
     	 	      "pos": "top-left"
     	 		},
     			{ "name": 'filter',
     	 		  "pos" : "top-right"
     	 		},
     			{ "name": "information",
     	 	      "pos" : "top-center"
     	 	 	}
     	 	];
			
			CustomDataTable.create("datatable", options, positions);
			

//			$('#datatable').dataTable({
//				"aLengthMenu": [5, 10, 25, 50, 100],
//				"aoColumns" : aoColumns,
//				"aaData" : jsdata.aaData,
//				//"sDom" : '<"top"f>rt',
//				"bPaginate" : true,
//				"aaSorting" : [],
//				"bSort" : false,
//				"bFilter" : true,
//				"fnRowCallback": function( nRow, aData, iDisplayIndex ) {
//					for( var c=0 ; c<aData.length ; c++ ) {
//						var copiedcolumnMap = jQuery.extend(true, {}, columnMap);
//						var colName = $(this.fnSettings().aoColumns[c].sTitle).text();;
//						/*
//						 * Makes sure the mime type is for the current column 
//						 */
//						if( colName != "access_url" ) {
//							copiedcolumnMap.access_format = -1;
//						}
//						copiedcolumnMap.currentColumn = c;
//						//formatValue(this.fnSettings().aoColumns[c].sTitle, aData[c], $('td:eq(' + c + ')', nRow));
//						ValueFormator.formatValue(colName, aData, $('td:eq(' + c + ')', nRow), copiedcolumnMap);
//					}
//					return nRow;
//				}
//			} );

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
			
			$("#datatable_wrapper").css("overflow", "hidden");
			
			// Shows query panel
			if (!$("#queryformpane").is(":visible")) {
				$("#toggle-query").trigger( "click" );
				$("#queryformpane").show();	
				$("#toggle-query").show();
			}
		};

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
				table += "</tr >"
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
