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
var bibcodeRegexp  = new RegExp(/^\d+[a-zA-Z0-9]+\.\..*$/);		

function formatValue(value) {
	if( value.startsWith("http://") ||  value.startsWith("https://") ) {
		var titlepath = $('#titlepath').text().split('>');
		logMsg(titlepath);
		var x =  getDLView(titlepath[0], value);	
		return x;
		}
	else if( decimaleRegexp.test(value)){
		return (new Number(value)).toPrecision(8);
	}
	else if( bibcodeRegexp.test(value)){
		return "<a title=\"bibcode\" HREF=\http://cdsads.u-strasbg.fr/cgi-bin/nph-bib_query?" + value + "\" target=blank>" + value + "</A>";
	}
	else {
		return value;
	}
}

function getDLView(node, url) {
	
	return  "<a class='dl_download' title='Download Data' href='#' onclick='resultPaneView.fireDownloadProduct(\"" + url + "\"); return false;'></a>"
	+ "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='sampView.fireSendTapDownload(\"" + url + "\"); return false;'/></a>"
	+ "<a class='dl_cart'     title='Add to cart'         href='#' onclick='cartView.fireAddUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>"
	+ "<a class='dl_info'     title='Get info about'      href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>"
	;

}