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

/**
 * Singleton encapsulating the formating function 
 * Called each time a result value has to be displayed
 * @returns {___anonymous_ValueFormator}
 */
ValueFormator = function() {

	/**
	 * 
	 */
	var formatValue = function(columnName, values, tdNode, columnMap) {
		var value = values[columnName.currentColumn];
		if( columnName.currentColumn)  {
			Modalinfo.error("formatValue: Missing column numer in " + JSON.stringify(columnMap));
			return;
		}
		var value = values[columnMap.currentColumn];
		/*
		 * First case te value is an URL
		 */
		if( value.startsWith("http://") ||  value.startsWith("https://") ) {
			/*
			 * To be send to the the datalink processor to setup possible cutout services
			 */
			var fovObject = {s_ra: (columnMap.s_ra != -1)? columnMap.s_ra: 9999 ,
					s_dec: (columnMap.s_dec != -1)? columnMap.s_dec: 9999 ,
							s_fov: (columnMap.s_fov != -1)? columnMap.s_fov: 9999 };
			/*
			 * The mime type is specified: we can take into account the type of response withpout requesting the HTTP header
			 */
			if( columnMap.access_format != -1 ){
				var access_format = values[columnMap.access_format];
				if( access_format.endsWith("content=datalink" ) ){
					tdNode.html("");
					addInfoControl(columnName, tdNode, value);
					addDatalinkControl(value,  tdNode, fovObject);
				} else if( access_format.startsWith("image/") || access_format.startsWith("text/") ){
					tDdNode.html("");
					addInfoControl(columnName, tdNode, value);
					addPreviewControl(columnName, tdNode, fileName);	
					addCartControl(columnName, tdNode, value, secureMode);
				} else  {
					/*
					 * In case of a simple download we he to request the HTTP header anyway to get extra information (zipper, encrypted..)
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

	/************************************
	 * Private logic
	 */
	/**
	 * Format value: take into account the format of the string representing the value.
	 * No reference to the context
	 */
	var formatSimpleValue = function(columnName, value, tdNode) {
		/*
		 * TODO :add SAMP message to Aladin : script.aladin.send
		 */
		if( value.match(/^((position)|(region)|(polygon))/i) ) {
			tdNode.html("<a title='STC Region (click to expand)' class='dl_stc' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"STC Region\");'></a>");
			tdNode.append("<a class='dl_samp' title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendAladinScript(\"" +value + "\"); return false;'/></a>");
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
	var addInfoControl = function(columnName, tdNode, url){
		tdNode.append("<a class='dl_info' title='Get info about' href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>");
	};
	var addDownloadControl = function(columnName, tdNode, url, secureMode, contentEncoding){
		var target = (contentEncoding == "")? "": "target=blank";				
		var dl_class = (secureMode)? "dl_securedownload": 'dl_download';
		tdNode.append("<a class='" + dl_class + "' " + target + " title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");'></a>");
	};	
	var addCartControl = function(columnName, tdNode, url, secureMode){
		if( secureMode ){
			tdNode.append("<a class='dl_securecart' title='Add to cart' href='#' onclick='cartView.fireRestrictedUrl(\"" + dataTreeView.treePath.nodekey + "\", \"" + url + "\"); return false;'/></a>");
		} else {
			tdNode.append("<a class='dl_cart' title='Add to cart' href='#' onclick='cartView.fireAddUrl(\"" + dataTreeView.treePath.nodekey + "\", \"" + url + "\"); return false;'/></a>");
		}
	};	
	var addSampControl = function(columnName, tdNode, url, sampMType, fileName){
		tdNode.append("<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" 
				+ url + "\",\"" + sampMType + "\", \"" + fileName + "\"); return false;'/></a>");
	};	
	var addPreviewControl = function(columnName, tdNode, url, fileName){
		var title = fileName + " preview";
		tdNode.append("<a class='dl_download' title='Data preview' href='javascript:void(0);' onclick='Modalinfo.openIframePanel(\"" + url + "\", \"", title + "\");'></a>");
	};	
	var addDatalinkControl = function(url, tdNode, fovObject){
		tdNode.append("<a class='dl_datalink' title='Get LinkedData'/></a>");
		tdNode.children(".dl_datalink").first().click(function() {
			DataLinkBrowser.startCompliantBrowser(url, "forwardxmlresource", fovObject);
		});
	};
	/**
	 * Get the URL infos asynchronously: formating must be achieved inside the callback
	 */
	var processURLInfo = function(columnName, url, tdNode, fovObject) {
		$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
			if( Processing.jsonError(jsdata, "Cannot connect data") ) {
				tdNode.html("Error");
			} else {
				/*
				 * Extract useful header data
				 */
				var cd=null, ct=null, ce=null;
				var contentDisposition = "";
				var contentType = "";
				var contentEncoding = "";
				var secureMode=false;
				var sampMType = "";
				var fileName = "";
				/*
				 * HTTP header parsing
				 */
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
					} else if( k == 'nokey' &&  v.match('401')  ) {
						secureMode = true;
					}
				});				
				/*
				 * Put the right controls according to the context
				 */
				tdNode.html("");
				if( contentType.endsWith("content=datalink" ) ){
					addInfoControl(columnName, tdNode, url);
					addDatalinkControl(url,  tdNode, fovObject);
				} else if( contentType.match(/fits/) ||  contentType.match(/votable/)) {
					addInfoControl(columnName, tdNode, url);
					addDownloadControl(columnName, tdNode, url, secureMode, contentEncoding);
					addCartControl(columnName, tdNode, url, secureMode);
					addSampControl(columnName, tdNode, url, secureMode, sampMType, fileName);
				} else if( urlInfo.access_format.startsWith("image/") || urlInfo.access_format.startsWith("text/") ){
					addInfoControl(columnName, tdNode, url);
					addPreviewControl(columnName, tdNode, fileName);	
					addCartControl(columnName, tdNode, url, secureMode);
				} else {
					addInfoControl(columnName, tdNode, url);
					addDownloadControl(columnName, tdNode, url, secureMode, contentEncoding);
					addCartControl(columnName, tdNode, url, secureMode);
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

//
//
//function formatValueExp(columnName, values, tdNode, columnMap) {
//	var value = values[columnName.currentColumn];
//	if( columnName.currentColumn)  {
//		Modalinfo.error("formatValue: Missing column numer in " + JSON.strnigify(columnMap));
//		return;
//	}
//	var value = values[columnName.currentColumn];
//	if( columnName.access_format != -1 ){
//		if( columnName.access_format.endsWith("content=datalink" ) ){
//			tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\""
//					+  value + "\" , \"forwardxmlresource\" ); return false;'/></a>"
//			);
//		} else if( columnName.access_format.startsWith("application/")){
//			getDLView(columnName, value, tdNode);	
//		} else  {
//			formatValue(columnName, value, tdNode);
//		}
//	} else {
//		formatSimpleValue(columnName, value, tdNode);
//	}
//}
//
//function formatValue(columnName, value, tdNode) {
//	if( columnName.match(/.*datalink.*/i)  ){
//		//	var url = 'getdatalink?url=' + escape(value);
//		//"DataLinkBrowser.startBrowser("http://obs-he-lm:8888/3XMM/smartdatalink?oid=1160803203386703882"
//		//tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='resultPaneView.fireGetDataLink(\"" + value + "\"); return false;'/></a>");
////		tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\"forwardxmlresource?target=" 
////		+  encodeURIComponent(value) + "\" , \"forwardxmlresource\" ); return false;'/></a>"
//		tdNode.html("<a class='dl_datalink' title='Get LinkedData'   href='#' onclick='DataLinkBrowser.startBrowser(\""
//				+  value + "\" , \"forwardxmlresource\" ); return false;'/></a>"
//		);
//
//	} else if( value.startsWith("http://") ||  value.startsWith("https://") ) {
//		var titlepath = $('#titlepath').text().split('>');
//		getDLView(columnName, value, tdNode);	
//	} else if( value.match(/^((position)|(region)|(polygon))/i) ) {
//		tdNode.html("<a title='STC Region (click to expand)' class='dl_stc' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"STC Region\");'></a>");
//	} else if( value.startsWith("Array") ) {
//		tdNode.html("<a title='Data array(click to expand)' class='dl_dataarray' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"Data Array\");'></a>");
//	} else if( decimaleRegexp.test(value)){
//		tdNode.html((new Number(value)).toPrecision(8));
//	} else if( bibcodeRegexp.test(value)){
//		tdNode.html("<a title=\"bibcode\" HREF=\http://cdsads.u-strasbg.fr/cgi-bin/nph-bib_query?" + value + "\" target=blank>" + value + "</A>");
//	} else {
//		tdNode.html(value);
//	}
//}
//
//function getDLView(columnName, url, tdNode) {
//	Processing.hide();
//	var node = dataTreeView.treePath.nodekey;
//	$.getJSON("getproductinfo", {jsessionid: sessionID, url: url}, function(jsdata) {
//		if( Processing.jsonError(jsdata, "Cannot connect data") ) {
//			tdNode.html("Error");
//		} else {
//			var cd=null, ct=null, ce=null;
//			var dl_class = 'dl_download';
//			var dl_cart_tag  = "<a class='dl_cart' title='Add to cart' href='#' onclick='cartView.fireAddUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>";
//
//			$.each(jsdata, function(k, v) {
//				if( k == 'ContentDisposition')    cd = v;
//				else if( k == 'ContentType' )     ct = v;
//				else if( k == 'ContentEncoding' ) ce = v;
//				else if( k == 'nokey' ) {
//					if( v.match('401') != null ) {
//						dl_class = 'dl_securedownload';
//						dl_cart_tag  = "<a class='dl_securecart' title='Add to cart' href='#' onclick='cartView.fireRestrictedUrl(\"" + node + "\", \"" + url + "\"); return false;'/></a>";
//					}
//				}
//			});
//			var isFits = false;
//			var isVotable = false;
//			var samp_tag = "";
//			if( (ct != null && (ct.match(/\.fit/i) || ct.match(/fits/))) ||
//					(cd != null && (cd.match(/\.fit/i) || cd.match(/fits/)))	){
//				//samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" + url + "\"); return false;'/></a>";
//				samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='resultPaneView.fireSendVoreportWithInfo(\"" + url + "\"); return false;'/></a>";
//
//				isFits = true;
//			}
//			else if( (ct != null && (ct.match(/\.xml/i) || ct.match(/\.voty/)|| ct.match(/\.votable/))) ||
//					(cd != null && (cd.match(/\.xml/i) || cd.match(/\.voty/)|| cd.match(/\.votable/)))){
//				isVotable = true;
//				samp_tag = "<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" + url + "\"); return false;'/></a>";
//			}
//			var dl_tag = "";
//			/*
//			 * Will be downloaded by the browser: no need to open a new tab
//			 */
//			if( (ce != null && (ce == 'gzip' || ce == 'zip')) || isFits ){
//				dl_tag = "<a class='" + dl_class + "' title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");'></a>";
//			} else {
//				dl_tag = "<a class='" + dl_class + "' title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");' target=blank></a>";
//			}
//
//			tdNode.html(
//					"<a class='dl_info' title='Get info about' href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>"
//					+ dl_tag 
//					+ dl_cart_tag
//					+ samp_tag );
//		}
//	});
//}