jQuery
.extend({

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
		}

		this.fireNewNodeEvent = function(nodekey) {
			$.getJSON("getnode", {node: nodekey }, function(jsdata) {
				hideProcessingDialog();
				if( processJsonError(jsdata, "Cannot make data tree") ) {
					return;
				}
				else {
					$("div#treedisp").jstree("remove","#rootid" );
					$("div#treedisp").jstree("remove","#" + jsdata.nodekey);
					$("div#treedisp").jstree("create"
							, $("div#treedisp")
							, false
							, {"data" : {"attr":{"id": jsdata.nodekey}, "title" : jsdata.nodekey},
								"state": "closed"}
							,false
							,true);			
					var id_schema, id_table;
					for( var i=0 ; i<jsdata.schemas.length ; i++ ) {
						id_schema = jsdata.nodekey + "X" + jsdata.schemas[i].name;
						$("div#treedisp").jstree("create"
								, $("#" + jsdata.nodekey)
								, false
								, {"data" : {"attr":{"id": id_schema}, "title" : jsdata.schemas[i].name},
								   "state": "closed",
								   "attr" :{"id": id_schema}}
								,false
								,true);		
					}
					for( var i=0 ; i<jsdata.schemas.length ; i++ ) {
						id_schema = jsdata.nodekey + "X" + jsdata.schemas[i].name;
						for( var j=0 ; j<jsdata.schemas[i].tables.length ; j++ ) {
							id_table = jsdata.nodekey + ";" + jsdata.schemas[i].name + ";" + jsdata.schemas[i].tables[j];
							console.log("add " + jsdata.schemas[i].tables[j]);
							$("div#treedisp").jstree("create"
									, $("#" + id_schema)
									, false
									, {"data"  : {"attr":{"id": id_table}, "title" : jsdata.schemas[i].tables[j]},
										"state": "closed",
										"attr" :{"id": id_table}}
									,false
									,true);	
						}
					}
				}
				$( "div#treedisp").jstree('close_all', -1);
			});
		}

		this.fireTreeNodeEvent = function(treepath) {
			runTAP = true;
			tapView.fireTreeNodeEvent(treepath, runTAP);
		}

		this.fireSubmitQueryEvent = function() {
			$("#resultpane").html();
			tapView.fireSubmitQueryEvent();
		}
		this.fireSetTreePath = function(treepath) {
			$.each(listeners, function(i) {
				listeners[i].controlSetTreePath(treepath);
			});
		}
		this.fireHisto = function(direction) {
		}
		this.fireStoreHisto = function(query) {
		}

		this.fireDownloadVOTable = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlDownloadVOTable();
			});
		}
		this.fireDownloadFITS = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlDownloadFITS();
			});
		}
		this.fireDownloadZip = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlDownloadZip();
			});
		}
		this.fireSampBroadcast = function(query) {
			$.each(listeners, function(i) {
				listeners[i].controlSampBroadcast();
			});
		}
		this.fireShowRecord = function(oid) {
			$.each(listeners, function(i) {
				listeners[i].controlShowRecord(oid);
			});
		}
		this.fireShowMeta = function() {
			$.each(listeners, function(i) {
				listeners[i].controlShowMeta();
			});
		}
		this.fireShowMetaNode = function(treepath) {
			$.each(listeners, function(i) {
				listeners[i].controlShowMetaNode(treepath);
			});
		}
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
		}
		this.fireShowSimbad = function(coord) {
			$.each(listeners, function(i) {
				listeners[i].controlShowSimbad(coord);
			});
		}
		this.fireShowPreviousRecord = function() {
			$.each(listeners, function(i) {
				listeners[i].controlShowPreviousRecord();
			});
		}
		this.fireShowNextRecord = function() {
			$.each(listeners, function(i) {
				listeners[i].controlShowNextRecord();
			});
		}

		this.fireShowCounterparts = function(oid, relation) {
			var div = $('#' + relation).next('.detaildata');
			if (div.html().length > 0) {
				div.slideToggle(500);
			} else {
				$.each(listeners,
						function(i) {
					listeners[i].controlShowCounterparts(oid,
							relation);
				});
			}
			// $('#detaildiv').animate({scrollTop:
			// $('#detaildiv').height()}, 800);
		}
		this.fireShowVignette = function(oid, title) {
			openDialog('Preview of ' + title,
					"<img class=vignette src='getvignette?oid=" + oid
					+ "'>");
		}
		this.fireShowPreview = function(preview_url, title) {
			openDialog('Preview of ' + title,
					"<img class=vignette src='" + preview_url + "'>");
		}

		this.fireExpendForm= function() {
			var height;
			var icon = $('#formexpender').css("background-image");
			if( icon.match("screen_up") != null ) {
				$('#formexpender').css("background-image", "url(images/screen_down.png)");
				$('#formexpender').attr("title", "Expend query form");
				var height = $(window).height() - 70 - 50;
				if( height < 100) {
					height = 100;
				}
			}
			else {
				$('#formexpender').css("background-image", "url(images/screen_up.png)");
				$('#formexpender').attr("title", "Minimize query form");
				height = 200;
				if( height < 100) {
					height = 100;
				}
			}
			$("div#accesspane").trigger("resize",[ height]);		
		}
		this.showProgressStatus = function() {
			logged_alert("Job in progress");
		}
		this.showFailure = function(textStatus) {
			logged_alert("view: " + textStatus);
		}
		this.showDetail = function(oid, jsdata, limit) {
			if (jsdata.errormsg != null) {
				logged_alert("FATAL ERROR: Cannot show object detail: "
						+ jsdata.errormsg);
				return;
			}

			var table = '';
			var histo = '';

			if (limit != 'NoHisto') {
				if (limit != 'MaxLeft') {
					histo += '<a href="javascript:void(0);" onclick="resultPaneView.fireShowPreviousRecord();" class=histoleft></a>';
				} else {
					histo += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
				}
				if (limit != 'MaxRight') {
					histo += '<a href="javascript:void(0);" onclick="resultPaneView.fireShowNextRecord();" class=historight></a>';
				} else {
					histo += '<a id="qhistoright"><img src="images/historight-grey.png"></a>';
				}
			} else {
				histo += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
				histo += '<a id="qhistoright"><img src="images/historight-grey.png"></a>';
			}

			table += '<h2> ' + histo + ' DETAIL <span>' + jsdata.title
			+ '</span></h2>';
			if (jsdata.links.length > 0) {
				table += "<div style='overflow: hidden;border-width: 0;'>";
				for (i = 0; i < jsdata.links.length; i++) {
					table += '<span>' + jsdata.links[i] + '</span><br>';
				}
				table += "</div>";
			}
			table += "<h4 id=\"native\" class='detailhead' onclick=\"$(this).next('.detaildata').slideToggle(500); switchArrow(\'native\');\"> <img src=\"images/tdown.png\"> Native Data </h4>";
			table += "<div class='detaildata'>";
			table += "<table width=99% cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"detailtable\" class=\"display\"></table>";
			table += "</div>";

			table += "<h4 id=\"mapped\" class='detailhead' onclick=\"$(this).next('.detaildata').slideToggle(500); switchArrow(\'mapped\');\"> <img src=\"images/tright.png\"> Mapped Data </h4>";
			table += "<div class='detaildata'>";
			table += "<table width=99% cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"detailmappedtable\" class=\"display\"></table>";
			table += "</div>";

			for (i = 0; i < jsdata.relations.length; i++) {
				table += "<h4 id=" + jsdata.relations[i] + " class='detailhead' onclick='resultPaneView.fireShowCounterparts(\""
				+ oid + "\", \"" + jsdata.relations[i] + "\"); switchArrow(\"" + jsdata.relations[i] 
				+ "\");'> <img src=\"images/tright.png\"> Relation " + jsdata.relations[i] + " </h4>";
				table += "<div class='detaildata'></div>";
			}

			if ($('#detaildiv').length == 0) {
				$(document.documentElement)
				.append(
						"<div id=detaildiv style='width: 99%; display: none;'></div>");
			}
			$('#detaildiv').html(table);

			$('#detailtable').dataTable({
				"aoColumns" : jsdata.classlevel.aoColumns,
				"aaData" : jsdata.classlevel.aaData,
				"sDom" : '<"top"f>rt<"bottom">',
				"bPaginate" : false,
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true
			});

			$('#detailmappedtable').dataTable({
				"aoColumns" : jsdata.collectionlevel.aoColumns,
				"aaData" : jsdata.collectionlevel.aaData,
				"sDom" : '<"top"f>rt<"bottom">',
				"bPaginate" : false,
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true
			});
			$('#detaildiv').modal();

			jQuery(".detaildata").each(function(i) {
				if (i > 0) {
					$(this).hide()
				}
			});
		}

		this.showCounterparts = function(jsdata) {
			var id = "reltable" + jsdata.relation;
			var div = $('#' + jsdata.relation).next('.detaildata');
			div
			.html("<table id="
					+ id
					+ "  width=600px cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  class=\"display\"></table>");
			$('#' + id).dataTable({
				"aoColumns" : jsdata.aoColumns,
				"aaData" : jsdata.aaData,
				"sDom" : '<"top">rt<"bottom">',
				"bPaginate" : false,
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true
			});
			$('#' + jsdata.relation).next('.detaildata').slideToggle(
					500);

		}

		this.showMeta = function(jsdata, limit) {
			console.log("@@@@ showMeta");
			if (jsdata.errormsg != null) {
				logged_alert("FATAL ERROR: Cannot show object detail: "
						+ jsdata.errormsg);
				return;
			}

			var table = '';
			var histo = '';

			if (limit != 'NoHisto') {
				if (limit != 'MaxLeft') {
					histo += '<a href="javascript:void(0);" onclick="resultPaneView.fireShowPreviousRecord();" class=histoleft></a>';
				} else {
					histo += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
				}
				if (limit != 'MaxRight') {
					histo += '<a href="javascript:void(0);" onclick="resultPaneView.fireShowNextRecord();" class=historight></a>';
				} else {
					histo += '<a id="qhistoright"><img src="images/historight-grey.png"></a>';
				}
			} else {
				histo += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
				histo += '<a id="qhistoright"><img src="images/historight-grey.png"></a>';
			}

			var title = "Columns of table <i>"
					+ jsdata.table
					+ "</i> of node <i>"
					+ jsdata.nodekey 
					+ "</i>";
			table += '<h2> ' + histo + ' DETAIL <span>' + title
			+ '</span></h2>';
			table += "<h4 id=\"mappedmeta\" class='detailhead'> <img src=\"images/tdown.png\"> Table Columns </h4>";
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
						"aoColumns" : jsdata.attributes.aoColumns,
						"aaData" : jsdata.attributes.aaData,
						"sDom" : '<"top"f>rt<"bottom">',
						"bPaginate" : false,
						"aaSorting" : [],
						"bSort" : false,
						"bFilter" : true,
						"bAutoWidth" : true
					});

			$('#detaildiv').modal();

		}
		this.showTapResult = function(treepath, jid, jsdata) {
			setTitlePath([treepath[0], treepath[2], ('job ' + jid) ]);
			var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\"  id=\"datatable\" class=\"display\"></table>"
				$("#resultpane").html(table);
			var nb_cols = jsdata.aoColumns.length;
			for( var r=0 ; r<jsdata.aaData.length ; r++) {
				var line = jsdata.aaData[r];
				for( var l=0 ; l<nb_cols ; l++) {
					var num = line[l];
					line[l] = formatValue(num);
				}
				
			}
			$('#datatable').dataTable({
				"aoColumns" : jsdata.aoColumns,
				"aaData" : jsdata.aaData,
				"sDom" : '<"top">lrt<"bottom">ip',
				"bPaginate" : true,
				"aaSorting" : [],
				"bSort" : false,
				"bFilter" : true
			});

		}
		this.displayResult = function(dataJSONObject) {
		}
		this.initTable = function(dataJSONObject, query) {
			if( processJsonError(dataJSONObject, "") ) {
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
					"sAjaxSource" : "nextpage"
				});
			}
			that.fireStoreHisto(query);

		}
		/*
		 * Returns the arrow commanding the historic on the modal box
		 */
		this.histoCommands = function(limit) {
			var histo = '';

			if (limit != 'NoHisto') {
				if (limit != 'MaxLeft') {
					histo += '<a href="javascript:void(0);" onclick="resultPaneView.fireShowPreviousRecord();" class=histoleft></a>';
				}
				if (limit != 'MaxRight') {
					histo += '<a href="javascript:void(0);" onclick="resultPaneView.fireShowNextRecord();" class=historight></a>';
				}
			}
			return histo;
		}

		this.updateQueryHistoCommands = function(length, ptr) {
			var result = '';
			$("#qhistocount").html((ptr + 1) + "/" + length);
			if (length <= 1) {
				result += '<img src="images/histoleft-grey.png">';
				result += '<img src="images/historight-grey.png">';
			} else {
				if (ptr > 0) {
					result += '<a id="qhistoleft" title="Previous query" class=histoleft onclick="resultPaneView.fireHisto(\'previous\');"></a>';
				} else {
					result += '<a id="qhistoleft"><img src="images/histoleft-grey.png"></a>';
				}
				if (ptr < (length - 1)) {
					result += '<a id="qhistoright" title="Next query" class=historight onclick="resultPaneView.fireHisto(\'next\');"></a>';
				} else {
					result += '<img src="images/historight-grey.png">';
				}
			}
			$('#histoarrows').html('');
			$('#histoarrows').html(result);
		}

		this.overPosition = function(pos) {
			simbadToBeOpen = true;
			setTimeout("if( simbadToBeOpen == true ) openSimbadDialog(\"" + pos + "\");", 1000);
		}
		this.outPosition = function() {
			simbadToBeOpen = false;
		}
	}
});