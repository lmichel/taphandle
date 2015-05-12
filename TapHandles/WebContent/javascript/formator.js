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

ValueFormator = function() {
	/**
	 * 
	 */
	var formatValue = function(columnName, values, tdNode, columnMap) {
		var value = values[columnName.currentColumn];
		if( columnName.currentColumn)  {
			Modalinfo.error("formatValue: Missing column numer in " + JSON.strnigify(columnMap));
			return;
		}
		var value = values[columnName.currentColumn];
		/*
		 * First case te value is an URL
		 */
		if( value.startsWith("http://") ||  value.startsWith("https://") ) {
			/*
			 * To be send to the the datalink processor to setup possible cutout services
			 */
			var fovObject = {s_ra: (columnMap.s_ra != -1)? columnMap.s_ra: 9999 ,
							s_dec: (columnMap.s_dec != -1)? columnMap.s_dec: 9999 ,
	        				s_fov: (columnMap.s_fov != -1)? columnMap.s_fov: 9999 
							}
			/*
			 * The mime type is specified: we can take into account the type of response withpout requesting the HTTP header
			 */
			if( columnName.access_format != -1 ){
				if( columnName.access_format.endsWith("content=datalink" ) ){
					tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\""
							+  value + "\" , \"forwardxmlresource\" ); return false;'/></a>"
					);
					addDatalinkControl(value,  tdNode, fovObject);
				} else if( columnName.access_format.startsWith("image/") || columnName.access_format.startsWith("text/") ){
					addPreviewControl(columnName, value, tdNode);	
				} else  {
					/*
					 * In case of a simple download we he to request the HTT header anyway to get extra information (zipper, encrypted..)
					 */
					processURLInfo( columnName, value, tdNode, fovObject);
				}
			/*
			 * No mime type specified: We need to request the HTTP header for taking into account the response type
			 */
			} else {
				processURLInfo(columnName, value, tdNode, fovObject);
			} 
		/*
		 * Second case: an atomic value;
		 */
		} else {
			formatSimpleValue(columnName, value, tdNode);
		}
	};
	
	/*
	 * Private logic
	 */
	/**
	 * Format value: take into account the format of the string representing the value.
	 * No reference to the context
	 */
	var addPreviewControl = function(columnName, value, tdNode) {
		/*
		 * TODO :add SAMP message to Aladin : script.aladin.send
		 */
		if( value.match(/^((position)|(region)|(polygon))/i) ) {
			tdNode.html("<a title='STC Region (click to expand)' class='dl_stc' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"STC Region\");'></a>");
		} else if( value.startsWith("Array") ) {
			tdNode.html("<a title='Data array(click to expand)' class='dl_dataarray' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"Data Array\");'></a>");
		} else if( decimaleRegexp.test(value)){
			tdNode.html((new Number(value)).toPrecision(8));
		} else if( bibcodeRegexp.test(value)){
			tdNode.html("<a title=\"bibcode\" HREF=\http://cdsads.u-strasbg.fr/cgi-bin/nph-bib_query?" + value + "\" target=blank>" + value + "</A>");
		} else {
			tdNode.html(value);
	};
	var addInfoControl = function(columnName, value, tdNode, url){
		tdNode.append("<a class='dl_info' title='Get info about' href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>");
	};
	var addDownloadControl = function(columnName, value, tdNode, url, secureMode, contentEncoding){
		var target = (contentEncoding == "")? "": "target=blank";				
		var dl_class = (secureMode)? "dl_securedownload": 'dl_download';
		tdNode.append("<a class='" + dl_class + "' " + target + " title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");'></a>");
	};	
	var addCartControl = function(columnName, value, tdNode, url, secureMode){
		if( secureMode ){
			tdNode.append("<a class='dl_securecart' title='Add to cart' href='#' onclick='cartView.fireRestrictedUrl(\"" + dataTreeView.treePath.nodekey + "\", \"" + url + "\"); return false;'/></a>");
		} else {
			tdNode.append("<a class='dl_cart' title='Add to cart' href='#' onclick='cartView.fireAddUrl(\"" + dataTreeView.treePath.nodekey + "\", \"" + url + "\"); return false;'/></a>");
		}
	};	
	var addSampControl = function(columnName, value, tdNode, url, sampMType, fileName){
		tdNode.append("<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" 
			+ url + "\",\"" + sampMType + "\", \"" + fileName + "\"); return false;'/></a>");
	};	
	var addPreviewControl = function(columnName, value, tdNode, url, fileName){
		var title = fileName + " preview";
		tdNode.append("<a class='dl_download' title='Data preview' href='javascript:void(0);' onclick='Modalinfo.openIframePanel(\"" + url + "\", \"", title + "\");'></a>");
	};
	/**
	 * Gte the URL infos asynchronously: formating is achieved inside the callback
	 */
	var processURLInfo = function(columnName, value, tdNode, fovObject) {
		$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
			if( Processing.jsonError(jsdata, "Cannot connect data") ) {
				tdNode.html("Error");
			} else {
				/*
				 * Extract useful header data
				 */
				var cd=null, ct=null, ce=null;
				var dl_class = 'dl_download';
				var dl_cart_tag  = "<a class='dl_cart' title='Add to cart' href='#' onclick='cartView.fireAddUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>";
				var contentDisposition = "";
				var contentType = "";
				var contentEncoding = "";
				var secureMode=false;
				var sampMType = "";
				var fileName = "";
				$.each(jsdata, function(k, v) {
					if( k == 'ContentDisposition') {
						contentDisposition = v;
						var regex = new RegExp(/filename=(.*)$/) ;
						var results = regex.exec(v);
						if(results){
							fileName = results[1];
						}
					} else if( k == 'ContentType' ) {
						contentType = v;
						if( v.match(/fits$/) ) {
							sampMType = "table.load.fits";
						} else {
							sampMType = "table.load.votable";
						}
					} else if( k == 'ContentEncoding' ) {
						contentEncoding = v;
					} else if( k == 'nokey' ) {
						if( v.match('401') != null ) {
							secureMode = true;
							dl_class = 'dl_securedownload';
							dl_cart_tag  = "<a class='dl_securecart' title='Add to cart' href='#' onclick='cartView.fireRestrictedUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>";
						}
					}
				});				
				
				if( contentType.endsWith("content=datalink" ) ){
					addDatalinkControl(value,  tdNode, fovObject);
				} else if( contentType.match(/fits/) ||  contentType.match(/votable/)) {
					addInfoControl(columnName, value, tdNode, url);
					addDownloadControl(columnName, value, tdNode, url, secureMode, contentEncoding);
					addCartControl(columnName, value, tdNode, url, secureMode);
					addSampControl(columnName, value, tdNode, url, secureMode, sampMType, fileName);
				} else if( urlInfo.access_format.startsWith("image/") || urlInfo.access_format.startsWith("text/") ){
					addInfoControl(columnName, value, tdNode, url);
					addPreviewControl(columnName, value, tdNode, fileName);	
					addCartControl(columnName, value, tdNode, url, secureMode);
				} else {
					addInfoControl(columnName, value, tdNode, url);
					addDownloadControl(columnName, value, tdNode, url, secureMode, contentEncoding);
					addCartControl(columnName, value, tdNode, url, secureMode);
				}
			}
		});
	}
	/*
	 * exports
	 */
	var pblc = {};
	pblc.formatValue = formatValue;
	return pblc;
}();



