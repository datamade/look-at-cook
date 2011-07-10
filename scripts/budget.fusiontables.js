	var fusionTableId = 1113478;
  	google.load('visualization', '1', {}); //using Google visulaization API to do Fusion Tables SQL calls
  	var breakdownData = "";
  	var breakdownTable;
  	var appropTotalArray;
  	var expendTotalArray;
  	 	
  	function setTotalArrays() {
  		getFundTotalArray('', true, updateAppropTotal);
  		getFundTotalArray('', false, updateExpendTotal);
  	}
  	
  	//gets Fund totals per year for highcharts  	
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
	
	//returns all funds budgeted/spent totals for given year
	function getAllFundsForYear(year, callback) {		
		var myQuery = "SELECT Fund, SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', Fund AS '" + year + "' FROM " + fusionTableId + " GROUP BY Fund";			
		getQuery(myQuery).send(callback);
	}
	
	//for expanded row details - have to calculate the sums by hand ... arg
	function getFundInfo(fund, callback) {		
		var myQuery = "SELECT Fund, Department, 'Control Officer' FROM " + fusionTableId + " WHERE Fund = '" + fund + "' ORDER BY 'Control Officer'";			
		getQuery(myQuery).send(callback);
	}
	
	//returns all funds budgeted/spent totals for given year
	function getDepartmentsForFund(fund, year, callback) {		
		var myQuery = "SELECT Department, SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', Department AS '" + year + "'  FROM " + fusionTableId + " WHERE Fund = '" + fund + "' GROUP BY Department";			
		getQuery(myQuery).send(callback);
	}
	
	//converts SQL query to URL	
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
	
	//returns a 1D array
	function getDataAsArray(response) {
	  numCols = response.getDataTable().getNumberOfColumns();
	  var fusiontabledata = new Array();
	  
	  for(j = 0; j < numCols; j++) {
		if (response.getDataTable().getValue(0, j) == "0")
			fusiontabledata[j] = null;
		else
			fusiontabledata[j] = response.getDataTable().getValue(0, j);
	  }
	  
	  return fusiontabledata;
	}
	
	//builds out budget breakdown table
	function getDataAsBudgetTable(response) {	
		numRows = response.getDataTable().getNumberOfRows();
		var fusiontabledata;
		for(i = 0; i < numRows; i++) {
		  var fund = response.getDataTable().getValue(i, 0);
	  	  var year = response.getDataTable().getColumnLabel(3);
	  	  var budgeted = response.getDataTable().getValue(i, 1);
	  	  var spent = response.getDataTable().getValue(i, 2);
		  if (budgeted != 0 || spent != 0)
		  {
			  fusiontabledata += "<tr>";
			  fusiontabledata += "<td><a href='/?year=" + year + "&amp;fund=" + fund.replace(/\s+/g, '+') + "' rel='address:/?year=" + year + "&amp;fund=" + fund.replace(/\s+/g, '+') + "'>" + fund + "</a></td>";
			  fusiontabledata += "<td class='num budgeted'>" + budgeted + "</td>";
			  fusiontabledata += "<td class='num spent'>" + spent + "</td>";
			  fusiontabledata += "<td><div class='bars'>";
			  fusiontabledata += "          <span class='budgeted outer'></span>";
			  fusiontabledata += "          <span class='spent inner'></span>";
			  fusiontabledata += "        </div></td>";
			  fusiontabledata += "</tr>";
		  }
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