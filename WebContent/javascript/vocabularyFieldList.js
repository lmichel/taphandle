/**
 * This file is a copy of the BasicFieldList_mVc part of FieldList_v.js with some minor changes
 * We initialize a map to store "vocabulary"
 * Then we pass this map to a function which returns an object called vocabulary
 * This object can then be used by vocabularyFieldList, the modified BasicFieldList_mVc
 * This is useful to display vocabulary elements inside the query editor
 */

const vocabularyBaseStorage = new Map([
	["animals", ["https://example.com/cat","https://example.com/dog","https://example.com/bird"]],
	["shapes", ["https://example.com/circle","https://example.com/square","https://example.com/triangle"]],
	["colors", ["https://example.com/yellow","https://example.com/blue","https://example.com/red"]]
]);

function dictToVocabulary(dictionnary) {
	const vocabularyBase = {};
	for (const key of dictionnary.keys()) {
		vocabularyBase[key] = {
			dataTreePath: {
				schema: "",
				quoted: false,
				tableorg: key,
				table: key,
				nodekey: ""
			},
			hamap: [],
			relations: [],
			classes: [],
			targets: [
				{
					target_datatreepath: {
						nodekey: "",
						schema: "",
						table: key,
						tableorg: key,
						jobid: "",
						key: ""
					},
					target_column: "oid",
					source_column: "oidref"
				}
			]
		};

		for (const value of dictionnary.get(key)) {
			vocabularyBase[key]["hamap"].push({
				unit: "",
				nameattr: value,
				ucd: "",
				dataType: "VARCHAR",
				utype: "",
				description: "",
				nameorg: value,
				type: "VARCHAR",
				column_name: value
			});
		}
	}
	return vocabularyBase;
}

const vocabulary = dictToVocabulary(vocabularyBaseStorage);

function VocabularyFieldList(parentDivId, formName, handlers){
	/*
	 * Some reference and IDs on useful  DOM elements
	 */
	this.parentDiv = $("#" +parentDivId );
	this.fieldListId   = parentDivId + "_fieldlist";
	this.fieldTableId   = parentDivId + "_fieldtable";
	this.attributesHandlers = new Array();
	this.filterPattern=null;
	this.formName = formName;
	this.dataTreePath = null;	/// instance of DataTreePath		
	/*
	 * Keep handler references
	 */
	this.stackHandler   = handlers.stackHandler;
	this.orderByHandler = handlers.orderByHandler;
	this.raHandler      = handlers.raHandler;
	this.decHandler     = handlers.decHandler;

	this.stackTooltip = "Click to constrain this field";
}

