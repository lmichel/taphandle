/*
 * Some utilities
 */
if(!String.prototype.startsWith){
	String.prototype.startsWith = function (str) {
		return !this.indexOf(str);
	};
};
if(!String.prototype.endsWith){
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
};

if(!String.prototype.hashCode){
	String.prototype.hashCode = function(){
		var hash = 0;
		if (this.length == 0) return code;
		for (var i = 0; i < this.length; i++) {
			var char = this.charCodeAt(i);
			hash = 31*hash+char;
			hash = hash & hash; 
		}
		return hash;
	};
};
if(!String.prototype.trim){
	String.prototype.trim = function(chaine){
		return chaine.replace(/^\s+|\s+$/g,"");
	} ;
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
	if( columnName.match(/.*datalink.*/i)  ){
	//	var url = 'getdatalink?url=' + escape(value);
		tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='resultPaneView.fireGetDataLink(\"" + value + "\"); return false;'/></a>");
			
	} else if( value.startsWith("http://") ||  value.startsWith("https://") ) {
		var titlepath = $('#titlepath').text().split('>');
		getDLView(titlepath[0], columnName, value, tdNode);	
	} else if( value.match(/^((position)|(region)|(polygon))/i) ) {
		tdNode.html("<a title='STC Region (click to expand)' class='dl_stc' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"STC Region\");'></a>");
	} else if( value.startsWith("Array") ) {
		tdNode.html("<a title='Data array(click to expand)' class='dl_dataarray' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"Data Array\");'></a>");
	} else if( decimaleRegexp.test(value)){
		tdNode.html((new Number(value)).toPrecision(8));
	} else if( bibcodeRegexp.test(value)){
		tdNode.html("<a title=\"bibcode\" HREF=\http://cdsads.u-strasbg.fr/cgi-bin/nph-bib_query?" + value + "\" target=blank>" + value + "</A>");
	} else {
		tdNode.html(value);
	}
}

function getDLView(node, columnName, url, tdNode) {
	Processing.hide();
	$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
		if( Processing.jsonError(jsdata, "Cannot connect data") ) {
			tdNode.html("Error");
		} else {
			var cd=null, ct=null, ce=null;
			var dl_class = 'dl_download';
			var dl_cart_tag  = "<a class='dl_cart' title='Add to cart' href='#' onclick='cartView.fireAddUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>";

			$.each(jsdata, function(k, v) {
				if( k == 'ContentDisposition')    cd = v;
				else if( k == 'ContentType' )     ct = v;
				else if( k == 'ContentEncoding' ) ce = v;
				else if( k == 'nokey' ) {
					if( v.match('401') != null ) {
						dl_class = 'dl_securedownload';
						dl_cart_tag  = "<a class='dl_securecart' title='Add to cart' href='#' onclick='cartView.fireRestrictedUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>";
					}
				}
			});
			var isFits = false;
			var isVotable = false;
			var samp_tag = "";
			if( (ct != null && (ct.match(/\.fit/i) || ct.match(/fits/))) ||
				(cd != null && (cd.match(/\.fit/i) || cd.match(/fits/)))	){
				//samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" + url + "\"); return false;'/></a>";
				samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='resultPaneView.fireSendVoreportWithInfo(\"" + url + "\"); return false;'/></a>";
				
				isFits = true;
			}
			else if( (ct != null && (ct.match(/\.xml/i) || ct.match(/\.voty/)|| ct.match(/\.votable/))) ||
					 (cd != null && (cd.match(/\.xml/i) || cd.match(/\.voty/)|| cd.match(/\.votable/)))){
				isVotable = true;
				samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" + url + "\"); return false;'/></a>";
			}
			var dl_tag = "";
			/*
			 * Will be downloaded by the browser: no need to open a new tab
			 */
			if( (ce != null && (ce == 'gzip' || ce == 'zip')) || isFits ){
				dl_tag = "<a class='" + dl_class + "' title='Download Data' href='javascript:void(0);' onclick='Location.changeLocation(\"" + url + "\");'></a>";
			} else {
				dl_tag = "<a class='" + dl_class + "' title='Download Data' href='javascript:void(0);' onclick='Location.changeLocation(\"" + url + "\");' target=blank></a>";
			}

			tdNode.html(
				  "<a class='dl_info' title='Get info about' href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>"
				+ dl_tag 
			    + dl_cart_tag
			    + samp_tag );
		}
	});
}