columnMap

function formatValueExp(columnName, values, tdNode, columnMap) {
	var value = values[columnName.currentColumn];
	if( columnName.currentColumn)  {
		Modalinfo.error("formatValue: Missing column numer in " + JSON.strnigify(columnMap));
		return;
	}
	var value = values[columnName.currentColumn];
	if( columnName.access_format != -1 ){
		if( columnName.access_format.endsWith("content=datalink" ) ){
			tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\""
					+  value + "\" , \"forwardxmlresource\" ); return false;'/></a>"
			);
		} else if( columnName.access_format.startsWith("application/")){
			getDLView(columnName, value, tdNode);	
		} else  {
			formatValue(columnName, value, tdNode);
		}
	} else {
		formatSimpleValue(columnName, value, tdNode);
	}
}

function formatValue(columnName, value, tdNode) {
	if( columnName.match(/.*datalink.*/i)  ){
		//	var url = 'getdatalink?url=' + escape(value);
		//"DataLinkBrowser.startBrowser("http://obs-he-lm:8888/3XMM/smartdatalink?oid=1160803203386703882"
		//tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='resultPaneView.fireGetDataLink(\"" + value + "\"); return false;'/></a>");
//		tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\"forwardxmlresource?target=" 
//		+  encodeURIComponent(value) + "\" , \"forwardxmlresource\" ); return false;'/></a>"
		tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\""
				+  value + "\" , \"forwardxmlresource\" ); return false;'/></a>"
		);

	} else if( value.startsWith("http://") ||  value.startsWith("https://") ) {
		var titlepath = $('#titlepath').text().split('>');
		getDLView(columnName, value, tdNode);	
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

function getDLView(columnName, url, tdNode) {
	Processing.hide();
	var node = dataTreeView.treePath.nodekey;
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
				dl_tag = "<a class='" + dl_class + "' title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");'></a>";
			} else {
				dl_tag = "<a class='" + dl_class + "' title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");' target=blank></a>";
			}

			tdNode.html(
					"<a class='dl_info' title='Get info about' href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>"
					+ dl_tag 
					+ dl_cart_tag
					+ samp_tag );
		}
	});
}