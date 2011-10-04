/*
 * Some utilities
 */
if(!String.prototype.startsWith){
	String.prototype.startsWith = function (str) {
		return !this.indexOf(str);
	}
};
if(!String.prototype.endsWith){
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	}
};

if(!String.prototype.hashCode){
	String.prototype.hashCode = function(){
		var hash = 0;
		if (this.length == 0) return code;
		for (i = 0; i < this.length; i++) {
			char = this.charCodeAt(i);
			hash = 31*hash+char;
			hash = hash & hash; 
		}
		return hash;
	}
};
if(!String.prototype.trim){
	String.prototype.trim = function(chaine){
		return chaine.replace(/^\s+|\s+$/g,"");
	} 
};

function trim(chaine) {
	return chaine.replace(/^\s+|\s+$/g,"");
}

function isNumber(val) {
	var exp = new RegExp("^[+-]?[0-9]*[.]?[0-9]*([eE][+-]?[0-9]+)?$","m"); 
	return exp.test(val);
}

var decimaleRegexp = new RegExp("^[+-]?[0-9]*[.][0-9]*([eE][+-]?[0-9]+)?$","m"); 
var bibcodeRegexp  = new RegExp(/^[12][089]\d{2}[A-Za-z][A-Za-z0-9&][A-Za-z0-9&.]{2}[A-Za-z0-9.][0-9.][0-9.BCRU][0-9.]{2}[A-Za-z0-9.][0-9.]{4}[A-Z:.]$/);		

function formatValue(columnName, value, tdNode) {
	logMsg(value);
	if( value.startsWith("http://") ||  value.startsWith("https://") ) {
		var titlepath = $('#titlepath').text().split('>');
		getDLView(titlepath[0], columnName, value, tdNode);	
	}
	else if( decimaleRegexp.test(value)){
		tdNode.html((new Number(value)).toPrecision(8));
	}
	else if( bibcodeRegexp.test(value)){
		tdNode.html("<a title=\"bibcode\" HREF=\http://cdsads.u-strasbg.fr/cgi-bin/nph-bib_query?" + value + "\" target=blank>" + value + "</A>");
	}
	else {
		tdNode.html(value);
	}
}

function getDLView(node, columnName, url, tdNode) {
	hideProcessingDialog();
	$.getJSON("getproductinfo", {url: url}, function(jsdata) {
		if( processJsonError(jsdata, "Cannot connect data") ) {
			tdNode.html("Error");
		}
		else {
			var cd, ct, ce;
			$.each(jsdata, function(k, v) {
				logMsg(k + ": " + v );
				if( k == 'ContentDisposition')    cd = v;
				else if( k == 'ContentType' )     ct = v;
				else if( k == 'ContentEncoding' ) ce = v;
			});
			var isFits = false;
			var isVotable = false;
			var samp_tag = "";
			if( (ct != null && (ct.match(/\.fit/i) || ct.match(/fits/))) ||
				(cd != null && (cd.match(/\.fit/i) || cd.match(/fits/)))	){
				samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='sampView.fireSendFitsDownload(\"" + url + "\"); return false;'/></a>"
				isFits = true;
			}
			else if( (ct != null && (ct.match(/\.xml/i) || ct.match(/\.voty/)|| ct.match(/\.votable/))) ||
					 (cd != null && (cd.match(/\.xml/i) || cd.match(/\.voty/)|| cd.match(/\.votable/)))){
				isVotable = true;
				samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='sampView.fireSendVOTableDownload(\"" + url + "\"); return false;'/></a>"
			}
			var dl_tag = "";
			/*
			 * Will be downloaded by the browser: no need to open a new tab
			 */
			if( (ce != null && (ce == 'gzip' || ce == 'zip')) || isFits ){
				dl_tag = "<a class='dl_download' title='Download Data' href='" + url + "'></a>"
			}
			else {
				dl_tag = "<a class='dl_download' title='Download Data' href='" + url + "' target=blank></a>"
			}

			tdNode.html(
				  "<a class='dl_info'     title='Get info about'      href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>"
				+ dl_tag 
			    + "<a class='dl_cart'     title='Add to cart'         href='#' onclick='cartView.fireAddUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>"
			    + samp_tag );
		}
	});
}