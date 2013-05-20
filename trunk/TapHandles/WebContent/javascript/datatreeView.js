function DataTreeView() {
	/**
	 * default node list
	 * The nodes given here must be initialized in Nodebase.java
	 */
	this.nodeList = new Array();
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

		addGoodies: function(jsdata){
			for( var i=0 ; i<jsdata.length ; i++) {
				var node = jsdata[i];
				var id_schema = "GoodiesX" + node.nodekey;
				$("div#treedisp").jstree("remove","#" + id_schema);

				$("div#treedisp").jstree("create"
						, $("#goodies")
						, false
						, {"data" : {"attr":{"id": id_schema, "title": "description"}, "title" : node.nodekey},
							"state": "closed",
							"attr" :{"id": id_schema}}
						,false
						,true); 
				for( var j=0 ; j<node.tables.length ; j++) {
					var table = node.tables[j];
					$("div#treedisp").jstree("create"
							, $("#" + id_schema)
							, false
							, {"data"  : {"icon": "images/SQLTable.png", "attr":{"id": table, "title": "description"}, "title" : table},
								"state": "closed"
							}
							,false
							,true);   
				}
			}
		}
}

