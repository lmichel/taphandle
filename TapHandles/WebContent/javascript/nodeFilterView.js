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
		};
		/**
		 * Open a modal box allowing to select the tables of the node which must be displayed in the tree
		 * @param node
		 */
		this.fireOpenSelectorWindow = function(node) {

			var table = '<h2><span>Table Selector for node  <i>' + node + '</i></span></h2>'
			+ "<div class='detaildata'>"
			+ "    <div class='detaildata' style='width: 60%; height: 60px;display: inline;float:left;overflow: hidden;'>"
			+ "        <span class=help>Give a filter on catalogue name or description:"
			+ "        <br> - The filter is a RegExp case unsensitive."
			+ "        <br> - Type [RETURN] to apply"
			+ "        </span>"
			+ "    </div>"
			+ "    <div class='detaildata' style='width: 39%; height: 45px;display: inline;float:right; padding-top:15px;'>"
			+ "        <input id=nodeFilter type=texte width=24 style='background-color: whitesmoke;'>"
			+ "    </div>"
			+ "    <hr><p class=help>The number of selected tables returned by the server is limited to 100 in any case.<p>"
			+ "    <div id=nodeFilterList class='detaildata' style='border: 1px black solid; background-color: whitesmoke; width: 90%; height: 380px; overflow: auto;margin : auto;position:relative'></div>"
			+ "    <p class=help>Unselect the tables you not want to access<br>"
			+ "    Caution: You cannot refine your selection once it is accepted (Version 1.1)<p><hr>"
			+ "    <input type=button value='accept' onclick='nodeFilterView.fireGetFilteredNodes(\"" + node + "\");' style='font-weight: bold;'>"
			+ "    <span class=help>(Type [ESC] to close the window)</span>"
			+ "    </div>"
			+ "</div>";

			if ($('#detaildiv').length == 0) {
				$(document.documentElement).append(
				"<div id=detaildiv style='width: 99%; display: none;'></div><hr>");
			}
			$('#detaildiv').html(table);

			$('#detaildiv').modal( { onShow: function(dlg) {
				$(dlg.container).css('height','auto').css('width','500px');
				}
			});
			$("#nodeFilter").keyup(function(event) {
				if(event.keyCode == 13) {	            
					$.getJSON("getnode", {jsessionid: sessionID, node: node, filter: $("#nodeFilter").val()}, function(jsdata) {
						hideProcessingDialog();
						if( processJsonError(jsdata, "Cannot get the node selection") ) {
							return;
						} else {
							that.fireShowNodeSelection($("#nodeFilterList"), jsdata);
						}
					});
				}
			});
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
				listDiv.append("<span style='float: left; width: 100%; background-color: white; border: 1px solid black'><b>Schema</b> " + sn + "</span>");		
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
