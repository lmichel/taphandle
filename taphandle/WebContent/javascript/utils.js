/*
 * Various utility routines standing out of any MVC 
 */

function setTitlePath(dataTreePath) {
	Out.info("title " + dataTreePath);
	var job = (dataTreePath.jobid == null)? "": '&gt;'+ dataTreePath.jobid;
	$('#titlepath').html(dataTreePath.nodekey + '&gt;' + dataTreePath.schema + '&gt;'+ dataTreePath.table + job);
}

function getQLimit() {
	var limit = 10;
	if( $("#qlimit").val().match(/^[0-9]*$/) ) {
		limit = $("#qlimit").val();
	}
	return limit;
}

function switchArrow(id) {
	var image = $('#'+id+'').find('img').attr('src');
	if (image == 'images/tdown.png') {
		$('#'+id+'').find('img').attr('src', 'images/tright.png');
	} else if (image == 'images/tright.png') {
		$('#'+id+'').find('img').attr('src', 'images/tdown.png');
	}
}

/*
 * move to saadajsbasic
 *
function quoteTableName(tableName){
	var regex = /([^.]*)\.(.*)/;
	var results = regex.exec(tableName);
	var table, schema;
	if(!results){
		table = tableName;
		schema = "";
	} else if( results.length == 2 ) {
		table = results[1]; 
		schema = "";

	} else  {
		table =  results[2];  
		schema = results[1] + ".";
	}
	if( table.match(/^[a-zA-Z0-9][a-zA-Z0-9_]*$/ ) ){
		return schema + table;
	} else {
		return schema + '"' + table +'"';
	}
	*
}*/
