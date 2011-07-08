	var fusionTableId = 1086289;
  	google.load('visualization', '1', {}); //using Google visulaization API to do Fusion Tables SQL calls
  	var breakdownData = "";
  	var appropTotalArray;
  	var expendTotalArray;
  	
  	function loadDefault() {
  		setTotalArrays();
  		getAllFundsForYear(2011, getDataAsBudgetTable);
  	}
  	
  	function setTotalArrays() {
  		getFundTotalArray('', true, updateAppropTotal);
  		getFundTotalArray('', false, updateExpendTotal);
  	}
  	  	
	function getFundTotalArray(fundName, isAppropriation, callback) {
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
		
		getQuery(myQuery).send(callback);
	}
	
	function getAllFundsForYear(year, callback) {		
		var myQuery = "SELECT Fund, SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures' FROM " + fusionTableId + " GROUP BY Fund";			
		getQuery(myQuery).send(callback);
	}
		
	function getQuery(myQuery) {
		//alert(myQuery);
		var queryText = encodeURIComponent(myQuery);
	  	return query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);
	}
	
	function updateAppropTotal(response) {
		appropTotalArray = getDataAsArray(response);
		updateMainChart();
	}
	
	function updateExpendTotal(response) {
		expendTotalArray = getDataAsArray(response);
		updateMainChart();
	}
	
	function getDataAsArray(response) {
	  numCols = response.getDataTable().getNumberOfColumns();
	  var fusiontabledata = new Array();
	  
	  for(j = 0; j < numCols; j++) {
	    fusiontabledata[j] = response.getDataTable().getValue(0, j);
	  }
	  
	  return fusiontabledata;
	}
	
	function getDataAsBudgetTable(response) {	
		numRows = response.getDataTable().getNumberOfRows();
		var fusiontabledata;
		for(i = 0; i < numRows; i++) {
		  fusiontabledata += "<tr>";
		  fusiontabledata += "<td><a href='#'>" + response.getDataTable().getValue(i, 0) + "</a></td>";
		  fusiontabledata += "<td class='num budgeted'>" + response.getDataTable().getValue(i, 1) + "</td>";
		  fusiontabledata += "<td class='num spent'>" + response.getDataTable().getValue(i, 2) + "</td>";
		  fusiontabledata += "<td><div class='bars'>";
		  fusiontabledata += "          <span class='budgeted outer'></span>";
		  fusiontabledata += "          <span class='spent inner'></span>";
		  fusiontabledata += "        </div></td>";
		  fusiontabledata += "</tr>";
		}
 
	  breakdownData = fusiontabledata;
	  updateTable();
	}
	
	//for debugging - prints out data in a table
	function getDataAsTable(response) {
	
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
	  breakdownData += fusiontabledata;
	  updateTable();
	}