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
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while(k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };      
}
 if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
    'use strict';

    if (this == null) {
      throw new TypeError();
    }

    var n, k,
        t = Object(this),
        len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }

    n = len;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) {
        n = 0;
      }
      else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    for (k = n >= 0
          ? Math.min(n, len - 1)
          : len - Math.abs(n); k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

var BudgetHelpers = BudgetHelpers || {};  
var BudgetHelpers = {

  query: function(sql, callback) {  
    var sql = encodeURIComponent(sql);
    //console.log(queryStr.join(" "));
    $.ajax({
      url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+BudgetLib.FusionTableApiKey, 
      dataType: "jsonp"
    });
  },

  handleError: function(json) {
    if (json["error"] != undefined)
      console.log("Error in Fusion Table call: " + json["error"]["message"]);
  },
	
  //converts SQL query to URL
  getQuery: function(query) {
    //console.log('http://www.google.com/fusiontables/gvizdata?tq='  + encodeURIComponent(query));
    return query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + encodeURIComponent(query));
  },
  	
  //converts a Fusion Table json response in to an array for passing in to highcharts
  getDataAsArray: function(json) {
    var data = json["rows"][0]; 
    var dataArray = [];
    var lastItem = 0;
    for(var i=0; i<data.length; i++) { 
      dataArray[i] = +data[i];
      lastItem = i;
    }

    //For the most recent year or years, we usually don't have expenditures. 
    //By setting the last year to null when 0, Highcharts just truncates the line.
	//***MODIFICATION***
	lastNonzero = dataArray.map(function(i){return (i>0)?1:0}).lastIndexOf(1) //Find index last non-zero expenditure
	dataArray = dataArray.slice(0,lastNonzero+1).concat(dataArray.slice(lastNonzero+1).map(function(i){return null}));
    //if (dataArray[lastItem] == 0) dataArray[lastItem] = null;
    return dataArray;
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
  
  generateExpandedDeptRow: function(departmentId, department, description, linkToWebsite, departmentFund, controlOfficer) {
    if (linkToWebsite != '')
      linkToWebsite = "<a href='" + linkToWebsite + "'>Official&nbsp;website&nbsp;&raquo;</a>";
      
    if (controlOfficer != '')
      controlOfficer = "<br/>Control officer: " + BudgetHelpers.getAddressLink(BudgetLib.loadYear, "", BudgetHelpers.convertToQueryString(controlOfficer), controlOfficer + " &raquo;");
    
    return "\
      <tr class='expanded-content' id='department-" + departmentId + "-expanded'>\
        <td colspan='5'>\
          <div class='expanded-primary'>\
            <h2>" + department + "</h2>\
            <p>" + description + " " + linkToWebsite + "</p>\
            <p>\
              Fund: " + BudgetHelpers.getAddressLink(BudgetLib.loadYear, BudgetHelpers.convertToQueryString(departmentFund), "", departmentFund + " &raquo;") + "</a>\
              " + controlOfficer + "\
            </p>\
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
  getDataAsTable: function(json) {
    var rows = json["rows"];
    var cols = json["columns"];
    
    //concatenate the results into a string, you can build a table here
    var fusiontabledata = "<table><tr>";
    for(i = 0; i < cols.length; i++) {
      fusiontabledata += "<td>" + cols[i] + "</td>";
    }
    fusiontabledata += "</tr>";
    
    for(i = 0; i < rows.length; i++) {
    	fusiontabledata += "<tr>";
      for(j = 0; j < cols.length; j++) {
        fusiontabledata += "<td>" + rows[i][j] + "</td>";
      }
      fusiontabledata += "</tr>";
    }
    fusiontabledata += "</table>";  
    console.log(fusiontabledata);
  }
}