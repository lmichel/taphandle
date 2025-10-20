function DataTreeView() {
	/**
	 * default node list
	 * The nodes given here must be initialized in Nodebase.java
	 */
	this.nodeList = new Array();
	this.reports = {};
	/**
	 * Metadata of the data files referenced in the Goodies node
	 */
	this.goodies = new Array();
	this.dataTreePath = null;
	this.capabilities = null;
	this.info = null;
}
DataTreeView.prototype = {
		initNodeBase : function(){
			var that = this;
			Processing.show("Fetching available nodes");
			$(".logo").attr("class", "logourbana");
			$.ajax({
				async: false,
				type: 'GET',
				dataType: 'json',
				url: "availablenodes",
				error: function() {
					Processing.hide();
					Modalinfo.error("availablenodes failure") ;
				},
				success: function(data) {
					Processing.hide();
					$("title").text("TapHandle " + data.version)
					sessionID = data.sessionID;
					for( var i=0 ; i<data.nodes.length ; i++) {
						that.nodeList[that.nodeList.length] = {
								id   :  data.nodes[i].key
								, text : data.nodes[i].key+ ' [' + data.nodes[i].title + ']'
								, ivoid: data.nodes[i].ivoid 
								, url: data.nodes[i].url
								, description: data.nodes[i].description
								, title: data.nodes[i].title
								, name: data.nodes[i].name
								, contact: data.nodes[i].contact
								, extra: "<br>" +data.nodes[i].url + "<br>" +data.nodes[i].ivoid + "<br>"};
					}
					$('input#node_selector').jsonSuggest(
							{data: that.nodeList
								, minCharacters: 0
								, onSelect: function(data){
									var key = $('#node_selector').val().split(' ')[0];
									that.fireNewNodeEvent(key);
									$('#node_selector').val(key);
								}
							});
					setTimeout('$(".logourbana").attr("class", "logo")', 2000);
				}
			});
		},

		fireNewNodeEvent: function(nodekey) {
			var that = this;
			Processing.show("Waiting on " + nodekey + " node description");
			$.getJSON("getnode", {jsessionid: sessionID, node: nodekey }, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot make data tree") ) {
					return;
				} else {
					Processing.show("Building node");
					that.fireBuildTree(jsdata);
					Processing.hide();
				}
			});

			$("body").removeClass("with-bg");
			$(".home-panel").hide();
			$(".content-panel").show();

			// Hide the query panel to permits the result panel to be bigger
			if ($("#queryformpane").is(":visible") && $("#resultpane").find("table").length == 0) {
				$("#toggle-query").trigger( "click" );
			}

			// Hide the query panel if the user didnt open a table
			if ($("#resultpane").find("table").length == 0) {
				$("#queryformpane").hide();	
				$("#toggle-query").hide();
			}
		},

		fireBuildTree: function(jsdata) {
			/*
			 * Prevent to close the page with data
			 */

			PageLocation.confirmBeforeUnlaod();		
			$("div#treedisp").jstree("close_all", -1);
			
			Processing.show("Waiting for the construction of the tree");
			this.capabilities = {supportSyncQueries: true
					        , supportAsyncQueries: (jsdata.asyncsupport == "true")?true: false
							, supportJoin: true
							, supportUpload:(jsdata.uploadsupport == "true")?true: false
							// The truncated flag is specific to the website, that is why we can't retrieve its value directly from jsdata, we have to build it
							, truncated:(jsdata.schemas.length > 20)?true: false};
			this.info = {url: jsdata.nodeurl , ivoid: null, contact: "Not available"};
			this.reports[jsdata.nodekey] = {"info": this.info, "capabilities": this.capabilities, description: "No description available"};
			$("div#treedisp").jstree("remove","#" + jsdata.nodekey);
			/*
			 * Create the root of the subtree of this node
			 */
			var description="No description available";
			var descriptionResult="";
			for( var i=0 ; i<this.nodeList.length ; i++ ) {
				var n = this.nodeList[i];
				if( n.id ==  jsdata.nodekey) {
					this.info.ivoid = n.ivoid;
					
					// This part is here to make the description easier to read by putting \n every 100 characters approximatively
					tmpDescription = n.description.split("\n");
					var tmpDescription2="";
					for (var j=0; j<tmpDescription.length; j++){
						tmpDescription2 += tmpDescription[j] + " ";
					}
					var tmpDescription3 = tmpDescription2.split(" ");
					tmpDescription3 = tmpDescription3.filter(e => e !== '');
					var lineLength=0;
					for (var k = 0; k < tmpDescription3.length; k++){
						if (tmpDescription3[k].length + lineLength < 100){
							descriptionResult += tmpDescription3[k] + " ";
							lineLength += tmpDescription3[k].length;
						} else {
							descriptionResult += "\n" + tmpDescription3[k] + " ";
							lineLength = tmpDescription3[k].length;
						}
					}
					this.reports[jsdata.nodekey].description = descriptionResult;
					
					this.info.contact = n.contact;
					description = jsdata.nodeurl + "\n" + n.ivoid + "\n" + n.description + "\n" ;
					break;
				}
			}
			description += "\n- Asynchronous mode  " + ((!this.capabilities.supportAsyncQueries)?" not ": "") + "supported\n";
			description += "- Table upload " + ((!this.capabilities.supportUpload)?" not ": "") + "supported\n";
			$("div#treedisp").jstree("create_node"
					, $("div#treedisp")
					, false
					, {"data" : {"icon": "images/Database2.png", "attr":{"id": jsdata.nodekey, "title": /*description*/ "Double click to filter the visible tables"}, "title" : jsdata.nodekey},
						"state": "closed"}
					,false
					,true);  

			/*
			 * Create first the first level tree (schemas)
			 */
			var nb_schemas = 0;
			var MAX_SCHEMA=19;
			var MAX_TABLE_PER_SCHEMA=40;
			var trunc = new Array();
			var tap_schema_index;
			var ivoa_index;
			const folders = [];
			// We start at the end of the list of schemas, we iterate through them and trunc them until we get to i < MAX_SCHEMA,
			//  then the rest of the schemas are added to the stack. tap_schema and ivoa schemas won't get truncated thanks to a filter below
			for( var i=jsdata.schemas.length-1 ; i>=0 ; i-- ) {
				var id_schema = jsdata.nodekey + "X" + jsdata.schemas[i].name;
				var description = jsdata.schemas[i].description;
				if(jsdata.schemas[i].name.toLowerCase() == "ivoa"){
					ivoa_index = i;
				}
				if(jsdata.schemas[i].name.toLowerCase() == "tap_schema"){
					tap_schema_index = i;			
				}
				// We do this verification to avoid having empty folders that have the same name as a filled folder
				if(folders.includes(jsdata.schemas[i].name && jsdata.schemas[i].name.toLowerCase() != "ivoa" && jsdata.schemas[i].name.toLowerCase() != "tap_schema")){
					break;
				}
				folders.push(jsdata.schemas[i].name);
				var schemaName = jsdata.schemas[i].name;
				// Here is the filter to avoid truncating tap_schema and ivoa
				if( i > MAX_SCHEMA && jsdata.schemas[i].name.toLowerCase() != "ivoa"   && jsdata.schemas[i].name.toLowerCase() != "tap_schema") {
					trunc[trunc.length] = schemaName;
				} else if (jsdata.schemas[i].name.toLowerCase() != "ivoa"   && jsdata.schemas[i].name.toLowerCase() != "tap_schema") {
					icon =  "images/Bluecube2.png";
					if( description == "") {
						description = "No Description Available";
					}
					description += "\n\n[CLICK] on the branch node to display the tables";
					description += "\n[DOUBLE CLICK] to filter the table list";
					$("div#treedisp").jstree("create_node"
							, $("#" + jsdata.nodekey)
							, false
							, {"data" : {"icon": icon, "attr":{"id": id_schema, "titleSchemaName": description}, "title" : jsdata.schemas[i].name},
								"state": "closed",
								"attr" :{"id": id_schema}}
							,false
							,true); 
				}  
			}
			// This second loop is used to search for ivoa and tap_schema after every other schemas in order to have them at the top of the stack,
			// this way they are displayed at the top of the datatree
			for( var i=jsdata.schemas.length-1 ; i>=0 ; i-- ) {
				var id_schema = jsdata.nodekey + "X" + jsdata.schemas[i].name;
				var description = jsdata.schemas[i].description;
				var schemaName = jsdata.schemas[i].name;
				if(schemaName.match(/TAP_SCHEMA/i) || schemaName.match(/ivoa/i)) {
					if(schemaName.match(/TAP_SCHEMA/i) ) {
						icon = "images/Redcube2.png";
						
						description = "Schema containing the description of the published tables";
					} else if(schemaName.match(/ivoa/i) ) {
						icon =  "images/Greencube2.png";
						description = "Tables matching IVOA data models (e.g. ObsCore)";
					}
					description += "\n\n[CLICK] on the branch node to display the tables";
					description += "\n[DOUBLE CLICK] to filter the table list";
					$("div#treedisp").jstree("create_node"
							, $("#" + jsdata.nodekey)
							, false
							, {"data" : {"icon": icon, "attr":{"id": id_schema, "title": description}, "title" : jsdata.schemas[i].name},
								"state": "closed",
								"attr" :{"id": id_schema}}
							,false
							,true); 
				}
			}
			/*
			 * add leaves (tables) the the schemas
			 */
			var nb_tables = 0;

			for( var i=0 ; i<jsdata.schemas.length ; i++ ) {
				var schema = jsdata.schemas[i];
				var id_schema = jsdata.nodekey + "X" + schema.name;
				if( i > MAX_SCHEMA && schema.name.toLowerCase() != "ivoa" && schema.name.toLowerCase() != "tap_schema") {
					//trunc[trunc.length] = schema.name;
				} else {
					var root = $("#" + id_schema);
					nb_tables = 0;
					/*
					 * We scan from the end to preserve the natural ordering because JSTREE stacks new nodes
					 */
					for( var j=(schema.tables.length-1) ; j>=0 ; j-- ) {
						var table = schema.tables[j];
						var id_table = jsdata.nodekey + ";" + schema.name + ";" + table.name;
						var description = table.description;
						if( description == "") {
							description = "No Description Available";
						}
						description += "\n Double click or drag and drop to display it"

						$("div#treedisp").jstree("create_node"
								, root
								, false
								, {"data"  : {"icon": "images/SQLTable2.png",
									          "attr":{"id": id_table, "title": description, "class":"icon-table"}, 
									          "title" : table.dataTreePath.table},
									"state": "closed",
									"attr" : {"id": id_table, "dataTreePath": JSON.stringify(table.dataTreePath)}
								}
								,false
								,true);   
						if( (nb_tables++) > MAX_TABLE_PER_SCHEMA-2 ) {
							break;
						}

					}
				}
			}
			$( "div#treedisp").jstree('close_all', -1);	
			var msg = "";
			if(jsdata.truncated != null  ) {
				msg = "\nTRUNCATED TABLE LIST: The table list has been truncated by the server (< 20 tables/schema)";
			} 
			if( trunc.length > 0 ) {
				// The scroll string is used to put the truncated tables inside a scrollable div
				var scroll = '<div id="nodeFilterList" class="detaildata" style="border: 1px black solid; background-color: whitesmoke; width: 100%; height: 380px; overflow: auto; position:relative">'
				msg += "\nTRUNCATED SCHEMA: The list of schemas has been truncated. \nThe following schemas are not displayed " + scroll + trunc.join("\n") + "</div>";
			}
			if( msg != "" ) {
				// The link variable is a div inserted into the truncated popup allowing the user to directly click on the text to open the selection popup
				link = "<a style='color: #fc0303;' href='#' onclick='Modalinfo.close(Modalinfo.findLastModal());nodeFilterView.fireOpenSelectorWindow("+ '"'+jsdata.nodekey+'"'+");'>"
				Modalinfo.info(link+ "REDUCED DATATREE : Schemas and/or Tables have been truncated.\nClick here or double click on the '" + jsdata.nodekey + "' node to make you own selection. </a>\n" + msg);
			}
			/*
			 * Activate leaves
			 */
			$("div#treedisp").find("li").each(function() {
				if ($(this).attr("id") != undefined && $(this).find(".metadata").length == 0) {
					var splited = $(this).attr("id").split(';');

					if( $(this).attr("dataTreePath") != undefined){
						var dataTreePath = jQuery.parseJSON($(this).attr("dataTreePath"));
						$(this).find("ins:first").after("<img class='metadata' src='images/metadata.png' title='Show metadata (Does not work with Vizier)'/>");
						$(this).find("ins:first").next("img").click(function() {
							/*
							 * Add the node key to the datadataTreePath provided by the server and attached to the node
							 */
							dataTreePath.nodekey = splited[0];
							resultPaneView.fireShowMetaNode(dataTreePath);
						});

						$(this).find("ins:first").click(function() {
							$(this).next().next().dblclick();
						});
					}
				}
			});
			$("div#treedisp").jstree("open_node", $('li.jstree-closed').first() );

			$("#"+jsdata.nodekey).before("<img class='metadata' src='images/metadata.png' title='Click to get more info' onclick='dataTreeView.showNodeInfos(&quot;" + jsdata.nodekey + "&quot;);'/>");
			this.setTitlePath({nodekey: jsdata.nodekey});
			Processing.hide();
		},

		fireTreeNodeEvent:function(datadataTreePath, andsubmit) {
			ViewState.fireDoubleClickOK(datadataTreePath);
			tapView.fireTreeNodeEvent(datadataTreePath, andsubmit);	
		},
		/**
		 * jsdata: {nodekey: ... , table: ..., date : ..., posNb: ... }
		 */
		addGoodies: function(jsdata){
			var id_schema = "GoodiesX" + jsdata.nodekey;
			
			var desc ="Creation : " + jsdata.date + "\nPositions: " + jsdata.posNb;
			
			if( $("#" + id_schema).length == 0 ){
				$("div#treedisp").jstree("create"
						, $("#goodies")
						, false
						, {"data" : {"attr":{"id": id_schema, "title": "Uploaded source lists"}, "title" : jsdata.nodekey},
							"state": "closed",
							"attr" :{"id": id_schema},

						}
						, false
						, true); 
			} else 	if( $("#" + id_schema + " #" + jsdata.table).length != 0 ){
				Modalinfo.error( "Node " + jsdata.nodekey + "." + jsdata.table + " already exist" );
				return;
			}
			if( $("#" + id_schema + " #" + jsdata.table).length == 0 ){
				var noneName = jsdata.table.replace(new RegExp('_xml$'), '');
				$("div#treedisp").jstree("create"
						, $("#" + id_schema)
						, false // position
						, {"data"  : {"icon": "images/SQLTable2.png", "attr":{"id": noneName, "title": desc}, "title" : noneName},
							"state": "closed"
						}
						,false// callback
						,true //skip rename
				);   
			}
			dataTreeView.getLists();
			return;
		},
		
		/**
		 *  return the list of uploaded source lists. Data are taken out from the tree, not from the server
		 */
		getLists: function() {
			var retour = [];
			$("li#GoodiesXmyList").find('li').find('a').each(function(){retour.push($(this).attr('id'));});
			return retour;
		},
		/**
		 * jsdata: {nodekey: ... , table: ...}
		 */
		delGoodies: function(jsdata){
			var id_schema = "GoodiesX" + jsdata.nodekey;

			if( $("#" + id_schema).length != 0 ){
				$("div#treedisp").jstree("remove", $("#" + id_schema + " #" + jsdata.table.replace("_xml", "")));
				if($("#" + id_schema).find("> ul > li:eq(0)").length == 0) {
					$("div#treedisp").jstree("remove", $("#" + id_schema));
				}
			}
			return;
		},
		pushJobToGoodies: function(jid, node, gn){
			var that = this;
			Processing.show("Pushing job to goodies");
			$.getJSON("pushjobtogoodies"
					, {jsessionid: sessionID, node: node, jobid: jid , goodiesname: gn }, function(jsondata) {
						Processing.hide();
						if( Processing.jsonError(jsondata, "Cannot get meta data") ) {
							return;
						}
						that.addGoodies(jsondata);
					});
		},
		uploadFile: function() {
			Modalinfo.dataPanel(title			
					, '<form id="uploadPanel" target="_sblank" action="uploaduserposlist" method="post"'
					+  'enctype="multipart/form-data">'
					+  ' <input class=stdinput  id="uploadPanel_filename" type="file" name="file" /><br>'
					+ '  <p class=help></p><br>'
					+  ' <input  type="submit" value="Upload" />'
					+  ' </form>'
					, null);
			$('#uploadPanel p').html("description");
			$('form#uploadPanel').ajaxForm({
				beforeSubmit: function() {
					if(beforeHandler != null ) {
						beforeHandler();
					}
				},
				success: function(e) {
					Modalinfo.close();
					if( Processing.jsonError(e, "Upload Position List Failure") ) {
						return;
					} else {
						/*
						 * Must add a goodies node here
						 */
						Out.debug("Upload success: " + JSON.stringify(e));
						if( handler != null) {
							var retour = {retour: e, path : $('#uploadPanel_filename').val().xtractFilename()};
							handler(retour);
						}
					}
				}
			});
		},
		setTitlePath: function (dataTreePath) {
			this.dataTreePath = dataTreePath;
			var tp = $('#titlepath');
			var span = '<span style="font-style: normal; font-size: x-small ; background-color:';
			tp.html('');
			if( dataTreePath) {
				if ($("#info-"+dataTreePath.nodekey).length == 0) {
					$("#"+dataTreePath.nodekey).after('<span id="info-'+dataTreePath.nodekey+'"></span>');

					if (nodeFilterView.getFilter(dataTreePath.nodekey) != null && nodeFilterView.getFilter(dataTreePath.nodekey) != undefined) {
						$("#info-"+dataTreePath.nodekey).after('<span class="node-filter">'+nodeFilterView.getFilter(dataTreePath.nodekey)+'</span>');
					}
				}
				else {
					$("#info-"+dataTreePath.nodekey).html("");
				}
				var span_info = $("#info-"+dataTreePath.nodekey);

				span_info.append(span
						+ ((this.capabilities.supportSyncQueries== true)?'lightgreen': 'salmon') 
						+ ';" title="' + ((this.capabilities.supportSyncQueries== true)?'S': 'Does not s') + 'upport synchronous queries">S</span>');
				span_info.append(span
						+ ((this.capabilities.supportJoin== true)?'lightgreen': 'salmon')
						+ ';" title="' + ((this.capabilities.supportJoin== true)?'S': 'Does not s')+ 'upport ADQL joins">J</span>');
				span_info.append(span
						+ ((this.capabilities.supportAsyncQueries == true)?'lightgreen': 'salmon') 
						+ ';" title="' + ((this.capabilities.supportAsyncQueries == true)?'S': 'Does not s')+ 'upport asynchronous queries">A</span>');
				span_info.append(span
						+ ((this.capabilities.supportUpload == true)?'lightgreen': 'salmon') 
						+ ';" title="' + ((this.capabilities.supportUpload == true)?'S': 'Does not s')+ 'upport table upload">U</span>');
				// The truncated flag has inverted colors, green when it's not truncated (false) and red when it is truncated (true)
				span_info.append(span
						+ ((this.capabilities.truncated == true)?'salmon': 'lightgreen') 
						+ ';" title="' + ((this.capabilities.truncated == true)?'T': 't')+ 'runcated list of schemas">T</span>');

			}
		},
		showNodeInfos: function (nodekey) {
//			var report = {"info": this.info, "capabilities": this.capabilities};
//			Modalinfo.infoObject(report, "Node " + this.dataTreePath.nodekey);
			
			// We display all infos in the modal and we open a subdiv to display the description with a scroll bar in case it is too long
			var infos = "<b>info:</b>" + "\n  <b>url:</b> " + this.reports[nodekey].info.url + "\n  <b>ivoid:</b> " + this.reports[nodekey].info.ivoid + "\n  <b>contact:</b> " + this.reports[nodekey].info.contact;
			var capabilities = "\n\n<b>capabilities:</b>" + "\n  <b>supportSyncQueries:</b> " + this.reports[nodekey].capabilities.supportSyncQueries + "\n  <b>supportAsyncQueries:</b> " + this.reports[nodekey].capabilities.supportAsyncQueries + "\n  <b>supportJoin:</b> " + this.reports[nodekey].capabilities.supportJoin + "\n  <b>supportUpload:</b> " + this.reports[nodekey].capabilities.supportUpload + "\n  <b>truncated:</b> " + this.reports[nodekey].capabilities.truncated;
			var scroll = '<div style="border: 1px black solid; background-color: whitesmoke; width: 100%; height: 200px; overflow: auto; position:relative">';
			Modalinfo.info(infos + capabilities + scroll + this.reports[nodekey].description + "</div>");
		},
		getBookmark: function() {
			var info = this.reports[this.dataTreePath.nodekey].info;
			if( info != undefined ){
				var np = window.location.href.split('?')[0].replace(/\/$/, "");
				return (info != null)?np + "?url=" + escape(info.url): np;
			} else {
				"No active data node"
			}
//			var np = window.location.href.split('?')[0].replace(/\/$/, "");
//			return (this.info != null)?np + "?url=" + escape(this.info.url): np;
		}
};

