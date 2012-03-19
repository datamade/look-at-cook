var BudgetHelpers = BudgetHelpers || {};
	
//converts SQL query to URL
BudgetHelpers.getQuery = function(query) {
  return query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + encodeURIComponent(query));
}
	
//converts a Fusion Table response in to an array for passing in to highcharts
BudgetHelpers.getDataAsArray = function(response) {
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

//for debugging - prints out data in a table
BudgetHelpers.getDataAsTable = function(response) {

  //for more information on the response object, see the documentation
  //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
  numRows = response.getDataTable().getNumberOfRows();
  numCols = response.getDataTable().getNumberOfColumns();
  
  //concatenate the results into a string, you can build a table here
  var fusiontabledata = "<table><tr>";
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
  console.log(fusiontabledata);
  //breakdownData += fusiontabledata;
  //updateTable();
}

BudgetHelpers.getAddressLink = function(year, fund, controlOfficer, title)
{
  var href = "/?year=" + year + "&amp;fund=" + fund + "&amp;controlOfficer=" + controlOfficer;
	return ("<a class='adr' href='" + href + "' rel='address:" + href + "'>" + title + "</a>");
}

//converts a text in to a URL slug
BudgetHelpers.convertToSlug = function(text)
{
  if (text == undefined) return '';
	return (text+'').replace(/ /g,'-').replace(/[^\w-]+/g,'');
}

//converts text to a formatted query string
BudgetHelpers.convertToQueryString = function(text)
{
	if (text == undefined) return '';
	return (text+'').replace(/\-+/g, '+').replace(/\s+/g, '+');
}

//converts a slug or query string in to readable text
BudgetHelpers.convertToPlainString = function(text)
{
  if (text == undefined) return '';
	return (text+'').replace(/\++/g, ' ').replace(/\-+/g, ' ');
}