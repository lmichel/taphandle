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
	this.treePath = null;
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
		},
		fireBuildTree: function(jsdata) {
			this.capabilities = {supportSyncQueries: true
					, supportAsyncQueries: (jsdata.asyncsupport == "true")?true: false
					, supportJoin: true
					, supportUpload:(jsdata.uploadsupport == "true")?true: false};
			this.info = {url: jsdata.nodeurl , ivoid: null, description: "Not available"};
			$("div#treedisp").jstree("remove","#" + jsdata.nodekey);
			/*
			 * Create the root of the subtree of this node
			 */
			var description="No description available";
			for( var i=0 ; i<this.nodeList.length ; i++ ) {
				var n = this.nodeList[i];
				if( n.id ==  jsdata.nodekey) {
					this.info.ivoid = n.ivoid;
					this.info.description = n.description;
					description = jsdata.nodeurl + "\n" + n.ivoid + "\n" + n.description + "\n" ;
					break;
				}
			}
			description += "\n- Asynchronous mode  " + ((!this.capabilities.supportAsyncQueries)?" not ": "") + "supported\n";
			description += "- Table upload " + ((!this.capabilities.supportUpload)?" not ": "") + "supported\n";
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

		fireTreeNodeEvent:function(treepath, andsubmit) {
			this.setTitlePath(treepath);
			//resultPaneView.fireSetTreePath(treepath);	
			tapView.fireTreeNodeEvent(treepath, andsubmit);	
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
		},
		setTitlePath: function (treepath) {
			Out.info("title " + treepath);
			this.treePath = treepath;
			var job = (treepath.jobid == null)? "": '&gt;'+ treepath.jobid;
			var tp = $('#titlepath');
			var span = '<span style="font-style: normal; color: #888;font-size: x-small ; background-color:';
			tp.html('');
			tp.append(span
					+ ((this.capabilities.supportSyncQueries== true)?'lightgreen': 'salmon') 
					+ ';" title="' + ((this.capabilities.supportSyncQueries== true)?'S': 'Does not s') + 'upport synchronous queries">S</span>');
			tp.append(span
					+ ((this.capabilities.supportJoin== true)?'lightgreen': 'salmon')
					+ ';" title="' + ((this.capabilities.supportJoin== true)?'S': 'Does not s')+ 'upport ADQL joins">J</span>');
			tp.append(span
					+ ((this.capabilities.supportAsyncQueries == true)?'lightgreen': 'salmon') 
					+ ';" title="' + ((this.capabilities.supportAsyncQueries == true)?'S': 'Does not s')+ 'upport asynchronous queries">A</span>');
			tp.append(span
					+ ((this.capabilities.supportUpload == true)?'lightgreen': 'salmon') 
					+ ';" title="' + ((this.capabilities.supportUpload == true)?'S': 'Does not s')+ 'upport table upload">U</span>');
			tp.append('<a href="#" style="font-style: normal; font-size: x-small ; background-color: lightblue;" title="Click to get more info" onclick="dataTreeView.showNodeInfos();"> ? </a>');
			tp.append('&nbsp;<i>' + treepath.nodekey + '&gt;' + treepath.schema + '&gt;'+ treepath.table+ job);
		},
		showNodeInfos: function () {
			Modalinfo.dataPanel( "Info about node " + JSON.stringify(this.treePath), JSON.stringify(this.capabilities) + JSON.stringify(this.info));
		}
};

