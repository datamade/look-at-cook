/*!
 * Look at Cook Budget Display library
 * http://lookatcook.com/
 *
 * Copyright 2012, Derek Eder and Nick Rougeux
 * Licensed under the MIT license.
 * https://github.com/open-city/look-at-cook/wiki/License
 *
 * Date: 3/24/2012
 *
 * This is where all the 'magic' happens. jQuery address detects changes in the URL, and 
 * calls the 'BudgetLib.updateDisplay' function which displays the appropriate data for that view.
 * 
 * Data is stored in Google Fusion tables, and fetches it using the Google visualization API
 * 
 * For display, the data is passed to Highcharts, another javascript library that specializes 
 * in graphs, and an HTML table which displays the budget broken down by department.
 * 
 * Every fund, control officer or department that is clicked updates the URL query string using 
 * jQuery Address and the page loads the data dynamically.
 * 
 * Storing all of our data in Google Fusion Tables. For this visualization, I split it up in to 
 * 3 tables
 */

var BudgetLib = BudgetLib || {};  
var BudgetLib = {

  //IDs used to reference Fusion Tables, where we store our data
  FusionTableApiKey: "AIzaSyDgYMq5VzeWQdYNpvYfP0W3NuCKYOAB5_Y",
  BUDGET_TABLE_ID: "1ZJJvlYCYTC1DIgp_tkJKEAs9l0sdO7J4kF8Gv9Y", //main budget table with expenditures/appropriations per department per year
  FUND_DESCRIPTION_TABLE_ID: "1DVnzs1tOFrVxrf6_jRFeXUe7b6lDYd5jh309Up4",
  OFFICER_DESCRIPTION_TABLE_ID: "1uSDhUpVbk3c7m0E7iT87LP8GfPk6vnczh-y64sI",
  
  title: "Cook County Budget",
  startYear: 1993,
  endYear: 2012,
  loadYear: 2012, //viewing year
  fundView: "", //viewing fund
  officerView: "", //viewing control officer
  viewByOfficer: false, //flag to switch between department and control officer view
  arraysLoaded: 0,

  //-------------front end display functions-------------------
  
  //primary load for graph and table
  updateDisplay: function(viewMode, year, fund, officer, externalLoad) {
    //load in values and update internal variables
    var viewChanged = false;
    if (BudgetLib.fundView != BudgetHelpers.convertToPlainString(fund) || BudgetLib.officerView != BudgetHelpers.convertToPlainString(officer))
    viewChanged = true;
        
    if (viewMode != null && viewMode == "officer") BudgetLib.viewByOfficer = true;
    else BudgetLib.viewByOfficer = false;
    
    if (fund != null && fund != "") BudgetLib.fundView = BudgetHelpers.convertToPlainString(fund);
    else BudgetLib.fundView = '';
      
    if (officer != null && officer != "") BudgetLib.officerView = BudgetHelpers.convertToPlainString(officer);
    else BudgetLib.officerView = '';
    
    if (year != null && year != "") BudgetLib.loadYear = year;
  
    //show fund view
    if (BudgetLib.fundView != ""){
      if (viewChanged || externalLoad) {
        window.scrollTo(0, 0);
        BudgetQueries.getTotalArray(BudgetLib.fundView, 'Fund', true, "BudgetLib.updateAppropTotal");
        BudgetQueries.getTotalArray(BudgetLib.fundView, 'Fund', false, "BudgetLib.updateExpendTotal");
      }
      
      BudgetQueries.getDepartments(BudgetLib.fundView, 'Fund', BudgetLib.loadYear, "BudgetLib.getDataAsBudgetTable");
      BudgetLib.updateHeader(BudgetLib.fundView, 'Department');
      BudgetQueries.getTotalsForYear(BudgetLib.fundView, 'Fund', BudgetLib.loadYear, "BudgetLib.updateScorecard");
      BudgetQueries.getFundDescription(BudgetLib.fundView, "BudgetLib.updateScorecardDescription");
    } 
    else if (BudgetLib.officerView != ""){ //show control officer view
      if (viewChanged || externalLoad) {
        window.scrollTo(0, 0);
        BudgetQueries.getTotalArray(BudgetLib.officerView, 'Control Officer', true, "BudgetLib.updateAppropTotal");
        BudgetQueries.getTotalArray(BudgetLib.officerView, 'Control Officer', false, "BudgetLib.updateExpendTotal");
      }
      
      BudgetQueries.getDepartments(BudgetLib.officerView, 'Control Officer', BudgetLib.loadYear, "BudgetLib.getDataAsBudgetTable");
      BudgetLib.updateHeader(BudgetLib.officerView, 'Department');
      BudgetQueries.getTotalsForYear(BudgetLib.officerView, 'Control Officer', BudgetLib.loadYear, "BudgetLib.updateScorecard");
      BudgetQueries.getControlOfficerDescription(BudgetLib.officerView, "BudgetLib.updateScorecardDescription");
    }
    else { //load default view
      if (viewChanged || externalLoad) {
        BudgetQueries.getTotalArray('', '', true, "BudgetLib.updateAppropTotal");
        BudgetQueries.getTotalArray('', '', false, "BudgetLib.updateExpendTotal");
      }
          
      if (BudgetLib.viewByOfficer) {
        BudgetQueries.getAllControlOfficersForYear(BudgetLib.loadYear, "BudgetLib.getDataAsBudgetTable");
        $("#breakdown-nav").html("\
          <ul>\
            <li><a href='#' rel='address:/?year=" + BudgetLib.loadYear + "&viewMode=fund'>Where's it going?</a></li>\
            <li class='current'>Who controls it?</li>\
          </ul>\
          <div class='clear'></div>");
        $('#breakdown-item-title span').html('Control Officer');
      }
      else {
        BudgetQueries.getAllFundsForYear(BudgetLib.loadYear, "BudgetLib.getDataAsBudgetTable");
        $("#breakdown-nav").html("\
          <ul>\
            <li class='current'>Where's it going?</li>\
            <li><a href='#' rel='address:/?year=" + BudgetLib.loadYear + "&viewMode=officer'>Who controls it?</a></li>\
          </ul>\
        <div class='clear'></div>");
        $('#breakdown-item-title span').html('Fund');
      }
      $('#breakdown-nav a').address();
      
      BudgetLib.updateHeader(BudgetLib.title, 'Fund');
      BudgetQueries.getTotalsForYear('', '', BudgetLib.loadYear, "BudgetLib.updateScorecard");
      BudgetQueries.getFundDescription(BudgetLib.fundView, "BudgetLib.updateScorecardDescription");
    }
    $('#breadcrumbs a').address();
  },  
  
  updateHeader: function(view, subtype){
    $('h1').html(view);
    if (view != BudgetLib.title) {
      $('#breadcrumbs').html("<a href='/?year=" + BudgetLib.loadYear + "' rel='address:/?year=" + BudgetLib.loadYear + "'>&laquo back to " + BudgetLib.title + "</a>");
      $("#breakdown-nav").html("");
    }
    else
      $('#breadcrumbs').html("");
    
    $('#secondary-title').html(BudgetLib.loadYear + ' ' + view);
    $('#breakdown-item-title span').html(subtype);
  },
    
  //displays secondary datatables fund/department listing
  updateTable: function() {
    $('#breakdown').fadeOut('fast', function(){
      if (BudgetLib.breakdownTable != null) BudgetLib.breakdownTable.fnDestroy();
      
      $('#breakdown tbody').children().remove();
      $('#breakdown > tbody:last').append(BudgetLib.breakdownData);
      
      var maxArray = new Array();
      $('.budgeted.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      $('.spent.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      
      var maxBudgeted = Math.max.apply( Math, maxArray );
      if (maxBudgeted > 0) {
        $('.budgeted.num').each(function(){
          $(this).siblings().children().children('.budgeted.outer').width((($(this).html()/maxBudgeted) * 100) + '%');
        });
        $('.spent.num').each(function(){
          $(this).siblings().children().children('.spent.inner').width((($(this).html()/maxBudgeted) * 100) + '%');
        });
      }
      $('.budgeted.num').formatCurrency();
      $('.spent.num').formatCurrency();
      
      $('.adr').address(); //after adding the table rows, initialize the address plugin on all the links
      
      BudgetLib.breakdownTable = $("#breakdown").dataTable({
        "aaSorting": [[1, "desc"]],
        "aoColumns": [
          null,
          { "sType": "currency" },
          { "sType": "currency" },
          { "bSortable": false }
        ],
        "bFilter": false,
        "bInfo": false,
        "bPaginate": false
      });
    }).fadeIn('fast');
  },
  
  //show/hide expanded detail for a clicked row
  updateDetail: function(itemId, detail) {
    if (BudgetLib.sparkChart != null) {
      BudgetLib.sparkChart.destroy();
      BudgetLib.sparkChart = null;
    }
    
    if ($('#' + itemId + '-expanded').length == 0) {
      $('.budget-expand-img').attr('src', 'images/expand.png');
      $('#breakdown .expanded-content').remove();
      $('#breakdown tr').removeClass('expanded-head');
      $('#' + itemId + ' .budget-expand-img').attr('src', 'images/collapse.png');
      $(detail).insertAfter($('#' + itemId));
      $('#' + itemId).addClass('expanded-head');
    }
    else {
      $('.budget-expand-img').attr('src', 'images/expand.png');
      $('#breakdown .expanded-content').remove();
      $('#breakdown tr').removeClass('expanded-head');
    }
  },

  //----------display callback functions----------------
  
  //these all work by being called (callback function) once Fusion Tables returns a result. 
  //the function then takes the json and handles updating the page
  updateAppropTotal: function(json) {
    BudgetLib.appropTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateMainChart();
  },
  
  updateExpendTotal: function(json) {
    BudgetLib.expendTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateMainChart();
  },
  
  updateSparkAppropTotal: function(json) {
    BudgetLib.sparkAppropTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateSparkline();
  },
  
  updateSparkExpendTotal: function(json) {
    BudgetLib.sparkExpendTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateSparkline();
  },
  
  //shows the description of the current view below the main chart
  updateScorecardDescription: function(json) { 
    var rows = json["rows"];
    var cols = json["columns"];

    if(rows != undefined) {
      $("#f-officers").hide();
      
      if (rows.length > 0) {
        $('#scorecard-desc p').hide().html(rows[0][0]).fadeIn();
      }
      else if (BudgetLib.viewByOfficer) {
        $('#scorecard-desc p').hide().html('Breakdown by control officer*').fadeIn();
        $("#f-officers").show();
      }
      else if (!BudgetLib.viewByOfficer && BudgetLib.fundView == '' && BudgetLib.officerView == '') {
        $('#scorecard-desc p').hide().html('Breakdown by fund').fadeIn();
      }
      else $('#scorecard-desc p').html('');
    }
  },
  
  //shows totals and percentage changes of the current view below the main chart
  updateScorecard: function(json) {   
    var rows = json["rows"];
    var cols = json["columns"];
    if (rows.length > 0) {
      $('#scorecard .budgeted').fadeOut('fast', function(){
        $('#scorecard .budgeted').html(rows[0][0]);
        $('#scorecard .budgeted').formatCurrency();
      }).fadeIn('fast');
      
      $('#scorecard .spent').fadeOut('fast', function(){
        $('#scorecard .spent').html(rows[0][1]);
        $('#scorecard .spent').formatCurrency();
        
        if (BudgetLib.loadYear == BudgetLib.endYear && rows[0][1] == 0) {
          $('#scorecard .spent').append("<sup class='ref'>&dagger;</sup>");
          $('#f-zero2011').show();
        } 
        else $('#f-zero2011').hide();
      }).fadeIn();
      
      if (cols.length > 2) {
        var budgetedTop = rows[0][2];
        var spentTop = rows[0][3];
        var budgetedBottom = rows[0][4];
        var spentBottom = rows[0][5];
        
        if (budgetedTop > 0 && budgetedBottom > 0) {
          var budgetedPercent = (((budgetedTop / budgetedBottom) - 1) * 100).toFixed(1);
          if (budgetedPercent > -0.05) budgetedPercent = '+' + budgetedPercent;
          
          $('#budgeted-percent').hide().html('<strong>' + budgetedPercent + '%</strong> budgeted from ' + (BudgetLib.loadYear - 1)).fadeIn();
        }
        else $('#budgeted-percent').fadeOut();
        
        if (spentTop > 0 && spentBottom > 0) {
          var spentPercent = (((spentTop / spentBottom) - 1) * 100).toFixed(1);
          if (spentPercent > -0.05) spentPercent = '+' + spentPercent;
          
          $('#spent-percent').hide().html('<strong>' + spentPercent + '%</strong> spent from ' + (BudgetLib.loadYear - 1)).fadeIn();
        }
        else $('#spent-percent').fadeOut();
      }
    }
  },
  
  //builds out budget breakdown (secondary) table
  getDataAsBudgetTable: function(json) {
    var rows = json["rows"];
    var cols = json["columns"];  
    var fusiontabledata;

    for(i = 0; i < rows.length; i++) {
      var rowName = rows[i][0];
      var departmentId = 0;
      if (cols.length > 4)
        departmentId = rows[i][4];
      var year = cols[3];
      var budgeted = rows[i][1];
      var spent = rows[i][2];
      
      var rowId = BudgetHelpers.convertToSlug(rowName);
      var detailLoadFunction = "BudgetLib.getFundDetails(\"" + BudgetHelpers.convertToSlug(rowName) + "\");";
      
      if ((BudgetLib.fundView != null && BudgetLib.fundView != "") || (BudgetLib.officerView != null && BudgetLib.officerView != "")) {
        rowId = "department-" + departmentId;
        detailLoadFunction = "BudgetLib.getDepartmentDetails(\"department-" + departmentId + "\");";
      }
      else if (BudgetLib.viewByOfficer)
        detailLoadFunction = "BudgetLib.getControlOfficerDetails(\"" + BudgetHelpers.convertToSlug(rowName) + "\");";
      
      if (budgeted != 0 || spent != 0) {
        fusiontabledata += BudgetHelpers.generateTableRow(rowId, detailLoadFunction, rowName, budgeted, spent);
      }
    }
 
    BudgetLib.breakdownData = fusiontabledata;
    BudgetLib.updateTable();
  },
  
  //shows fund details when row is clicked
  getFundDetails: function(itemId) {  
    var fusiontabledata = BudgetHelpers.generateExpandedRow(itemId, 'fund');
    BudgetLib.updateDetail(itemId, fusiontabledata);
    BudgetQueries.getFundDescription(BudgetHelpers.convertToPlainString(itemId), "BudgetLib.updateExpandedDescription");
    BudgetQueries.getTotalArray(BudgetHelpers.convertToPlainString(itemId), 'Fund', true, "BudgetLib.updateSparkAppropTotal");
    BudgetQueries.getTotalArray(BudgetHelpers.convertToPlainString(itemId), 'Fund', false, "BudgetLib.updateSparkExpendTotal");
    BudgetQueries.getSparklinePercentages(BudgetHelpers.convertToPlainString(itemId), 'Fund', BudgetLib.loadYear, "BudgetLib.updateSparklinePercentages");
  },
  
  //shows fund details when row is clicked
  getControlOfficerDetails: function(itemId) {  
    var fusiontabledata = BudgetHelpers.generateExpandedRow(itemId, 'controlOfficer');
    BudgetLib.updateDetail(itemId, fusiontabledata);
    BudgetQueries.getControlOfficerDescription(BudgetHelpers.convertToPlainString(itemId), "BudgetLib.updateExpandedDescription");
    BudgetQueries.getTotalArray(BudgetHelpers.convertToPlainString(itemId), 'Control Officer', true, "BudgetLib.updateSparkAppropTotal");
    BudgetQueries.getTotalArray(BudgetHelpers.convertToPlainString(itemId), 'Control Officer', false, "BudgetLib.updateSparkExpendTotal");
    BudgetQueries.getSparklinePercentages(BudgetHelpers.convertToPlainString(itemId), 'Control Officer', BudgetLib.loadYear, "BudgetLib.updateSparklinePercentages");
  },
  
  //shows description in expanded row when row is clicked
  updateExpandedDescription: function(json) {
    var rows = json["rows"];
    var description = '';
    
    if (rows != undefined)
      description = rows[0][0];
    
    $('#expanded-description').hide().html(description).fadeIn();
  },
  
  //requests department details from Fusion Tables when row is clicked
  getDepartmentDetails: function(departmentId) {
    departmentId = departmentId.replace('department-', '')
    BudgetQueries.getDepartmentDescription(departmentId, "BudgetLib.updateDepartmentDetails");
  },
  
  //shows department details when row is clicked
  updateDepartmentDetails: function(json) {
    var rows = json["rows"];

    var departmentId = rows[0][0];
    var department = rows[0][1];
    var linkToWebsite = rows[0][2];
    var description = rows[0][3];
    var controlOfficer = rows[0][4];
    var departmentFund = rows[0][5];
     
    var fusiontabledata = BudgetHelpers.generateExpandedDeptRow(departmentId, department, description, linkToWebsite, departmentFund, controlOfficer);
    BudgetLib.updateDetail('department-' + departmentId, fusiontabledata);
    
    BudgetQueries.getTotalArray(departmentId, 'Department ID', true, "BudgetLib.updateSparkAppropTotal");
    BudgetQueries.getTotalArray(departmentId, 'Department ID', false, "BudgetLib.updateSparkExpendTotal");
    BudgetQueries.getSparklinePercentages(departmentId, 'Department ID', BudgetLib.loadYear, "BudgetLib.updateSparklinePercentages"); 
  },
  
  //updates percentages that display below the expanded row sparkling
  updateSparklinePercentages: function(json) {
    var rows = json["rows"];
    var cols = json["columns"]; 

    if (rows.length > 0)
    {
      var budgetedTop = rows[0][0];
      var spentTop = rows[0][1];
      var budgetedBottom = rows[0][2];
      var spentBottom = rows[0][3];
      
      if (budgetedTop > 0 && budgetedBottom > 0) {
        var budgetedPercent = (((budgetedTop / budgetedBottom) - 1) * 100).toFixed(1);
        if (budgetedPercent >= -0.05) budgetedPercent = '+' + budgetedPercent;
        $('#sparkline-budgeted').hide().html('<strong>' + budgetedPercent + '%</strong> budgeted from ' + (BudgetLib.loadYear - 1)).fadeIn();
      }
      else $('#sparkline-budgeted').fadeOut();
      
      if (spentTop > 0 && spentBottom > 0) {
        var spentPercent = (((spentTop / spentBottom) - 1) * 100).toFixed(1);
        if (spentPercent >= -0.05) spentPercent = '+' + spentPercent;
        $('#sparkline-spent').hide().html('<strong>' + spentPercent + '%</strong> spent from ' + (BudgetLib.loadYear - 1)).fadeIn();
      }
      else $('#sparkline-spent').fadeOut();
    }
  }
}