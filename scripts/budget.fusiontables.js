/*--------------------------+
 | Site: Budget Breakdown   |
 | Budget Display library   |
 +--------------------------*/	
	
	//init
	google.load('visualization', '1', {}); //using Google visulaization API to do Fusion Tables SQL calls
	
	var fusionTableId = 1227404;
	var fundDescriptionTableId = 1113392;
	var officerDescriptionTableId = 1113485;
  	var breakdownData = "";
  	var sparkChart;
  	var breakdownTable;
  	var appropTotalArray;
  	var expendTotalArray;
  	var sparkAppropTotalArray;
  	var sparkExpendTotalArray;
	var loadYear;
	var fundView;
	var officerView;
	var viewByOfficer;
  	var arraysLoaded = 0;
	
	//front end display functions
	
	//primary load for graph and table
	function loadFor(viewMode, year, fund, officer, externalLoad) {
	  //console.log('externalLoad: ' + externalLoad);
	  //console.log('fundView: ' + fundView + ', fund: ' + convertToPlainString(fund) + ', officer: ' + convertToPlainString(officer));
	  
      var viewChanged = false;
      if (fundView != convertToPlainString(fund) || officerView != convertToPlainString(officer))
        	viewChanged = true;
        	
      //console.log('viewChanged: ' + viewChanged)
        	
      if (viewMode != null && viewMode == "officer")
      	viewByOfficer = true;
      else
        viewByOfficer = false;
      
      if (fund != null && fund != "")
      	fundView = convertToPlainString(fund);
      else
        fundView = '';
        
      if (officer != null && officer != "")
      	officerView = convertToPlainString(officer);
      else
        officerView = '';
      
      if (year != null && year != "")
      	loadYear = year;
      else
      	loadYear = 2011;

      if (fundView != ""){
        if (viewChanged || externalLoad)
        {
	        window.scrollTo(0, 0);
	    	getTotalArray(fundView, 'Fund', true, updateAppropTotal);
			getTotalArray(fundView, 'Fund', false, updateExpendTotal);
		}
        getDepartments(fundView, 'Fund', loadYear, getDataAsBudgetTable);
        
        $('#timeline h2').html("<a href='/?year=" + loadYear + "' rel='address:/?year=" + loadYear + "'> Cook County Budget</a> &raquo; " + fundView);
        $('#secondary-title').html(loadYear + ' ' + fundView);
        $('#breakdown-item-title span').html('Department');
        $("#breakdown-nav").html("");
        $('#timeline h2 a').address();
        
        getTotalsForYear(fundView, 'Fund', loadYear, updateScorecard);
        getFundDescription(fundView, updateScorecardDescription);
      }
      else if (officerView != ""){
        if (viewChanged || externalLoad)
        {
	        window.scrollTo(0, 0);
	    	getTotalArray(officerView, 'Control Officer', true, updateAppropTotal);
			getTotalArray(officerView, 'Control Officer', false, updateExpendTotal);
		}
        getDepartments(officerView, 'Control Officer', loadYear, getDataAsBudgetTable);
        
        $('#timeline h2').html("<a href='/?year=" + loadYear + "' rel='address:/?year=" + loadYear + "'> Cook County Budget</a> &raquo; " + officerView);
        $('#secondary-title').html(loadYear + ' ' + officerView);
        $('#breakdown-item-title span').html('Department');
        $('#timeline h2 a').address();
		$("#breakdown-nav").html("");
		
		getTotalsForYear(officerView, 'Control Officer', loadYear, updateScorecard);
		getControlOfficerDescription(officerView, updateScorecardDescription);
      }
      else{
        if (viewChanged || externalLoad) {
  			getTotalArray('', '', true, updateAppropTotal);
			getTotalArray('', '', false, updateExpendTotal);
		}
		
		$('#timeline h2').html('Cook County Budget');
	    $('#secondary-title').html(loadYear + ' Cook County Budget');
	      	
		if (viewByOfficer)
		{
			getAllControlOfficersForYear(loadYear, getDataAsBudgetTable);
			$("#breakdown-nav").html("<ul><li><a href='#' rel='address:/?year=" + loadYear + "&viewMode=fund'>Where's it going?</a></li><li class='current'>Who controls it?</li></ul><div class='clear'></div>");
			$('#breakdown-item-title span').html('Control Officer');
		}
		else
		{
      		getAllFundsForYear(loadYear, getDataAsBudgetTable);
      		$("#breakdown-nav").html("<ul><li class='current'>Where's it going?</li><li><a href='#' rel='address:/?year=" + loadYear + "&viewMode=officer'>Who controls it?</a></li></ul><div class='clear'></div>");
	      	$('#breakdown-item-title span').html('Fund');
      	}
      	$("#breakdown-nav a").address();
      	
      	getTotalsForYear('', '', loadYear, updateScorecard);
      	getFundDescription(fundView, updateScorecardDescription);
      	
      	if (externalLoad)
      		_trackClickEvent("Charts", "Load timeline", $('#secondary-title').html());
      	else if (viewChanged)
      		_trackClickEvent("Charts", "View timeline", $('#secondary-title').html());
      }
    }  
	
	//displays highchart
	function updateMainChart() {
   	  arraysLoaded++;
   	  if (arraysLoaded >= 2)
   	  {
   	    arraysLoaded = 0;
   	  	var minValuesArray = $.grep(appropTotalArray.concat(expendTotalArray), function(val) { return val != null; });
	      // Highcharts
	      mainChart = new Highcharts.Chart({
	      chart: {
	        borderColor: "#dddddd",
	        borderRadius: 0,
	        borderWidth: 1,
          events: {
            click: function() {
              $("#readme").fadeOut("fast");
              $.cookie("budgetbreakdownreadme", "read", { expires: 7 });
            }
          },
	        defaultSeriesType: "area",
	        marginBottom: 30,
	        marginLeft: 60,
	        marginRight: 15,
	        marginTop: 20,
	        renderTo: "timeline-chart"
	      },
	      credits: { enabled: false },
	      legend: {
	        backgroundColor: "#ffffff",
	        borderColor: "#cccccc",
	        floating: true,
	        verticalAlign: "top",
	        x: -300,
	        y: 20
	      },
	      plotOptions: {
	        area: { fillOpacity: 0.25 },
	        series: {
	          lineWidth: 5,
	          point: {
              events: {
                click: function() {
                  $("#readme").fadeOut("fast");
                  $.cookie("budgetbreakdownreadme", "read", { expires: 7 });
                  var x = this.x,
				      y = this.y,
                      selected = !this.selected,
                      index = this.series.index;
                  this.select(selected, false);

                  $.each(this.series.chart.series, function(i, serie) {
                    if (serie.index !== index) {
                      $(serie.data).each(function(j, point){
                        if(x === point.x && point.y != null) {
                          point.select(selected, true);
                        }
                      });
                    }
                  });
				  var clickedYear = new Date(x).getFullYear();
				  _trackClickEvent("Charts", "Choose year", clickedYear + " (from " + $('#secondary-title').html() + ")");
				  $.address.parameter('year',clickedYear);
                }
              }
            },
            pointInterval: 365 * 24 * 3600 * 1000,
	          pointStart: Date.UTC(1993, 1, 1),
	          shadow: false
	        }
	      },
	      series: [
	        {
	          color: "#264870",
	          data: appropTotalArray,
	          marker: {
	            radius: 6,
	            symbol: "circle"
	          },
	          name: "Budgeted"
	        }, {
	          color: "#7d9abb",
	          data: expendTotalArray,
	          marker: {
	            radius: 8,
	            symbol: "square"
	          },
	          name: "Spent"
	        }
	      ],
	      title: null,
	      tooltip: {
	        borderColor: "#000",
	        formatter: function() {
	          var s = "<strong>" + Highcharts.dateFormat("%Y", this.x) + "</strong>";
	          $.each(this.points, function(i, point) {
	            s += "<br /><span style=\"color: " + point.series.color + "\">" + point.series.name + ":</span> $" + Highcharts.numberFormat(point.y, 0);
	          });
	          return s;
	        },
	        shared: true
	      },
	      xAxis: {
	        dateTimeLabelFormats: { year: "%Y" },
	        gridLineColor: "#ddd",
	        gridLineWidth: 1,
	        type: "datetime"
	      },
	      yAxis: {
	        gridLineColor: "#ddd",
	        lineWidth: 1,
	        labels: {
	          formatter: function() {
	            if (this.value >= 1000000000)
	              return "$" + this.value / 1000000000 + "B";
	            else if (this.value >= 1000000)
	              return "$" + this.value / 1000000 + "M";
	            else
	              return "$" + this.value;
	          }
	        },
	        min: Math.min.apply( Math, minValuesArray ),
	        title: null
	      }
	  	});
		//select the current year on load
		//console.log('loadYear: ' + loadYear);
		var selectedYearIndex = 18 - (2011 - loadYear);
		//console.log('selectedYearIndex: ' + selectedYearIndex);
		if (mainChart.series[0].data[selectedYearIndex].y != null)
			mainChart.series[0].data[selectedYearIndex].select(true,true);
		if (mainChart.series[1].data[selectedYearIndex].y != null)
			mainChart.series[1].data[selectedYearIndex].select(true,true);
		}
    }
    
    function updateSparkline() {
      arraysLoaded++;
   	  if (arraysLoaded >= 2)
   	  {
   	  	var minValuesArray = $.grep(sparkAppropTotalArray.concat(sparkExpendTotalArray), function(val) { return val != null; });
	   	  arraysLoaded = 0;
	      // Small chart
	      sparkChart = new Highcharts.Chart({
	        chart: {
	          defaultSeriesType: "area",
	          marginBottom: 15,
	          marginRight: 0,
	          renderTo: "selected-chart"
	        },
	        legend: { enabled: false },
	        credits: { enabled: false },
	        plotOptions: {
	          area: { fillOpacity: 0.25 },
	          series: {
	            lineWidth: 2,
	            point: {
	              events: {
	                click: function() {
						var x = this.x;
	                	if (fundView == '' && officerView == '')
						{
							var clickedYear = new Date(x).getFullYear();				  
							$.address.parameter('year',clickedYear)
							$.address.parameter('fund',convertToQueryString($('.expanded-primary h2').html()));
						}
						else
						{
						
						}
	                }
	              }
	            },
              pointInterval: 365 * 24 * 3600 * 1000,
              pointStart: Date.UTC(1993, 1, 1),
	            shadow: false
	          }
	        },
	        series: [
            {
	            color: "#264870",
	            data: sparkAppropTotalArray,
              marker: {
                radius: 4,
                symbol: "circle"
              },
              name: "Budgeted"
	          }, {
	            color: "#7d9abb",
	            data: sparkExpendTotalArray,
              marker: {
                radius: 5,
                symbol: "square"
              },
              name: "Spent"
	          }
	        ],
	        title: null,
	        tooltip: {
            borderColor: "#000",
            formatter: function() {
              var s = "<strong>" + Highcharts.dateFormat("%Y", this.x) + "</strong>";
              $.each(this.points, function(i, point) {
                s += "<br /><span style=\"color: " + point.series.color + "\">" + point.series.name + ":</span> $" + Highcharts.numberFormat(point.y, 0);
              });
              return s;
            },
            shared: true
          },
          xAxis: {
  	        dateTimeLabelFormats: { year: "%Y" },
  	        gridLineWidth: 0,
  	        type: "datetime"
  	      },
  	      yAxis: {
	          gridLineWidth: 0,
	          labels: {
  	          formatter: function() {
  	            if (this.value >= 1000000000)
  	              return "$" + this.value / 1000000000 + "B";
  	            else if (this.value >= 1000000)
  	              return "$" + this.value / 1000000 + "M";
  	            else
  	              return "$" + this.value;
  	          }
  	        },
  	        lineWidth: 1,
  	        min: Math.min.apply( Math, minValuesArray ),
	          title: { text: null }
	        }
	      });
	    var selectedYearIndex = 18 - (2011 - loadYear);
		if (sparkChart.series[0].data[selectedYearIndex].y != null)
			sparkChart.series[0].data[selectedYearIndex].select(true,true);
		if (sparkChart.series[1].data[selectedYearIndex].y != null)
			sparkChart.series[1].data[selectedYearIndex].select(true,true);
      }
    }
    
	//displays datatables fund/department listing
    function updateTable() {
      $('#breakdown').fadeOut('fast', function(){
        if (breakdownTable != null) breakdownTable.fnDestroy();
        
        $('#breakdown tbody').children().remove();
        $('#breakdown > tbody:last').append(breakdownData);
        
        var maxArray = new Array();
        $('.budgeted.num').each(function(){
          maxArray.push(parseInt($(this).html()));
        });
        $('.spent.num').each(function(){
          maxArray.push(parseInt($(this).html()));
        });
        
        var maxBudgeted = Math.max.apply( Math, maxArray );
        if (maxBudgeted > 0)
        {
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
        
        breakdownTable = $("#breakdown").dataTable({
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
    }
	
	//show/hide expanded detail
	function updateDetail(itemId, detail) {
		if (sparkChart != null)
		{
			sparkChart.destroy();
			sparkChart = null;
		}
		
		if ($('#' + itemId + '-expanded').length == 0)
		{
			$('.budget-expand-img').attr('src', '/budget/images/expand.png');
			$('#breakdown .expanded-content').remove();
			$('#breakdown tr').removeClass('expanded-head');
			$('#' + itemId + ' .budget-expand-img').attr('src', '/budget/images/collapse.png');
			$(detail).insertAfter($('#' + itemId));
			$('#' + itemId).addClass('expanded-head');
		}
		else
		{
			$('.budget-expand-img').attr('src', '/budget/images/expand.png');
			$('#breakdown .expanded-content').remove();
			$('#breakdown tr').removeClass('expanded-head');
		}
	}
  	
  	//gets fund or department totals per year for highcharts  	
	function getTotalArray(name, queryType, isAppropriation, callback) {
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
		if (name != '')
			myQuery += " WHERE '" + queryType + "' = '" + name + "'";
		
		getQuery(myQuery).send(callback);
	}
	
	//returns total given year
	function getTotalsForYear(name, queryType, year, callback) {
		var whereClause = "";
		if (name != "")
			whereClause = " WHERE '" + queryType + "' = '" + name + "'";
		
		var percentageQuery = "";	
		if (year > 1993) {
			percentageQuery = ", SUM('Appropriations " + year + "') AS 'Appropriations Top', SUM('Expenditures " + year + "') AS 'Expenditures Top', SUM('Appropriations " + (year - 1) + "') AS 'Appropriations Bottom', SUM('Expenditures " + (year - 1) + "') AS 'Expenditures Bottom'";
		}
			
		var myQuery = "SELECT SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures' " + percentageQuery + " FROM " + fusionTableId + whereClause;			
		getQuery(myQuery).send(callback);
	}
	
	//returns all funds budgeted/spent totals for given year
	function getAllFundsForYear(year, callback) {		
		var myQuery = "SELECT Fund, SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', Fund AS '" + year + "' FROM " + fusionTableId + " GROUP BY Fund";			
		getQuery(myQuery).send(callback);
	}
	
	//returns all funds budgeted/spent totals for given year
	function getDepartments(name, queryType, year, callback) {		
		var myQuery = "SELECT 'Short Title', SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', 'Short Title' AS '" + year + "', 'Department ID' FROM " + fusionTableId + " WHERE '" + queryType + "' = '" + name + "' GROUP BY 'Department ID', 'Short Title'";			
		getQuery(myQuery).send(callback);
	}
	
	//returns all control officers budgeted/spent totals for given year
	function getAllControlOfficersForYear(year, callback) {		
		var myQuery = "SELECT 'Control Officer', SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', 'Control Officer' AS '" + year + "' FROM " + fusionTableId + " GROUP BY 'Control Officer'";			
		getQuery(myQuery).send(callback);
	}
	
	function getFundDescription(fund, callback) {
		var myQuery = "SELECT 'Fund Description' FROM " + fundDescriptionTableId + " WHERE Item = '" + fund + "'";			
		getQuery(myQuery).send(callback);
	}
	
	function getControlOfficerDescription(officer, callback) {
		var myQuery = "SELECT 'Control Officer Description' FROM " + officerDescriptionTableId + " WHERE Item = '" + officer + "'";			
		getQuery(myQuery).send(callback);
	}
	
	function getDepartmentDescription(departmentId, callback) {
		var myQuery = "SELECT 'Department ID', Department, 'Link to Website', 'Department Description', 'Control Officer' FROM " + fusionTableId + " WHERE 'Department ID' = " + departmentId;			
		getQuery(myQuery).send(callback);
	}
	
	function getSparklinePercentages(name, queryType, year, callback) {	
		if (year > 1993) {
			var whereClause = "";
			if (queryType != "")
				whereClause += " WHERE '" + queryType + "' = '" + name + "'";
				
			var myQuery = "SELECT SUM('Appropriations " + year + "') AS 'Appropriations Top', SUM('Expenditures " + year + "') AS 'Expenditures Top', SUM('Appropriations " + (year - 1) + "') AS 'Appropriations Bottom', SUM('Expenditures " + (year - 1) + "') AS 'Expenditures Bottom' FROM " + fusionTableId + whereClause;			
			getQuery(myQuery).send(callback);
		}
	}
	
	//converts SQL query to URL	
	function getQuery(myQuery) {
		//console.log(myQuery);
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
	
	function updateSparkAppropTotal(response) {
		sparkAppropTotalArray = getDataAsArray(response);
		updateSparkline();
	}
	
	function updateSparkExpendTotal(response) {
		sparkExpendTotalArray = getDataAsArray(response);
		updateSparkline();
	}
	
	function updateScorecardDescription(response) {		
		if (response.getDataTable().getNumberOfRows() > 0)
		{
			$('#scorecard-desc p').fadeOut('fast', function(){
				$('#scorecard-desc p').html(response.getDataTable().getValue(0, 0));
			}).fadeIn('fast');
		}
		else if (viewByOfficer == true)
		{
			$('#scorecard-desc p').fadeOut('fast', function(){
				$('#scorecard-desc p').html('Breakdown by control officer*');
			}).fadeIn('fast');
		}
		else if (fundView == '')
		{
			$('#scorecard-desc p').fadeOut('fast', function(){
				$('#scorecard-desc p').html('Breakdown by fund');
			}).fadeIn('fast');
		}
	}
	
	function updateScorecard(response) {		
		if (response.getDataTable().getNumberOfRows() > 0)
		{
			$('#scorecard .budgeted').fadeOut('fast', function(){
				$('#scorecard .budgeted').html(response.getDataTable().getValue(0, 0));
				$('#scorecard .budgeted').formatCurrency();
			}).fadeIn('fast');
			
			$('#scorecard .spent').fadeOut('fast', function(){
				$('#scorecard .spent').html(response.getDataTable().getValue(0, 1));
				$('#scorecard .spent').formatCurrency();
			}).fadeIn('fast');
			
			if (response.getDataTable().getNumberOfColumns() > 2)
			{
				var budgetedTop = response.getDataTable().getValue(0, 2);
				var spentTop = response.getDataTable().getValue(0, 3);
				var budgetedBottom = response.getDataTable().getValue(0, 4);
				var spentBottom = response.getDataTable().getValue(0, 5);
				
				if (budgetedTop > 0 && budgetedBottom > 0)
				{
					var budgetedPercent = (((budgetedTop / budgetedBottom) - 1) * 100).toFixed(1);
					if (budgetedPercent >= 0) budgetedPercent = '+' + budgetedPercent;
					
					$('#budgeted-percent').fadeOut('fast', function(){
						$('#budgeted-percent').html('<strong>' + budgetedPercent + '%</strong> budgeted from ' + (loadYear - 1));
					}).fadeIn('fast');
				}
				else
					$('#budgeted-percent').fadeOut();
				
				if (spentTop > 0 && spentBottom > 0)
				{
					var spentPercent = (((spentTop / spentBottom) - 1) * 100).toFixed(1);
					if (spentPercent >= 0) spentPercent = '+' + spentPercent;
					
					$('#spent-percent').fadeOut('fast', function(){
						$('#spent-percent').html('<strong>' + spentPercent + '%</strong> spent from ' + (loadYear - 1));
					}).fadeIn('fast');
				}
				else
					$('#spent-percent').fadeOut();
			}
		}
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
		//console.log('rows found: ' + numRows);
		var fusiontabledata;
		for(i = 0; i < numRows; i++) {
		  var rowName = response.getDataTable().getValue(i, 0);
		  var departmentId = 0;
		  if (response.getDataTable().getNumberOfColumns() > 4)
		  	departmentId = response.getDataTable().getValue(i, 4);
	  	  var year = response.getDataTable().getColumnLabel(3);
	  	  var budgeted = response.getDataTable().getValue(i, 1);
	  	  var spent = response.getDataTable().getValue(i, 2);
	  	  
	  	  //console.log('rowName: ' + rowName);
		  
		  var rowId = convertToSlug(rowName);
		  var detailLoadFunction = "getFundDetails(\"" + convertToSlug(rowName) + "\");";
		  
		  if ((fundView != null && fundView != "") || (officerView != null && officerView != "")) {
		    rowId = "department-" + departmentId;
			detailLoadFunction = "getDepartmentDetails(\"department-" + departmentId + "\");";
		  }
		  else if (viewByOfficer)
		  	detailLoadFunction = "getControlOfficerDetails(\"" + convertToSlug(rowName) + "\");";
		  
		  if (budgeted != 0 || spent != 0)
		  {
			  fusiontabledata += "<tr id='" + rowId + "'>";
			  fusiontabledata += "<td><a onclick='" + detailLoadFunction + "'><img class='budget-expand-img' src='/budget/images/expand.png' /></a> <a onclick='" + detailLoadFunction + "'>" + rowName + "</a></td>";
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
	
	//shows fund details
	function getFundDetails(itemId) {	
		_trackClickEvent("Charts", "Expand row", "Fund: " + convertToPlainString(itemId) + " (" + loadYear + ")");
		var fusiontabledata;
		  
		fusiontabledata = "<tr class='expanded-content' id='" + itemId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>" + convertToPlainString(itemId) + "</h2>";
		fusiontabledata += "		<p id='expanded-description'></p>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><a class='adr' href='/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "' rel='address:/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "'>Breakdown by department&nbsp;&raquo;</a></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='selected-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li id='sparkline-budgeted'></li>";
		fusiontabledata += "		  <li id='sparkline-spent'></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		
		updateDetail(itemId, fusiontabledata);
		getFundDescription(convertToPlainString(itemId), updateExpandedDescription);
		getTotalArray(convertToPlainString(itemId), 'Fund', true, updateSparkAppropTotal);
		getTotalArray(convertToPlainString(itemId), 'Fund', false, updateSparkExpendTotal);
		getSparklinePercentages(convertToPlainString(itemId), 'Fund', loadYear, updateSparklinePercentages);
	}
	
	//shows fund details
	function getControlOfficerDetails(itemId) {	
		_trackClickEvent("Charts", "Expand row", "Control officer: " + convertToPlainString(itemId) + " (" + loadYear + ")");
		var fusiontabledata;
		  
		fusiontabledata = "<tr class='expanded-content' id='" + itemId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>" + convertToPlainString(itemId) + "</h2>";
		fusiontabledata += "		<p id='expanded-description'></p>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><a class='adr' href='/?year=" + loadYear + "&amp;controlOfficer=" + convertToQueryString(itemId) + "' rel='address:/?year=" + loadYear + "&amp;controlOfficer=" + convertToQueryString(itemId) + "'>Breakdown by department&nbsp;&raquo;</a></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='selected-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li id='sparkline-budgeted'></li>";
		fusiontabledata += "		  <li id='sparkline-spent'></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		
		updateDetail(itemId, fusiontabledata);
		getControlOfficerDescription(convertToPlainString(itemId), updateExpandedDescription);
		getTotalArray(convertToPlainString(itemId), 'Control Officer', true, updateSparkAppropTotal);
		getTotalArray(convertToPlainString(itemId), 'Control Officer', false, updateSparkExpendTotal);
		getSparklinePercentages(convertToPlainString(itemId), 'Control Officer', loadYear, updateSparklinePercentages);
	}
	
	function updateExpandedDescription(response) {
		var description = '';
		
		if (response.getDataTable().getNumberOfRows() > 0)
			description = response.getDataTable().getValue(0, 0);
		
		//console.log('description: ' + description);
		$('#expanded-description').fadeOut('fast', function(){
			$('#expanded-description').html(description);
		}).fadeIn('fast');
	}
	
	function getDepartmentDetails(departmentId) {
		departmentId = departmentId.replace('department-', '')
		
		getDepartmentDescription(departmentId, updateDepartmentDetails);
	}
	
	//shows department details
	function updateDepartmentDetails(response) {
		var fusiontabledata;
		var departmentId = response.getDataTable().getValue(0, 0);
		var department = response.getDataTable().getValue(0, 1);
		var linkToWebsite = response.getDataTable().getValue(0, 2);
		var description = response.getDataTable().getValue(0, 3);
		var controlOfficer = response.getDataTable().getValue(0, 4);
		
		_trackClickEvent("Charts", "Expand row", "Department: " + department + " (" + loadYear + ")");	
		
		fusiontabledata = "<tr class='expanded-content' id='department-" + departmentId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>" + department + "</h2>";
		fusiontabledata += "		<p>" + description + " ";
		if (linkToWebsite != '')
			fusiontabledata += "		  <a href='" + linkToWebsite + "'>Official&nbsp;website&nbsp;&raquo;</a>";
		fusiontabledata += "</p>";		
		fusiontabledata += "		<ul class='stats'>";
		if (controlOfficer != '')
			fusiontabledata += "		  <li>Control officer: " + controlOfficer + "</li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='selected-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li id='sparkline-budgeted'></li>";
		fusiontabledata += "		  <li id='sparkline-spent'></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		updateDetail('department-' + departmentId, fusiontabledata);
		
		getTotalArray(departmentId, 'Department ID', true, updateSparkAppropTotal);
		getTotalArray(departmentId, 'Department ID', false, updateSparkExpendTotal);
		getSparklinePercentages(departmentId, 'Department ID', loadYear, updateSparklinePercentages); 
	}
	
	function updateSparklinePercentages(response) {
		if (response.getDataTable().getNumberOfRows() > 0)
		{
			var budgetedTop = response.getDataTable().getValue(0, 0);
			var spentTop = response.getDataTable().getValue(0, 1);
			var budgetedBottom = response.getDataTable().getValue(0, 2);
			var spentBottom = response.getDataTable().getValue(0, 3);
			
			//console.log('budgeted top: ' + budgetedTop);
			//console.log('spent top: ' + spentTop);
			//console.log('budgeted bottom: ' + budgetedBottom);
			//console.log('spent bottom: ' + spentBottom);
			
			if (budgetedTop > 0 && budgetedBottom > 0)
			{
				var budgetedPercent = (((budgetedTop / budgetedBottom) - 1) * 100).toFixed(1);
				if (budgetedPercent >= 0) budgetedPercent = '+' + budgetedPercent;
				//console.log('budgetedPercent: ' + budgetedPercent);
				
				$('#sparkline-budgeted').fadeOut('fast', function(){
					$('#sparkline-budgeted').html('<strong>' + budgetedPercent + '%</strong> budgeted from ' + (loadYear - 1));
				}).fadeIn('fast');
			}
			else
				$('#sparkline-budgeted').fadeOut();
			
			if (spentTop > 0 && spentBottom > 0)
			{
				var spentPercent = (((spentTop / spentBottom) - 1) * 100).toFixed(1);
				if (spentPercent >= 0) spentPercent = '+' + spentPercent;
				//console.log('spentPercent: ' + spentPercent);
				
				$('#sparkline-spent').fadeOut('fast', function(){
					$('#sparkline-spent').html('<strong>' + spentPercent + '%</strong> spent from ' + (loadYear - 1));
				}).fadeIn('fast');
			}
			else
				$('#sparkline-spent').fadeOut();
		}
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
	  //console.log(fusiontabledata);
	  breakdownData += fusiontabledata;
	  updateTable();
	}
	
	function convertToSlug(Text)
	{
		return (Text+'').replace(/ /g,'-').replace(/[^\w-]+/g,'');
	}
	
	function convertToQueryString(Text)
	{
		if (Text == undefined) return '';
		
		return (Text+'').replace(/\-+/g, '+')
		.replace(/\s+/g, '+');
	}
	
	function convertToPlainString(Text)
	{
	    if (Text == undefined) return '';
	    
		return (Text+'').replace(/\++/g, ' ')
		.replace(/\-+/g, ' ');
	}