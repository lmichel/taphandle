/**
  * Loads automatically all css scripts used by saadahsbasics
  * Files are loaded one by one keeping that wy the initial order.
  * That make sure not to  break dependencies or style rules overriding
  *
  * This class is a JS singleton.
  */
//Alix no packaging
AlixResourceLoader = function() {

        var services = {
                        localServer: "",
                        taphandle: "",
                        alix: "",
                        jsresources:"" 

        }

        /*
         * JS directories and files
         */
        var baseScriptDir = "";
        var javascriptDir = baseScriptDir + "";
        var local_js =[ "jsimport/jquery.jstree.js",
				"jsimport/jquery.jsonSuggest-2.js",
				"jsimport/jquery.jeditable.js",
				"jsimport/jquery.layout-latest.js", 
				"jsimport/json2.js",
				"javascript/formator.js", 
				"javascript/resultPaneModel.js",
				"javascript/resultPaneView.js",
				"javascript/resultPaneControler.js",
				"javascript/nodeFilterModel.js",
				"javascript/nodeFilterView.js",
				"javascript/nodeFilterControler.js"
				/*,"javascript/kwconstraintModel.js"  
				 ,"javascript/kwconstraintView.js"  
				 ,"javascript/kwconstraintControler.js"  
				 */
				 
				, "javascript/tapModel.js", "javascript/tapView.js",
				"javascript/tapControler.js", "javascript/jobModel.js",
				"javascript/jobView.js", "javascript/jobControler.js",
				"javascript/jobDictionnary.js", "javascript/cartView.js",
				"javascript/cartControler.js", "javascript/cartModel.js",
				"javascript/zipjobModel.js", "javascript/datatreeView.js", 
				"javascript/upload.js",
				"javascript/initFunctions.js", "javascript/utils.js",
				"javascript/ready.js", "javascript/viewState.js",
				"javascript/resize.js","javascript/Region.js"];
		
		var local_min_js = ["basics.js"
	                    , "WebSamp"
	                    , "DataLink"
	                    , "domain.js"];


        var alix_imported_js = [
 
              "jsimports/spectrum.js"
             ,"jsimports/Alix_Logger.js"
             ,"jsimports/jquery-ui-1.12.1/jquery-ui.js"
             ,"jsimports/jquery-ui-1.12.1/jquery.ui.dialog.js"
             ,"jsimports/jqueryJSStuff/jquery.simplemodal.js"
             ,"jsimports/jqueryJSStuff//jquery.alerts.js"
             ,"jsimports/jqueryJSStuff//jquery.dataTables.js"
             ,"jsimports/jqueryJSStuff//FixedHeader.js"
             ,"jsimports/jqueryJSStuff//jquery.prints.js"
             ,"jsimports/jqueryJSStuff//jquery.tooltip.js"
             ,"jsimports/jqueryJSStuff//jquery.form.js"
             ,"jsimports/jqueryJSStuff//jquery-migrate-1.4.1.js"
             ,"jsimports/excanvas.js"
             ,"jsimports/jquery.flot.js"
             ,"jsimports/jquery.flot.axislabels.js"
             ,"jsimports/jquery.flot.errorbars.js"
             ,"jsimports/jquery.flot.navigate.js"
             ,"jsimports/jquery.flot.symbol.js"
             ,"jsimports/jquery.form.js"
                         ];

        var alix_js = [

                 "aladinLite/aladin.js"
                 //,"javascript/Segment.js"
                 ,"javascript/AladinUpdate.js"
                 ,"javascript/SRegion.js"
                 ,"javascript/Segment.js"
                 ,"javascript/AstroCoo.js"
                 ,"javascript/LibraryMap.js"
                 ,"javascript/LibraryCatalog.js"
                 ,"javascript/MasterResource.js"
                 ,"javascript/AladinLiteView.js"
                 ,"javascript/AladinLite_v.js"
                 ,"javascript/AladinLite_c.js"
                 ,"javascript/Historique_m.js"
                 ,"javascript/Historique_v.js" 
                 ,"javascript/RegionEditor_v.js"
                 ,"javascript/RegionEditor_m.js"
                 ,"javascript/RegionEditor_c.js"
                 ,"javascript/HipsSelector_m.js"
                 ,"javascript/HipsSelector_v.js"
                 ,"javascript/SwarmDynamicFilter.js"
                 ,"javascript/ConfigureALiX.js"
                 ,"javascript/VizierCatalog.js"
                 ,"javascript/MessageBox.js"
                 ,"jsimports/spectrum.js"
                 ,"javascript/Alix_Modalinfo.js"
                 ,"javascript/Alix_ModalResult.js"
                 ,"javascript/Alix_CustomDataTable.js"
                 ,"javascript/Alix_Out.js"
                 ,"javascript/Alix_PageLocation.js"
                 ,"javascript/Alix_Printer.js"
                 ,"javascript/Alix_Processing.js"
                 ,"javascript/Alix_SkyGeometry.js"
                 ,"javascript/SimbadCatalog.js"
				 ,"javascript/alixAPI.js"
                   ];

        var jsresourcesScriptDir = "saadajsbasics/javascript/";
        var imp_jsresources_js = [
                "basics.js"
                 ,"domain.js"
          ,"WebSamp"
         , "KWConstraint"
         , "AttachedData_v.js", "VizierKeywords_v.js","OrderBy_v.js", "ConeSearch_v.js", "ConstList_v.js", "FieldList_v.js"
	     , "Sorter_v.js"
         , "DataLink"
         , "QueryTextEditor"
         , "ConstQEditor"
         , "Segment.js"
       //  , "RegionEditor" //avoid the collision with the regioneditor_mvc in alix
         , "flotmosaic.js"
         , "FitFieldList_mVc.js"
         , "FitQEditor_m.js"
         , "FitQEditor_v.js"
         , "FitPatternQEditor_v.js"
         , "FitPatternQEditor_m.js"
         , "FitKWConstraint_m.js"
         , "FitKWConstraint_v.js"
         , "FitAttachedPatterns_v.js"
         , "FitBestModelAttachedPattern_v.js"
         , "FitBetterModelAttachedPattern_v.js"
         , "FitOrderModelAttachedPattern_v.js"

         ];
        var js = new Array();  // global list of JS to load

        /*
         * CSS directories and files
         */
        var styleDir        = "styles";
        var styleimportsDir = "styleimports";

        
		var local_css  = ["styles/global.css"
	                  ,"styles/form.css"
						,"styles/home.css"
						,"styles/tap.css"];

        var alix_imported_css  = [
                    "packager/webpack/public/style_bundle.css"
                   ,"aladinLite/aladin.css"
                   ,"styles/aladinliteX.css"
              ];

        var import_css = [
                //"../min/packed/packedCSS.css"//make it loaded before the aladinliteX.css to make sure the hips_panel in the ringht place
                // "/xcalix/" + styleimportsDir + "/foundationicon/foundation-icons.css"
               // ,"/xcalix/" + styleimportsDir + "/globalmodule.css"
              //  ,"/xcalix/" + styleimportsDir + "/datatable.css"
             //   ,"/xcalix/" + styleimportsDir + "/PlasticButton.css"
					
                    
					 
					];
        var imp_jsresources_css = [
                "saadajsbasics/styles/basics.css"
         		   ,"saadajsbasics/styles/domain.css"
				   ,"saadajsbasics/styleimports/themes/base/jquery.ui.all.css"
	               , "saadajsbasics/styleimports/layout-default-latest.css"
	               , "saadajsbasics/styleimports/datatable.css"
	               , "saadajsbasics/styleimports/simplemodal.css"
	               , "saadajsbasics/styleimports/aladin.min.css"
	               , "saadajsbasics/styleimports/bootstrap/bootstrap.css"
	               , "saadajsbasics/styleimports/bootstrap/bootstrap.css.map"
         ];

        var css = new Array();// global list of CSS to load
        var CssOver = false; // true when all CSS are loaded (can start JS loading)

        {
                var protocol = location.protocol;
                var domain = location.hostname;
                var port = location.port;

                let root_url = protocol + "//" + domain
                if( port ){
                        root_url += ":" + port
                }
                services.localServer =  root_url + "/";
                //services.taphandle =  services.localServer + "4xmmdr9/taphandle/";
                //services.alix =  protocol + "//" + domain + ":89/alix/";
                services.alix =  protocol + "//" + domain + "/alix/";
                services.jsresources =  services.localServer + "jsresources/";

        }


		var checkBaseUrl = function() {
				/*
				 * Check if saadajsbasics resources are installed locally
				 */
				baseUrl = "http://obas-stg-c11:8080/jsresources/";
				$.ajax({
					url: baseUrl + '/saadajsbasics/javascript/basics.js',
					async: false, 
					dataType: "text",
					error: function(data) {
						baseUrl = "http://obsas-dev-lm:8888/jsresources/saadajsbasics";
						console.log("Try " + baseUrl + " as jsresource base URL");
						$.ajax({
							url: baseUrl + 'saadajsbasics/loader.js',
							async: false, 
							dataType: "text",
							error: function(data) {
								baseUrl = "./";
								console.log("Try " + baseUrl + " as jsresource base URL");					
								$.ajax({
									url: 'saadajsbasics/loader.js',
									async: false, 
									dataType: "text",
									error: function(data) {					
										baseUrl = "http://saada.unistra.fr/jsresources/";
										console.log("Try " + baseUrl + " as jsresource base URL");
									},
									success: function() {
										console.log("Take " + baseUrl + " as jsresource base URL");
									}   
								});						
							} ,
							success: function() {
								console.log("Take " + baseUrl + " as jsresource base URL");
							}                  
						});
					}   ,
					success: function() {
						console.log("Take ./ as jsresource base URL");
					}
				});
				console.log("jsresources will be taken from " + baseUrl);
			};


        /*
         * Look at the best node serving the JS/CSS resources
         */
        /**
         * Recursive function loading the first script of the list
         */
        var loadNextScript = function() {
                var script = document.createElement("script");
                var head = document.getElementsByTagName('HEAD').item(0);
                script.onload = script.onreadystatechange = function() {
                        console.log(js[0] + " script loaded " + CssOver);
                        js.shift();
                        if( js.length > 0 ) loadNextScript();
                };
                script.src = js[0];
                script.type = "text/javascript";
                head.appendChild( script);
        };
        /**
         * Recursive function loading the first CSS of the list
         */
        var loadNextCss = function() {
                var  href = css[0];
                $.ajax({
                        url: href,
                        dataType: 'text',
                        success: function(){
                                $('<link rel="stylesheet" type="text/css" href="'+href+'" />').appendTo("head");
                                console.log(href + " CSS loaded OK");
                                css.shift();
                                if( css.length > 0 ) loadNextCss();
                                else {
                                CssOver = true;
                                }
                        },
                        error : function(jqXHR, textStatus,errorThrown) {
                                console.log("Error loading " +  href + " "  + textStatus);

                        }
                });

        };

        /**
         * Start to load JS scripts after the CSS loading is completed
         */
        var loadScripts = function() {
                if( !CssOver) {
                        setTimeout(function() {loadScripts();}, 100);
                        return;
                }       else { 
                        loadNextScript();
                }
        };

        /***************
         * externalscripts: array of scripts to be loaded after jsresources
         */
        /**
         * Stores the list of user JS scripts to load
         * and build the global list of resource to load
         */
        var setScripts = function() {
                for( i=0 ; i<alix_imported_js.length ; i++ ) {
                        console.log("4 " + services.alix  + alix_imported_js[i])
                        js.push(services.alix + alix_imported_js[i]);
                }

                for( i=0 ; i<alix_js.length ; i++ ) {
                        let jsf = services.alix + alix_js[i];
                        console.log("2 " + jsf)
                        js.push(jsf);
                }


                for( i=0 ; i<imp_jsresources_js.length ; i++ ) {
                        let jsf = services.jsresources + jsresourcesScriptDir + imp_jsresources_js[i];
                        console.log("3 " + jsf)
                        if( ! jsf.match(/.*\.js/)  ){
                                js.push(jsf + "_m.js");
                                js.push(jsf + "_v.js");
                                js.push(jsf + "_c.js");
                        } else {

                                js.push(jsf);

                        }
                }

                for( var i=0 ; i<local_js.length ; i++ ) {
                        let jsf =  services.taphandle + javascriptDir + local_js[i];
                        console.log("1 " + jsf)
                        if( ! jsf.match(/.*\.js/)  ){
                                js.push(jsf + "_m.js");
                                js.push(jsf + "_v.js");
                                js.push(jsf + "_c.js");
                        } else {

                                js.push(jsf);

                        }
                }
                        }; 


var setMinScripts = function(externalscripts) {
		for( var i=0 ; i<local_min_js.length ; i++ ) {
			var jsf =  baseUrl + baseScriptDir + local_min_js[i];
			if( ! jsf.match(/.*\.js/)  ){
				js.push(jsf + "_m.js");
				js.push(jsf + "_v.js");
				js.push(jsf + "_c.js");
			} else {
				console.log(jsf);
				js.push(jsf);

			}
		}
		for( var i=0 ; i<imp_js.length ; i++ ) {
			js.push(baseUrl + imp_js[i]);
		}
		js.push.apply(js, externalscripts);
		loadNextScript();
	};
    /**
         * Stores the list of client CSS files to load
         * and build the global list of resource to load
         */
        var setCss = function() {
	
		

                for( var i=0 ; i<local_css.length ; i++ ) {
                       css.push(services.taphandle  + local_css[i]);
						//css.push(baseUrl  + styleDir + local_css[i]);
                        console.log("1 append " + services.taphandle  + local_css[i])
                }
                for( i=0 ; i<alix_imported_css.length ; i++ ) {
                        css.push(services.alix + alix_imported_css[i]);
                        console.log("2 append " + services.alix + alix_imported_css[i])
                }

                for( i=0 ; i<imp_jsresources_css.length ; i++ ) {
                        css.push(services.jsresources + imp_jsresources_css[i]);
                        console.log("3 append " + services.jsresources + imp_jsresources_css[i])
                }       
                for( i=0 ; i<import_css.length ; i++ ) {
							//css.push(baseUrl + styleimportsDir+ import_css[i]);
                        css.push(services.taphandle + import_css[i]);
                        console.log("4 append  " + services.taphandle + import_css[i])
                }
				
                //js.push.apply(css, externalcss);
                console.log(css)
        };
        /**
         * Load all resources: must be invoked from the HTML page
         */
        var loadAll = function() {
                loadNextCss();
                loadScripts();
        };

   

        var jss = {};
		jss.checkBaseUrl = checkBaseUrl;
        jss.loadAll = loadAll;
        jss.setScripts = setScripts;
		jss.setMinScripts = setMinScripts;
        jss.setCss = setCss;
		
        return jss;
}();


