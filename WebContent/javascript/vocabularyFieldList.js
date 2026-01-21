/**
 * This file is a copy of the BasicFieldList_mVc part of FieldList_v.js with some minor changes
 * We initialize a map to store "vocabulary"
 * Then we pass this map to a function which returns an object called vocabulary
 * This object can then be used by vocabularyFieldList, the modified BasicFieldList_mVc
 * This is useful to display vocabulary elements inside the query editor
 */

const vocabularyBaseStorage = new Map([
    
    
    ["otype (simbad)", [
        "?","Unknown",
        "*","Star",
        "**","**","**?",
        "a2*","alf2CVnV*","a2?",
        "AB*","AGB*","AB?",
        "Ae*","Ae*","Ae?",
        "AGN","AGN","AG?",
        "As*","Association","As?",
        "bC*","bCepV*","bC?",
        "bCG","BlueCompactG",
        "BD*","BrownD*","BD?",
        "Be*","Be*","Be?",
        "BH","BlackHole","BH?",
        "BiC","BrightestCG",
        "Bla","Blazar","Bz?",
        "BLL","BLLac","BL?",
        "blu","blue",
        "BS*","BlueStraggler","BS?",
        "bub","Bubble",
        "BY*","BYDraV*","BY?",
        "C*","C*","C*?",
        "cC*","ClassicalCep",
        "Ce*","Cepheid","Ce?",
        "CGb","ComGlob",
        "CGG","Compact_Gr_G",
        "Cl*","Cluster*","Cl?",
        "Cld","Cloud",
        "ClG","ClG","C?G",
        "cm","cmRad",
        "cor","denseCore",
        "CV*","CataclyV*","CV?",
        "DNe","DarkNeb",
        "dS*","delSctV*",
        "EB*","EclBin","EB?",
        "El*","EllipVar","El?",
        "Em*","EmLine*",
        "EmG","EmissionG",
        "EmO","EmObj",
        "Er*","Eruptive*","Er?",
        "err","Inexistent",
        "ev","Transient",
        "Ev*","Evolved*","Ev?",
        "FIR","FarIR",
        "flt","Filament",
        "G","Galaxy","G?",
        "gam","gamma",
        "gB","gammaBurst",
        "gD*","gammaDorV*",
        "GiC","GtowardsCl",
        "GiG","GtowardsGroup",
        "GiP","GinPair",
        "glb","Globule",
        "GlC","GlobCluster","Gl?",
        "gLe","GravLens","Le?",
        "gLS","GravLensSystem","LS?",
        "GNe","GalNeb",
        "GrG","GroupG","Gr?",
        "grv","Gravitation",
        "GWE","GravWaveEvent",
        "H2G","HIIG",
        "HB*","HorBranch*","HB?",
        "HH","HerbigHaroObj",
        "HI","HI",
        "HII","HIIReg",
        "HS*","HotSubdwarf","HS?",
        "HV*","HighVel*",
        "HVC","HVCld",
        "HXB","HighMassXBin","HX?",
        "IG","InteractingG",
        "IR","Infrared",
        "Ir*","IrregularV*",
        "ISM","ISM",
        "LeG","LensedG",
        "LeI","LensedImage","LI?",
        "LeQ","LensedQ",
        "Lev","LensingEv",
        "LIN","LINER",
        "LM*","Low-Mass*","LM?",
        "LP*","LongPeriodV*","LP?",
        "LSB","LowSurfBrghtG",
        "LXB","LowMassXBin","LX?",
        "Ma*","Massiv*","Ma?",
        "Mas","Maser",
        "MGr","MouvGroup",
        "Mi*","Mira","Mi?",
        "MIR","MidIR",
        "mm","mmRad",
        "MoC","MolCld",
        "mR","metricRad",
        "MS*","MainSequence*","MS?",
        "mul","Blend",
        "N*","Neutron*","N*?",
        "NIR","NearIR",
        "No*","Nova","No?",
        "OH*","OH/IR*","OH?",
        "OpC","OpenCluster",
        "Opt","Optical",
        "Or*","OrionV*",
        "out","Outflow","of?",
        "pA*","post-AGB*","pA?",
        "PaG","PairG",
        "PCG","protoClG","PCG?",
        "Pe*","ChemPec*","Pe?",
        "Pl","Planet","Pl?",
        "PM*","HighPM*",
        "PN","PlanetaryNeb","PN?",
        "PoC","PartofCloud",
        "PoG","PartofG",
        "Psr","Pulsar",
        "Pu*","PulsV*","Pu?",
        "QSO","QSO","Q?",
        "Rad","Radio",
        "rB","radioBurst",
        "RC*","RCrBV*","RC?",
        "reg","Region",
        "rG","RadioG",
        "RG*","RGB*","RB?",
        "RNe","RefNeb",
        "Ro*","RotV*","Ro?",
        "RR*","RRLyrae","RR?",
        "RS*","RSCVnV*","RS?",
        "RV*","RVTauV*","RV?",
        "S*","S*","S*?",
        "s*b","BlueSG","s?b",
        "s*r","RedSG","s?r",
        "s*y","YellowSG","s?y",
        "SB*","SB*","SB?",
        "SBG","StarburstG",
        "SCG","SuperClG","SC?",
        "SFR","StarFormingReg",
        "sg*","Supergiant","sg?",
        "sh","HIshell",
        "smm","smmRad",
        "SN*","Supernova","SN?",
        "SNR","SNRemnant","SR?",
        "St*","Stream",
        "SX*","SXPheV*",
        "Sy*","Symbiotic*","Sy?",
        "Sy1","Seyfert1",
        "Sy2","Seyfert2",
        "SyG","Seyfert",
        "TT*","TTauri*","TT?",
        "ULX","ULX","UX?",
        "UV","UV",
        "V*","Variable*","V*?",
        "var","Variable",
        "vid","Void",
        "WD*","WhiteDwarf","WD?",
        "WR*","WolfRayet*","WR?",
        "WV*","Type2Cep","WV?",
        "X","X",
        "XB*","XrayBin","XB?",
        "Y*O","YSO","Y*?"
    ]],
    
	["dataproduct_type (obscore)", [
        "cube", "timeseries", "spectrum", "image"
    ]],
    
    ["access_format (obscore)", [
        "application/x-votable;content=datalink",
        "application/x-votable+xml",
        "application/x-votable+xml;content=datalink",
        "application/x-votable+xml;content=mivot",
        "image/fits",
        "image/jpeg",
        "image/png",
        "application/fits",
     ]],
    ["standard_id (rel registry)", [
        "helio://helio-vo.eu/std/myexperiment/v0.1",
        "helio://helio-vo.eu/std/sms/v0.4",
        "helio://helio-vo.eu/std/tavernaserver/v0.1",
        "ivo://helio-vo.eu/service/stilts",
        "ivo://helio-vo.eu/std/fullquery/soap/v1.0",
        "ivo://helio-vo.eu/std/fullquery/v0.2",
        "ivo://helio-vo.eu/std/fullquery/v1.0",
        "ivo://helio-vo.eu/std/helio-tap",
        "ivo://helio-vo.eu/std/hps/v1.0",
        "ivo://helio-vo.eu/std/longfullquery/soap/v1.0",
        "ivo://helio-vo.eu/std/longfullquery/v1.0",
        "ivo://ivoa.net/sso#openid",
        "ivo://ivoa.net/sso#tls-with-password",
        "ivo://ivoa.net/std/bibvo#biblink-harvest-1.0",
        "ivo://ivoa.net/std/conesearch",
        "ivo://ivoa.net/std/dali#examples",
        "ivo://ivoa.net/std/dali#examples-1.0",
        "ivo://ivoa.net/std/datalink#links-1.0",
        "ivo://ivoa.net/std/datalink#links-1.1",
        "ivo://ivoa.net/std/delegation",
        "ivo://ivoa.net/std/gms#search-1.0",
        "ivo://ivoa.net/std/hats#hats-1.0",
        "ivo://ivoa.net/std/hips#hips-1.0",
        "ivo://ivoa.net/std/hips#hipslist-1.0",
        "ivo://ivoa.net/std/openskynode",
        "ivo://ivoa.net/std/registry",
        "ivo://ivoa.net/std/sia",
        "ivo://ivoa.net/std/sia#aux",
        "ivo://ivoa.net/std/sia#query-2.0",
        "ivo://ivoa.net/std/simdaldataaccess#datasets-1.0",
        "ivo://ivoa.net/std/simdalrepository",
        "ivo://ivoa.net/std/simdalrepository#projects-1.0",
        "ivo://ivoa.net/std/simdalrepository#protocols-1.0",
        "ivo://ivoa.net/std/simdalrepository#search-1.0",
        "ivo://ivoa.net/std/simdalsearch#views-1.0",
        "ivo://ivoa.net/std/slap",
        "ivo://ivoa.net/std/soda#sync-1.0",
        "ivo://ivoa.net/std/ssa",
        "ivo://ivoa.net/std/tap",
        "ivo://ivoa.net/std/tap#async-1.1",
        "ivo://ivoa.net/std/tap#aux",
        "ivo://ivoa.net/std/tap#sync-1.1",
        "ivo://ivoa.net/std/voevent",
        "ivo://ivoa.net/std/vosi#availability",
        "ivo://ivoa.net/std/vosi#availability",
        "ivo://ivoa.net/std/vosi#capabilities",
        "ivo://ivoa.net/std/vosi#table-load-sync-1.x",
        "ivo://ivoa.net/std/vosi#table-permissions-1.x",
        "ivo://ivoa.net/std/vosi#table-update-async-1.x",
        "ivo://ivoa.net/std/vosi#tables",
        "ivo://ivoa.net/std/vosi#tables-1.1",
        "ivo://ivoa.net/std/vospace#sync-2.1",
        "ivo://ivoa.net/std/vospace/v2.0#nodes",
        "ivo://ivoa.net/std/vospace/v2.0#sync",
        "ivo://ivoa.net/std/vospace/v2.0#transfers",
        "ivo://ivoa.net/std/vospace/v2.0#views",
        "ivo://ivoa.net/std/vospace/v2.x#files",
        "ivo://org.astrogrid/std/cea/v1.0",
        "ivo://org.astrogrid/std/community/accounts",
        "ivo://org.astrogrid/std/community/v1.0#policymanager",
        "ivo://org.astrogrid/std/community/v1.0#securityservice",
        "ivo://org.astrogrid/std/myspace/v1.0#myspace",
        "ivo://org.astrogrid/std/vosi/v0.3#availability",
        "ivo://org.astrogrid/std/vosi/v0.3#capabilities",
        "ivo://org.astrogrid/std/vosi/v0.3#ceaapplication",
        "ivo://org.astrogrid/std/vosi/v0.3#tables",
        "ivo://org.astrogrid/std/vosi/v0.4#applications",
        "ivo://org.astrogrid/std/vosi/v0.4#availability",
        "ivo://org.astrogrid/std/vosi/v0.4#capabilities",
        "ivo://org.astrogrid/std/vospace/v1.0#vospace",
        "vos://cadc.nrc.ca~vospace/cadc/std/logging#control-1.0",
        "vos://cadc.nrc.ca~vospace/cadc/std/logging#logcontrol-1.0",
        "vos://cadc.nrc.ca~vospace/cadc/std/uws#update-1.0",
        "vos://cadc.nrc.ca~vospace/cadc/std/vospace#nodeprops",
        "vos://cadc.nrc.ca~vospace/cadc/std/vospace#xfer",
        ]], 
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