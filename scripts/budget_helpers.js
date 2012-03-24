/*!
 * Look at Cook Budget Helpers library
 * http://lookatcook.com/
 *
 * Copyright 2012, Derek Eder and Nick Rougeux
 * Licensed under the MIT license.
 * https://github.com/open-city/look-at-cook/wiki/License
 *
 * Date: 3/24/2012
 *
 * Helpers called by BudgetLib
 * 
 */

var BudgetHelpers = {
	
  //converts SQL query to URL
  getQuery: function(query) {
    return query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + encodeURIComponent(query));
  },
  	
  //converts a Fusion Table response in to an array for passing in to highcharts
  getDataAsArray: function(response) {
    numCols = response.getDataTable().getNumberOfColumns();
    var fusiontabledata = new Array();
    
    for(j = 0; j < numCols; j++) {
      if (response.getDataTable().getValue(0, j) == "0")
        fusiontabledata[j] = null;
      else
        fusiontabledata[j] = response.getDataTable().getValue(0, j);
    }
    return fusiontabledata;
  },
   
  highChartsFormatAmount: function(value) {
    if (value >= 1000000000)
      return "$" + value / 1000000000 + "B";
    else if (value >= 1000000)
      return "$" + value / 1000000 + "M";
    else
      return "$" + value;
  },
  
  getAddressLink: function(year, fund, controlOfficer, title) {
    var href = "/?year=" + year + "&amp;fund=" + fund + "&amp;controlOfficer=" + controlOfficer;
  	return ("<a class='adr' href='" + href + "' rel='address:" + href + "'>" + title + "</a>");
  },
  
  generateTableRow: function(rowId, detailLoadFunction, rowName, budgeted, spent) {
    return "\
      <tr id='" + rowId + "'>\
        <td>\
        <a onclick='" + detailLoadFunction + "'><img class='budget-expand-img' src='images/expand.png' /></a>&nbsp;<a onclick='" + detailLoadFunction + "'>" + rowName + "</a>\
        </td>\
        <td class='num budgeted'>" + budgeted + "</td>\
        <td class='num spent'>" + spent + "</td>\
        <td>\
          <div class='bars'>\
            <span class='budgeted outer'></span>\
            <span class='spent inner'></span>\
          </div>\
        </td>\
      </tr>";
  },
  
  generateExpandedRow: function(itemId, type) {
    var breakdownLink;
    
    if (type == 'fund')
      breakdownLink = BudgetHelpers.getAddressLink(BudgetLib.loadYear, BudgetHelpers.convertToQueryString(itemId), "", "Breakdown by department&nbsp;&raquo;");
    else
      breakdownLink = BudgetHelpers.getAddressLink(BudgetLib.loadYear, "", BudgetHelpers.convertToQueryString(itemId), "Breakdown by department&nbsp;&raquo;");
      
    return "\
      <tr class='expanded-content' id='" + itemId + "-expanded'>\
        <td colspan='5'>\
          <div class='expanded-primary'>\
            <h2>" + BudgetHelpers.convertToPlainString(itemId) + "</h2>\
            <p id='expanded-description'></p>\
            <ul class='stats'>\
              <li>" + breakdownLink + "</li>\
            </ul>\
            </div>\
            <div class='expanded-secondary'>\
            <div class='sparkline' id='selected-chart'></div>\
            <ul class='stats'>\
              <li id='sparkline-budgeted'></li>\
              <li id='sparkline-spent'></li>\
            </ul>\
          </div>\
        </td>\
      </tr>";
  },
  
  //converts a text in to a URL slug
  convertToSlug: function(text) {
    if (text == undefined) return '';
  	return (text+'').replace(/ /g,'-').replace(/[^\w-]+/g,'');
  },
  
  //converts text to a formatted query string
  convertToQueryString: function(text) {
  	if (text == undefined) return '';
  	return (text+'').replace(/\-+/g, '+').replace(/\s+/g, '+');
  },
  
  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return (text+'').replace(/\++/g, ' ').replace(/\-+/g, ' ');
  },
  
  //NOT USED for debugging - prints out data in a table
  getDataAsTable: function(response) {
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
  }
}