VocabularyFieldList.prototype = {
		draw: function() {
			var that = this;
			this.attributesHandlers = new Array();
			this.parentDiv.html('<div class=fielddiv><div class="fieldlist" id="' + this.fieldListId
					+  '"></div>'
					//	+ ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top:8px;"></div>'
			);

			$("#"+this.fieldListId).closest(".fielddiv").css("padding","3px");

		},

		setStackTooltip: function(stackTooltip) {
			this.stackTooltip = stackTooltip;
		},
		setDataTreePath: function(dataTreePath){
			this.dataTreePath = dataTreePath;
			this.displayFields();
			
		},
		getAttributeTitle : function(ah) {
			return ah.nameorg 
			+ " - database name; " +  ah.nameattr
			+ " - description: " +  ah.description
			+ ((ah.ucd)?(" - UCD: " +  ah.ucd): "")
			+ ((ah.unit)?(" - Unit: " +  ah.unit): "")
			+ ((ah.type)?(" - Type: " +  ah.type): "")
			+ ((ah.range)?(" - Range: " +  JSON.stringify( ah.range).replace(/'/g,"&#39;")): "")
			;
		},
		/**
		 * Draw one field in the container
		 * Field described by the attribute handler ah
		 */
		displayField:  function(ah){
			var that = this;
			var id = this.formName + "_" + ah.nameattr;
			var title = this.getAttributeTitle(ah);
			var row ="<tr class=attlist id=" + ah.nameattr + ">" 
			+"<td class=attlist><span title='" + title + "'>"+ ah.nameorg+"</span></td>"
			+"<td class='attlist help'>" + ah.type +"</td>"
			+"<td class='attlist help'>" + ((ah.unit != undefined)? ah.unit:"") +"</td>"
			;

			if( this.orderByHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=order_" + id + " title=\"Click to order the query result by this field\" class=\"orderbybutton\" type=\"button\" ></input>"
					+"</td>";
			}
			if( this.stackHandler != null ) {
				row += "<td class='attlist attlistcmd' style='width:40px; text-align: left'>"
					+"<input id=stack_" + id + " title=\"" + this.stackTooltip  + "\"  class=\"stackconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			if( this.raHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=tora_" + id + " title=\"Click to use this field as RA coordinate\"  class=\"raconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			if( this.decHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=todec_" + id + " title=\"Click to use this field as DEC coordinate\"  class=\"decconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			row += "</tr>";
			$('#' + this.fieldTableId).append(row);
			var id = this.formName + "_" + ah.nameattr;
			if( this.orderByHandler != null ) {
				$('#' + this.fieldListId + ' input[id="order_' + id + '"]' ).click(function() {that.orderByHandler($(this).closest("tr").attr("id"));});
			}
			if( this.stackHandler != null ){
				$('#' + this.fieldListId + ' input[id="stack_' + id + '"]' ).click(function() {that.stackHandler($(this).closest("tr").attr("id"));});
			}
			if( this.raHandler != null ){
				$('#' + this.fieldListId + ' input[id="tora_' + id + '"]' ).click(function() {that.raHandler($(this).closest("tr").attr("id"));});
			}
			if( this.decHandler != null ){
				$('#' + this.fieldListId + ' input[id="todec_' + id + '"]' ).click(function() {that.decHandler($(this).closest("tr").attr("id"));});
			}
			$('#' + this.fieldTableId + " tr#" + ah.nameattr + " span").tooltip( {
			//$('#' + this.fieldTableId + ' tr[id="'+ ah.nameattr + '"]span').tooltip( {
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
		},
		/**
		 * Draw all fields in the container
		 * Fields are described by the attribute handler array ahs
		 * Warning ahs is  not a map but an array 
		 */
		displayFields : function(){
			var that = this;
			this.attributesHandlers = new Array();
			if( this.dataTreePath != null ) {
				var ahm = vocabulary[this.dataTreePath.table].hamap;
				that.displayAttributeHandlers(ahm);
			}
		},
		/**
		 * Set the filed list with the AH array
		 * @param ahm
		 */
		displayAttributeHandlers: function(ahm) {
			var table  = "<table id=" + this.fieldTableId + " class='table' style='width: 100%; border-spacing: 0px; border-collapse:collapse'></table>";
			$('#' + this.fieldListId).html(table);
			for( var k=0 ; k<ahm.length ; k++) {
				var ah = ahm[k];
				this.attributesHandlers[ah.nameattr] = ah;				
				this.addPresetValues(ah);
				this.displayField(ah);
			}

		},
		addPresetValues : function(attributeHandler){
			if( attributeHandler.nameattr == 'dataproduct_type' ) {
				attributeHandler.range = {type: 'list', values: ["'image'", "'spectrum'", "'cube'",
				                                                 "'timeseries'", "'visibility'", "'eventlist'"]};
			} else 	if( attributeHandler.nameattr == 'calib_level' ) {
				attributeHandler.range = {type: 'list', values: [0, 1, 2, 3]};

			} else if( attributeHandler.nameattr == 'access_format' ) {
				attributeHandler.range = {type: 'list', values: ["'text/html'", "'text/xml'","'text/plain'"
				                                                 , "'application/fits'","'application/x-votable+xml'", "'application/pdf'"
				                                                 , "'image/png'", "'image/jpeg'", "'image/gif'", "'image/bmp'"]};
			}
		},
		getAttributeHandler: function(ahname){
			return this.attributesHandlers[ahname];
		}
}