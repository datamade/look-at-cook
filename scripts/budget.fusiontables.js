	var fusionTableId = 1086289;
  	google.load('visualization', '1', {}); //using Google visulaization API to do Fusion Tables SQL calls
  	var returnedData = "";
  	var appropTotalArray = "";
  	var expendTotalArray = "";
  	
  	function setTotalArrays() {
  		getFundTotalArray('', true);
  		getFundTotalArray('', false);
  	}
  	
	function getFundTotalArray(fundName, isAppropriation) {
		var typeStr = "Expenditures";
		if (isAppropriation == true) 
			typeStr = "Appropriations";
		
		var myQuery = "SELECT ";
		var year = 1993;
		while (year <= 2011)
		{
			myQuery += "SUM('" + typeStr + " " + year + "') AS '" + year + "', ";
			year++;
		}
		myQuery = myQuery.slice(0,myQuery.length-2);  
		myQuery += " FROM " + fusionTableId;
		if (fundName != '')
			myQuery += " WHERE 'Fund' = '" + fundName + "'";
		
		if (isAppropriation == true)
			getQuery(myQuery).send(updateAppropTotal);
		else
			getQuery(myQuery).send(updateExpendTotal);
	}
	
	function getFundTotalForYear(fundName, year, isAppropriation) {
		var typeStr = "Expenditures";
		if (isAppropriation) 
			typeStr = "Appropriations";
		
		var myQuery = "SELECT SUM('" + typeStr + " " + year + "') AS '" + year + "' FROM " + fusionTableId;
		if (fundName != '')
			myQuery += " WHERE 'Fund' = '" + fundName + "'";
			
		getQuery(myQuery).send(getDataAsCsv);
	}
	
	function getQuery(myQuery) {
		//alert(myQuery);
		var queryText = encodeURIComponent(myQuery);
	  	return query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
	  	//query.send(getDataAsTable);
	}
	
	function updateAppropTotal(response) {
		appropTotalArray = getDataAsArray(response);
		updateDisplay();
	}
	
	function updateExpendTotal(response) {
		expendTotalArray = getDataAsArray(response);
		updateDisplay();
	}
	
	//define callback function, this is called when the results are returned
	function getDataAsArray(response) {
	
	  //for more information on the response object, see the documentation
	  //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
	  numRows = response.getDataTable().getNumberOfRows();
	  numCols = response.getDataTable().getNumberOfColumns();
	  
	  //concatenate the results into a string, you can build a table here
	  var fusiontabledata = new Array();
	  
	  for(j = 0; j < numCols; j++) {
	    fusiontabledata[j] = response.getDataTable().getValue(0, j);
	  }
	  
	  return fusiontabledata;
	}
	
	//for debugging - prints out data in a table
	function getDataAsTable(response, year) {
	
	  //for more information on the response object, see the documentation
	  //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
	  numRows = response.getDataTable().getNumberOfRows();
	  numCols = response.getDataTable().getNumberOfColumns();
	  
	  //concatenate the results into a string, you can build a table here
	  fusiontabledata = "<table><tr>";
	  for(i = 0; i < numCols; i++) {
	    fusiontabledata += "<td>" + response.getDataTable().getColumnLabel(i) + "</td>";
	  }
	  fusiontabledata += "</tr>";
	  
	  for(i = 0; i < numRows; i++) {
	  	fusiontabledata += "<tr>";
	    for(j = 0; j < numCols; j++) {
	      fusiontabledata += "<td>" + response.getDataTable().getValue(i, j) + "</td>";
	    }
	    fusiontabledata += "</tr>";
	  }
	  fusiontabledata += "</table>";  
	  //alert(fusiontabledata);
	  returnedData += fusiontabledata;
	  updateDisplay();
	}