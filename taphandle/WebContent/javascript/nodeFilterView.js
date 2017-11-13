jQuery.extend({

	NodeFilterView : 
		/**
	 * 
	 */
		function() {
		/**
		 * keep a reference to ourselves
		 */
		var that = this;
		/**
		 * who is listening to us?
		 */
		var listeners = new Array();

		var filter = new Array();
		/**
		 * add a listener to this view
		 */
		this.addListener = function(list) {
			listeners.push(list);
		};

		this.fireGetFilteredNodes  = function(node){
			$.each(listeners, function(i) {
				listeners[i].controlGetFilteredNodes(node);
			});
			
			if (this.getFilter(node) != null) {
				filter = this.changeFilter(node, $("#nodeFilter").val());
			} else {
				filter.push({node: node, filter: $("#nodeFilter").val()});
			}
			
			Modalinfo.closeDataPanel();
		};
		
		
		this.fireDeleteFilteredNodes =function(node){
			
			goodies = "[";
			
			nodelist = $("#myList li input");
			for(i = 0; i < nodelist.length ; i++ ){
				if(!nodelist[i].checked){
					span = $("#myList li span")[i].innerText;
					if(goodies.length > 3){
						goodies += ",";
					}
					goodies += '"' + span + '"';
					dataTreeView.delGoodies({"nodekey" : "myList", "table" : span});
					ViewState.fireGoodyRemoved(span);
				}
			}
			goodies += "]";
			
			jobs = "[";
			node = $("#nodeFilterList ul");
			for(j = 0; j < node.length; j++){
				if(node[j].id != "myList"){
					
					nodelist = $("#" + node[j].id + " li input");
					for(i = 0; i < nodelist.length ; i++ ){
						if(!nodelist[i].checked){
							span = $("#" + node[j].id + " li span")[i].innerText;
							if(jobs.length > 3){
								jobs += ",";
							}
							jobs += '{"node":"'+ node[j].id+ '", "jobs":"' + span + '"}';
							dataTreeView.delGoodies({"nodekey" : node[j].id, "table" : span.substring(0,span.length -4)});
						}
					}					
				}
			}
			jobs += "]";
			list = '{"myList":' + goodies + ',"myJobs":' + jobs + '}';


			$.getJSON("deletegoodies", {"jsessionid": sessionID, "list": list});
			Modalinfo.closeDataPanel();
			
		};
		
		
		this.getFilter = function(node) {
			var f = null;
			filter.forEach(function(element) {
			    if (element.node === node) {
			    	f = element.filter;
			    }
			});
			return f;
		}
		
		this.changeFilter = function(node, new_filter) {
			filter.forEach(function(element) {
			    if (element.node === node) {
			    	element.filter = new_filter;
			    }
			});
			return filter;
		}
		/**
		 * Open a modal box allowing to select the tables of the node which must be displayed in the tree
		 * @param node
		 */
		this.fireOpenSelectorWindow = function(node) {
			// For goodies node
			if (node === "goodies") {
				var table = "<div class='detaildata'>"
/*					+ "     <div class='detaildata' style='height: 45px;display: inline;float:right; padding-top:15px; margin-right: 15px;'>"
//					+ "        <input id=nodeFilter type=texte width=24 class='form-control input-sm'>"
					+ "    </div>"
*/					+ "    <div id=nodeFilterList class='detaildata' style='border: 1px black solid; background-color: whitesmoke; width: 100%; height: 380px; overflow: auto; position:relative'></div>"
					+ "    <p class=help>Unselect the tables you not want to remove"
					+ "    (<a href='#' onclick=\"$('#nodeFilterList input').attr('checked', 'true');$('#nodeFilterList li').attr('class', 'tableSelected');\">select</a> /"
					+ "     <a href='#' onclick=\"$('#nodeFilterList input').removeAttr('checked');$('#nodeFilterList li').attr('class', 'tableNotSelected');\">unselect</a> all)<br>"
					+ "    Caution: You cannot refine your selection once it is accepted (Version 1.1)<p><hr>"
					+ "    <input type=button value='delete' onclick='nodeFilterView.fireDeleteFilteredNodes(\"" + node + "\");' style='font-weight: bold;'>"
					+ "    <span class=help>(Type [ESC] to close the window)</span>"
					+ "    </div>"
					+ "</div>";
				
				Modalinfo.center();
				
				Modalinfo.dataPanel('Table Selector for node  <i>' + node + '</i>', table, null, "white");
				that.applyFilter(node);
			} else {
				var table = "<div class='detaildata'>"
				+ "    <div class='detaildata' style='width: 60%; display: inline; overflow: hidden;'>"
				+ "        <span class=help>Give a filter on catalogue name or description:"
				+ "        <br> - The filter is a RegExp case unsensitive."
				+ "        <br> - Type [RETURN] to apply"
				+ "        <br> The number of selected tables returned by the server is limited to 100 in any case."
				+ "        </span>"
				+ "    </div>"
				+ "    <div class='detaildata' style='height: 45px;display: inline;float:right; padding-top:15px; margin-right: 15px;'>"
				+ "        <input id=nodeFilter type=texte width=24 class='form-control input-sm'>"
				+ "    </div>"
				+ "    <div id=nodeFilterList class='detaildata' style='border: 1px black solid; background-color: whitesmoke; width: 100%; height: 380px; overflow: auto; position:relative'></div>"
				+ "    <p class=help>Unselect the tables you not want to access"
				+ "    (<a href='#' onclick=\"$('#nodeFilterList input').attr('checked', 'true');$('#nodeFilterList li').attr('class', 'tableSelected');\">select</a> /"
				+ "     <a href='#' onclick=\"$('#nodeFilterList input').removeAttr('checked');$('#nodeFilterList li').attr('class', 'tableNotSelected');\">unselect</a> all)<br>"
				+ "    Caution: You cannot refine your selection once it is accepted (Version 1.1)<p><hr>"
				+ "    <input type=button value='Accept' onclick='nodeFilterView.fireGetFilteredNodes(\"" + node + "\");' style='font-weight: bold;'>"
				+ "    <span class=help>(Type [ESC] to close the window)</span>"
				+ "    </div>"
				+ "</div>";
	
//				if ($('#detaildiv').length == 0) {
//					$(document.documentElement).append(
//					"<div id=detaildiv style='width: 99%; display: none;'></div><hr>");
//				}
//				$('#detaildiv').html(table);
//	
//				$('#detaildiv').modal( { onShow: function(dlg) {
//					$(dlg.container).css('height','auto').css('width','500px');
//					}
//				});
//				$("#simplemodal-container").css('height', 'auto'); 
//				$("#simplemodal-container").css('width', 'auto'); 
				
				Modalinfo.dataPanel('Table Selector for node  <i>' + node + '</i>', table, null, "white");
				
				//$(window).trigger('resize.simplemodal'); 
				//Processing.show("Filering meta data");
				$("#nodeFilter").keyup(function(event) {
					if(event.keyCode != 13) {	            
						that.applyFilter(node);
					}
				});
				this.applyFilter(node);
				Modalinfo.center();
			}
		};	
		
		this.applyFilter = function(node) {
			//Processing.show('Get filtered table list');
			if(node ==="goodies"){
				$.getJSON("GetGoodiesList", {jsessionid: sessionID}, function(jsdata){
					if( Processing.jsonError(jsdata, "Cannot get the node selection") ) {
						return;
					}else {
						var listDiv = $("#nodeFilterList");
						//that.fireShowNodeSelection($("#nodeFilterList"), jsdata);
						listDiv.append("<p class='chapter' style='border: 1px solid #c6c4c4 !important;'><b> " + "myLists" + "</b></p>");		
						var list = "<ul class='attlist' id='myList'>";
						
						for(var i = 0;  i < jsdata.myLists.length ; i++){
							
							list += "<li class=tableSelected >" 
								+ "<input  type='checkbox' checked onclick='nodeFilterView.fireSelectFilteredNode($(this));'>"
								+ "<span style='font-color: black;'>" + jsdata.myLists[i].filename + "</span>"
							    + " <i>" + jsdata.myLists[i].decription + "</i>"
							    + "</li>";
							
						}
						
						list += "</ul>";
						listDiv.append(list);
						listDiv.append("<p class='chapter' style='border: 1px solid #c6c4c4 !important;'><b> " + "myJobs" + "</b></p>");						
						var jobKey ="";
							for( key in jsdata.myJobs){
								listDiv.append("<p class='chapter'><b> " + key + "</b></p>");		
								var list = "<ul class='attlist' id='"+ key +"' >";
								
								for(var i = 0;  i < jsdata.myJobs[key].length ; i++){
									
									list += "<li class=tableSelected >" 
										+ "<input  type='checkbox' checked onclick='nodeFilterView.fireSelectFilteredNode($(this));'>"
										+ "<span style='font-color: black;'>" + jsdata.myJobs[key][i].jobnumber + "</span>"
									    + " <i>" + jsdata.myJobs[key][i].description + "</i>"
									    + "</li>";
								}
								
								list += "</ul>";
								listDiv.append(list);
						}			
						
					}
				});
				
				jsData = [];
				that.fireShowGoodiesSelection($("#nodeFilterList"), jsData);	
			}else{
				$.getJSON("getnode", {jsessionid: sessionID, node: node, filter: $("#nodeFilter").val(), selected: ''}, function(jsdata) {
					//Processing.hide();
					if( Processing.jsonError(jsdata, "Cannot get the node selection") ) {
						return;
					}else {
						that.fireShowNodeSelection($("#nodeFilterList"), jsdata);
					}
				});
			}
		};
		/**
		 * Display in the div the list of selected tables returned by the server 
		 */
		this.fireShowNodeSelection = function(listDiv, jsSelection)  {
			listDiv.html('');		
			for( var i=0 ; i<jsSelection.schemas.length ; i++ ) {
				var schema = jsSelection.schemas[i];
				var sn = schema.name;
				if( sn == "TAP_SCHEMA" || sn == 'tap_schema' ) {
					continue;
				}
				listDiv.append("<p class='chapter' style='border: 1px solid #c6c4c4 !important;'><b>Schema</b> " + sn + "</p>");		
				var list = "<ul class=attlist>";
				for( var j=0 ; j<schema.tables.length ; j++ ) {
					var table = schema.tables[j];
					list += "<li class=tableSelected >" 
						+ "<input  type='checkbox' checked onclick='nodeFilterView.fireSelectFilteredNode($(this));'>"
						+ "<span style='font-color: black;'>" + table.name + "</span>"
					    + " <i>" + table.description + "</i>"
					    + "</li>";
				}
				list += "</ul>";
				listDiv.append(list);		
			}
		};
		
		
		this.fireShowGoodiesSelection = function(listDiv,jsSelection){
			/*for( var i=0 ; i<jsSelection.schemas.length ; i++ ) {
				var schema = jsSelection.schemas[i];
				var sn = schema.name;
				if( sn == "TAP_SCHEMA" || sn == 'tap_schema' ) {
					continue;
				}
				listDiv.append("<p class='chapter' style='border: 1px solid #c6c4c4 !important;'><b>Schema</b> " + sn + "</p>");		
				var list = "<ul class=attlist>";
				for( var j=0 ; j<schema.tables.length ; j++ ) {
					var table = schema.tables[j];
					list += "<li class=tableSelected >" 
						+ "<input  type='checkbox' checked onclick='nodeFilterView.fireSelectFilteredNode($(this));'>"
						+ "<span style='font-color: black;'>" + table.name + "</span>"
					    + " <i>" + table.description + "</i>"
					    + "</li>";
				}
				list += "</ul>";
				listDiv.append(list);
			}*/
		};
		
		/**
		 * Select unselect one filter table
		 * 
		 */
		this.fireSelectFilteredNode = function(button) {
			if( button.attr('checked') ) {
				button.parent().attr('class', 'tableSelected');
			} else {
				button.parent().attr('class', 'tableNotSelected');
			}
		};

	}
});
