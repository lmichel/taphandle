#!/bin/bash
#
# Minifier 
# Laurent Michel 02/2014
#
# Merge all required JS file in one m
# Merge all required in one. 
# Using the minifierd resources speed the application startup and make it indepen,dant from jsresources
# Warning: All resources used by the CSS (image with relative paths or imoprted CSS) must be available in the min directory
# A Part of the resources are local to 3XMM and the others are copied from jsresources
#

##########################
# Script Resources
#########################      
outputDir="../WebContent/min/packed" # directory where both packed JS and CSS are stored 
packedCSS=$outputDir/packedCSS.css    # name of the file containing the packed CSS
packedJS=$outputDir/packedJS.js       # name of the file containing the packed JS
imageDir="../WebContent/images"      # Directory from where the 3XMM images must be copied 
imageOutput="../WebContent/min/images" # Directory where the 3XMM images must be copied 
workspaceDir="/home/michel/workspace"
#
# List of jsresources JS objects
# MVC template for names:
#    Files without a js suffix are related to the MVC pattern.
#    There are actually 3 files *_m/v/c.js 
#
js_array_org=("basics.js"
           "WebSamp"
           "KWConstraint"
           "AttachedData_v.js"
           "VizierKeywords_v.js"
           "OrderBy_v.js"
           "ConeSearch_v.js"
           "ConstList_v.js"
           "FieldList_v.js"
		   "Sorter_v.js"
           "DataLink"  
           "ConstQEditor" 
           "QueryTextEditor" 
           "Segment.js"
           "RegionEditor"
           "domain.js"
          )   
          
##########################
# Script Functions
#########################      
#
# Build the real list of jsresources JS files by applying the MVC template for names
#
js_basic_array=() 
for item in ${js_array_org[*]}
do
	if [[ "$item" == *.js ]]
	then
    	js_basic_array[${#js_basic_array[@]}]=$item	
	else
    	js_basic_array[${#js_basic_array[@]}]=$item'_m.js'
    	js_basic_array[${#js_basic_array[@]}]=$item'_v.js'
    	js_basic_array[${#js_basic_array[@]}]=$item'_c.js'
	fi
done

#
# function compileing a set of js files to the packed file
# The compiled files are stored in the global output dir
# USAGE: minifySet jsfiledir file1 file2 ....
# jsfiledir: dir where JS files are
#
js_array=() # list of packed js files
function minifySet(){
	inputDir=$1
	shift
	fileList=("$@")
	for item in "${fileList[@]}"
	do
		echo compiling $inputDir/${item} to $outputDir/${item}
		#
		# Closure compilation is commented whiole the validation phase
    	#java -jar compiler.jar --js $inputDir/${item} --js_output_file $outputDir/${item} || exit 1
    	cp $inputDir/${item}  $outputDir/${item} || exit 1
    	# Store an ordered list of minified files
    	js_array[${#js_array[@]}]=$item
	done
}
#
# merge all minified JS files within the  packed JS file
# Minified files are removed after to be merged
# a log message is appended ato the JS code to follow the loading pporcess in the console
#
function  pack() {
	rm -f $outputFile
	for item in "${js_array[@]}"
	do 
		echo pack $outputDir/$item to $packedJS
		cat $outputDir/$item >> $packedJS || exit 1
		echo "" >> $packedJS
		echo "console.log('=============== > " $item "');" >> $packedJS
		echo "" >> $packedJS
		rm $outputDir/$item
	done
}	
#
# merge a set CSS files within the  packed CSS file
# USAGE: packCSS cssfiledir file1 file2 ....
# cssfiledir: dir where CSS files are
#
function  packCSS() {
	inputDir=$1
	shift
	fileList=("$@")
	for item in "${fileList[@]}"
	do
		echo pack $inputDir/$item to $outputDir/packedCSS.css
		echo "/************  $inputDir/$item ********************/" >> $outputDir/packedCSS.css|
 		cat $inputDir/$item >> $outputDir/packedCSS.css|| exit 1
	done
}	

##########################
# Script Job
#########################      
rm -f  $outputDir/$packedCSS	
echo "=========== Pack CSS files"
pwd
packCSS "$workspaceDir/jsresources/WebContent/saadajsbasics/styleimports/themes/base/"\
     "jquery-ui.css"\
    "jquery.ui.accordion.css"\
    "jquery.ui.autocomplete.css"\
    "jquery.ui.button.css"\
    "jquery.ui.datepicker.css"\
    "jquery.ui.dialog.css"\
    "jquery.ui.progressbar.css"\
    "jquery.ui.resizable.css"\
    "jquery.ui.selectable.css"\
    "jquery.ui.slider.css"\
    "jquery.ui.tabs.css" \
    "jquery.ui.theme.css" 

    
packCSS "$workspaceDir/jsresources/WebContent/saadajsbasics/styleimports" \
    "layout-default-latest.css" \
	"datatable.css" \
	"simplemodal.css"\
	"aladin.min.css"
	
packCSS "$workspaceDir/jsresources/WebContent/saadajsbasics/styles"\
    "basics.css" \
    "domain.css" 

packCSS "../WebContent/styles/" \
    "global.css" \
    "form.css"
    
packCSS "../WebContent/styleimport/" \
    "jsonSuggest.css" 

echo "=========== Minify JS files"
rm -f $packedJS
minifySet "$workspaceDir/jsresources/WebContent/saadajsbasics/javascript"   \
    ${js_basic_array[@]} 

minifySet "$workspaceDir/jsresources/WebContent/saadajsbasics/jsimports/ui"    \
     "jquery-ui.js"
minifySet "$workspaceDir/jsresources/WebContent/saadajsbasics/jsimports"       \
    "jquery.simplemodal.js"\
    "jquery.alerts.js"\
    "jquery.dataTables.js"\
    "FixedHeader.js"\
    "jquery.prints.js"\
	"jquery.tooltip.js"\
	"jquery.form.js"\
	"aladin.min.js"
	

minifySet "../WebContent/jsimport"   \
     "jquery.jstree.js" \
     "jquery.jsonSuggest-2.js" \
     "jquery.jeditable.js" \
     "jquery.layout-latest.js" \
     "json2.js" 

minifySet "../WebContent/javascript"   \
				"formator.js" \
				"resultPaneModel.js"\
				"resultPaneView.js"\
				"resultPaneControler.js"\
				"nodeFilterModel.js"\
				"nodeFilterView.js"\
				"nodeFilterControler.js"\
                                 "tapModel.js"  \
                                "tapView.js"  \
                                "tapControler.js"  \
                                "jobModel.js"  \
                                "jobView.js"  \
                                "jobControler.js"  \
                                "jobDictionnary.js"  \
                                "cartView.js"  \
                                "cartControler.js"  \
                                "cartModel.js"  \
                                "zipjobModel.js"  \
                                "datatreeView.js"  \
                                "initFunctions.js"  \
                                "utils.js"  \
                                "ready.js"  \
                                "viewState.js"\
                                "resize.js"

echo "=========== Pack JS files"
pack 

echo "=========== Copy images"
cp $imageDir/*    $imageOutput"/" || exit 1

echo "=========== Packing is over"
exit

