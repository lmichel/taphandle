jQuery.extend({

	KWConstraintModel: function(first, tbl, ah, model, def_value){
		var val1;
		var val2;
		var that = this;

		var listeners = new Array();
		var operators = new Array();
		var andors = new Array();

		this.addListener = function(list){
			listeners.push(list);
		};

		var attributehandler = ah;
		var table = tbl;
		attributehandler.dataType = attributehandler.dataType.replace('adql:', '').toLowerCase();
		var qlmodel = model;
		var default_value = def_value;
		var operator ;
		var operand ;
		var andor ;
logMsg("KWM " + table);
		var presetValues = new Array();
		presetValues["dataproduct_type"] = ["'image'", "'spectrum'", "'cube'",
		                                    "'timeseries'", "'visibility'", "'eventlist'"];
		presetValues["calibration_level"] = [0, 1, 2, 3];
		presetValues["access_format"] = ["'text/html'", "'text/xml'","'text/plain'"
		                                 , "'application/fits'","'application/x-votable+xml'", "'application/pdf'"
		                                 , "'image/png'", "'image/jpeg'", "'image/gif'", "'image/bmp'"];

		this.isTextType = function() {
			if( attributehandler.dataType == 'varchar' || attributehandler.dataType == 'clobs'  ||
					attributehandler.dataType == 'region'  || attributehandler.dataType == 'char') {
				return true;
			}
			return false;
		};

		if( attributehandler.dataType == 'select' ) {
			operators = [];
			andors = [];
		}
		else if( attributehandler.dataType == 'adqlpos' ) {
			operators = ["inCircle", "inBox"];
			andors = ["OR", "AND"];

		}
		else if( !that.isTextType()) {
			operators = ["=", "!=", ">", "<", "between", 'IS NULL', 'IS NOT NULL'];
			andors = ['AND', 'OR'];
		}
		else {
			operators = ["=", "!=", "LIKE", "NOT LIKE", 'IS NULL', 'IS NOT NULL'];
			andors = ['AND', 'OR'];
		}

		if(  attributehandler.dataType != 'select' ) {
			var addConst = presetValues[attributehandler.name .toLowerCase()];
			if( addConst != null ) {
				for( var c=0 ; c<addConst.length ; c++ ) {
					operators[operators.length] = "= " + addConst[c];
				}
			}
		}
		if( first == true ) {
			andors = [];
		}

		this.processEnterEvent = function(ao, op, opd) {
			andor = ao;
			if( that.isTextType() ) {
				if( !that.checkAndFormatString(op, opd) ) {
					return;
				}
			}
			else {
				if( !that.checkAndFormatNum(op, opd) ) {
					return;
				}			
			}
			that.notifyTypomsg(0, operator + ' ' + operand);				
			if( andors .lengthlength == 0 ) {
				that.removeAndOr();
			}
			qlmodel.updateQuery();
		};

		this.checkAndFormatNum = function(op, opd) {
			/*
			 * Case of select items in ADQL
			 */
			if( op == null || op.length == 0 ) {
				operator = "";
				operand = "";
				return 1 ;			
			}
			if( op == 'IS NULL' ) {
				operator = 'IS NULL';
				operand = '';
				return 1;								
			}
			else if( /^\s*$/.test(opd)  ) {
				if( ah.name == 'Cardinality' || ah.name.startsWith('Qualifier ')) {
					that.notifyTypomsg(1, 'Numerical operand requested');
					return 0 ;
				}
				else {
					operator = 'IS NOT NULL';
					operand = '';
					return 1;
				}
			}
			else if( op == 'between' || op == '][' || op == ']=[' || op == '[]' || op == '[=]') {
				var words = opd.split(' ') ;
				if( words.length != 3 || !/and/i.test(words[1]) ||
						words[0].length == 00 || words[2].length == 00 ||
						isNaN(words[0]) || isNaN(words[2]) ) {
					that.notifyTypomsg(1, 'Operand must have the form "num1 and num2" with operator "' + op + '"');
					return 0 ;
				}
				if( op == 'between' ) {
					operator = op;
					operand = words[0] + ' AND ' + words[2];						
				}
				else {
					operator = op;
					operand = '(' + words[0] + ' , ' + words[2] + ')';												
				}
				return 1 ;
			}
			else if( op == 'inCircle' || op == 'inBox')  {
				var area = opd.split(',');
				if( area.length != 3 || isNaN(area[0]) || isNaN(area[1]) || isNaN(area[2]) ) {
					that.notifyTypomsg(1, 'Search area must be like :alpha,delta,size"');					
					return 0 ;
				}
				if( op == 'inCircle') {
					operator = "CIRCLE('ICRS', " + area[0]+ ", " +area[1] + ", " + area[2]+ ")";
					operand = "";
				}
				else {
					operator = "BOX('ICRS', " + area[0]+ ", " +area[1] + ", " + area[2]+  ", " + area[2]  +")";
					operand = "";					
				}
				return 1 ;

			}
			else if( isNaN(opd) ) {
				that.notifyTypomsg(1, 'Single numeric operand required with operator "' + op + '"');				
				return 0 ;
			}
			else {
				operator = op;
				operand = opd;
				return 1 ;			
			}
		};

		this.checkAndFormatString = function(op, opd) {
			if( op == 'IS NULL' ) {
				operator = 'IS NULL';
				operand = '';
				return 1;								
			}
			else if( /^\s*$/.test(opd)  ) {
				operator = 'IS NOT NULL';
				operand = '';
				return 1;				
			}
			else {
				if ( /^\s*'.*'\s*$/.test(opd)  ) {
					operand = opd;
				}
				else {
					operand = "'" + opd + "'";
				}
				operator = op;
				return 1;			
			}
		};

		this.processRemoveConstRef = function(ahname) {
			qlmodel.processRemoveConstRef(ahname);
		};

		this.processRemoveFirstAndOr = function(key) {
			qlmodel.processRemoveFirstAndOr(key);
		};

		this.removeAndOr = function() {
			andor = "";
		};

		this.getADQL = function(attrQuoted) {	
			var quote = "";
			if( ah.name.startsWith('_') ) {
				quote = '"';
			}
			if(  ah.name.startsWith('Qualifier ')) {
				return 'Qualifier{ ' + ah.name.split(' ')[1] + operator + ' ' + operand + '}';
			}
			else if( operator.startsWith('CIRCLE') || operator.startsWith('BOX'))  {
				//				CONTAINS(POINT('ICRS GEOCENTER', "_s_ra", "_s_dec"), BOX('ICRS GEOCENTER', 'dsa', 'dsad', 'dsa', 'dsad')) = 'true';
				var coordkw = attributehandler.name.split(' ');
				var bcomp = ( booleansupported )? "'true'" :  "1";
				var c1 = coordkw[0];
				if( c1.startsWith('_') ) c1 = '"' + c1 + '"';
				var c2 = coordkw[1];
				if( c2.startsWith('_') ) c2 = '"' + c2 + '"';
				return andor + " CONTAINS(POINT('ICRS', " + c1 + ", " +  c2 + "), "
				+ operator + ") = " + bcomp;
			}
			else {
				return andor + ' ' + quote + table + "." + attributehandler.name + quote + ' ' + operator + ' ' + operand;
			}
		};
		this.getTable = function(attrQuoted) {	
			return table;
		};
		this.notifyInitDone = function(){
			$.each(listeners, function(i){
				listeners[i].isInit(table, attributehandler, operators, andors, default_value);
			});
		};
		this.notifyTypomsg = function(fault, msg) {
			$.each(listeners, function(i){
				listeners[i].printTypomsg(fault,msg);
			});			
		};

	}
});