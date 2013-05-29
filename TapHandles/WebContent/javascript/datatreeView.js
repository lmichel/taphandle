function DataTreeView() {
	/**
	 * default node list
	 * The nodes given here must be initialized in Nodebase.java
	 */
	this.nodeList = new Array();
	/**
	 * Metadata of the data files referenced in the Goodies node
	 */
	this.goodies = new Array();
}
DataTreeView.prototype = {
		initNodeBase : function(){
			var that = this
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
					sessionID = data.sessionID;
					for( var i=0 ; i<data.nodes.length ; i++) {
						that.nodeList[that.nodeList.length] = {
								id   :  data.nodes[i].key
								, text : data.nodes[i].key+ ' [' + data.nodes[i].description + ']'
								, ivoid: data.nodes[i].ivoid 
								, url: data.nodes[i].url
								, description: data.nodes[i].description
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
			var that = this
			Processing.show("Waiting on " + nodekey + " node description");

			$.getJSON("getnode", {jsessionid: sessionID, node: nodekey }, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot make data tree") ) {
					return;
				}
				else {
					that.fireBuildTree(jsdata);
				}
			});
		},
		fireBuildTree: function(jsdata) {
			//$("div#treedisp").jstree("remove","#rootid" );
			$("div#treedisp").jstree("remove","#" + jsdata.nodekey);
			/*
			 * Create the root of the subtree of this node
			 */
			var description="No description available";
			for( var i=0 ; i<this.nodeList.length ; i++ ) {
				var n = this.nodeList[i];
				if( n.id ==  jsdata.nodekey) {
					description = jsdata.nodeurl + "\n" + n.ivoid + "\n" + n.description + "\n" ;
					break;
				}
			}
			description += "\n- Asynchronous mode  " + ((jsdata.asyncsupport == "false")?" not ": "") + "supported\n";
			description += "- Table upload " + ((jsdata.uploadsupport  == "false")?" not ": "") + "supported\n";
			$("div#treedisp").jstree("create"
					, $("div#treedisp")
					, false
					, {"data" : {"icon": "images/Database.png", "attr":{"id": jsdata.nodekey, "title": description}, "title" : jsdata.nodekey},
						"state": "closed"}
					,false
					,true);       
			/*
			 * Create first the first level tree (schemas)
			 */
			for( var i=0 ; i<jsdata.schemas.length ; i++ ) {
				var id_schema = jsdata.nodekey + "X" + jsdata.schemas[i].name;
				var description = jsdata.schemas[i].description;

				var schemaName = jsdata.schemas[i].name;				
				if(schemaName.match(/TAP_SCHEMA/i) ) {
					icon = "images/Redcube.png";
					description = "Schema containing the description of the published tables";
				} else if(schemaName.match(/ivoa/i) ) {
					icon =  "images/Greencube.png";
					description = "Tables matching IVOA data models (e.g. ObsCore)";
				} else {
					icon =  "images/Bluecube.png";
					if( description == "") {
						description = "No Description Available";
					}
				}
				$("div#treedisp").jstree("create"
						, $("#" + jsdata.nodekey)
						, false
						, {"data" : {"icon": icon, "attr":{"id": id_schema, "title": description}, "title" : jsdata.schemas[i].name},
							"state": "closed",
							"attr" :{"id": id_schema}}
						,false
						,true);       
			}
			/*
			 * add leaves (tables) the the schemas
			 */
			var trunc = new Array();
			for( var i=0 ; i<jsdata.schemas.length ; i++ ) {
				var schema = jsdata.schemas[i];
				var id_schema = jsdata.nodekey + "X" + schema.name;
				var nb_tables = 0;
				var root = $("#" + id_schema);
				for( var j=0 ; j<schema.tables.length ; j++ ) {
					var table = schema.tables[j];
					var id_table = jsdata.nodekey + ";" + schema.name + ";" + table.name;
					var description = table.description;
					if( description == "") {
						description = "No Description Available";
					}
					$("div#treedisp").jstree("create"
							, root
							, false
							, {"data"  : {"icon": "images/SQLTable.png", "attr":{"id": id_table, "title": description}, "title" : table.name},
								"state": "closed",
								"attr" : {"id": id_table}
							}
							,false
							,true);   
					if( (nb_tables++) > 20 ) {
						trunc[trunc.length] = schema.name;
						break;
					}
				}
			}
			$( "div#treedisp").jstree('close_all', -1);	
			var msg = "";
			if(jsdata.truncated != null  ) {
				msg = "TRUNCATED TABLE LIST: The table list has been truncated by the server (~100 tables)";
			} 
			if( trunc.length > 0 ) {
				msg += "\nTRUNCATED SCHEMA: The table list of following schemas [" + trunc.join(",") + "] have been truncated to 20 items";
			}
			if( msg != "" ) {
				Modalinfo.info(msg + "\n\nDouble click on the '" + jsdata.nodekey + "' node to make you own selection");
			}
		},

		fireTreeNodeEvent:function(treepath) {
			tapView.fireTreeNodeEvent(treepath, true);
		},
		/**
		 * jsdata: {nodekey: ... , table: ...}
		 */
		addGoodies: function(jsdata){
			var id_schema = "GoodiesX" + jsdata.nodekey;

			if( $("#" + id_schema).length == 0 ){
				$("div#treedisp").jstree("create"
						, $("#goodies")
						, false
						, {"data" : {"attr":{"id": id_schema, "title": "description"}, "title" : jsdata.nodekey},
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
				$("div#treedisp").jstree("create"
						, $("#" + id_schema)
						, false // position
						, {"data"  : {"icon": "images/SQLTable.png", "attr":{"id": jsdata.table, "title": "description"}, "title" : jsdata.table},
							"state": "closed"
						}
						,false// callback
						,true //skip rename
						);   
			}
			return;
		},
		/**
		 * jsdata: {nodekey: ... , table: ...}
		 */
		delGoodies: function(jsdata){
			var id_schema = "GoodiesX" + jsdata.nodekey;

			if( $("#" + id_schema).length != 0 ){
				$("div#treedisp").jstree("remove", $("#" + id_schema + " #" + jsdata.table));
				if($("#" + id_schema).find("> ul > li:eq(0)").length == 0) {
					$("div#treedisp").jstree("remove", $("#" + id_schema));
				}
			}
			return;
		},
		pushJobToGoodies: function(jid){
			var that = this;
			Processing.show("Pushing job to goodies");
			$.getJSON("pushjobtogoodies"
				, {jsessionid: sessionID, node: "table", jobid:"jobid" , goodiesname: "goodiesname" }, function(jsondata) {
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


		}
}

