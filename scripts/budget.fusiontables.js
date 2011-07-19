/*--------------------------+
 | Site: Budget Breakdown   |
 | Budget Display library   |
 +--------------------------*/	
	
	//init
	google.load('visualization', '1', {}); //using Google visulaization API to do Fusion Tables SQL calls
	
	var fusionTableId = 1113478;
  	var breakdownData = "";
  	var breakdownTable;
  	var appropTotalArray;
  	var expendTotalArray;
	var loadYear;
	var fundView;
  	var arraysLoaded = 0;
	
	//front end display functions
	
	//primary load for graph and table
	function loadFor(year, fund) {
      var yearChanged = true;
      fundView = '';
      if (fund != null && fund != "")
      	fundView = convertToPlainString(fund);
      
      if (year != null && year != ""){
        //console.log('year: ' + year + ", loadYear: " + loadYear);
        if (loadYear+'' == year+'')
        	yearChanged = false;
      	loadYear = year;
      }
      else
	  {
      	loadYear = 2011;
		yearChanged = false;
	  }
      
      console.log('fundView: ' + fundView + ", loadYear: " + loadYear);	
      if (fundView != ""){
        if (!yearChanged){
        	getFundTotalArray(fundView, true, updateAppropTotal);
  			getFundTotalArray(fundView, false, updateExpendTotal);
  		}
        getDepartmentsForFund(fundView, loadYear, getDataAsBudgetTable);
        $('#timeline h2').html(fundView + ' budget for ' + loadYear);
      }
      else{
      	if (!yearChanged){
      		getFundTotalArray('', true, updateAppropTotal);
  			getFundTotalArray('', false, updateExpendTotal);
  		}
      	getAllFundsForYear(loadYear, getDataAsBudgetTable);
      	$('#timeline h2').html('Entire budget for ' + loadYear);
      }	
    }  
	
	//displays highchart
	function updateMainChart() {
   	  arraysLoaded++;
   	  if (arraysLoaded >= 2)
   	  {
   	  	var minValuesArray = $.grep(appropTotalArray.concat(expendTotalArray), function(val) { return val != null; });
	      // Highcharts
	      chart1 = new Highcharts.Chart({
	      chart: {
	        defaultSeriesType: "area",
	        renderTo: "timeline-chart"
	      },
	      credits: { enabled: false },
	      plotOptions: {
	        area: { fillOpacity: 0.25 },
	        series: {
	          lineWidth: 5,
	          point: {
              events: {
                click: function() {
                  var x = this.x,
                      selected = !this.selected,
                      index = this.series.index;
                  console.log(this)
                  this.select(selected, false);

                  $.each(this.series.chart.series, function(i, serie) {
                    if (serie.index !== index) {
                      $(serie.data).each(function(j, point){
                        if(x === point.x) {
                          point.select(selected, true);
                        }
                      });
                    }
                  });
				  var clickedYear = new Date(x).getFullYear();
				  
				  $.address.parameter('year',clickedYear)
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
        
        $('.expanded-content a').address(); //after adding the table rows, initialize the address plugin on all the links
        
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
		if ($('#' + itemId + '-expanded').length == 0)
		{
			//console.log('showing detail');
			$('.budget-expand-img').attr('src', '/budget/images/expand.png');
			$('#breakdown .expanded-content').remove();
			$('#' + itemId + ' .budget-expand-img').attr('src', '/budget/images/collapse.png');
			$(detail).insertAfter($('#' + itemId));
		}
		else
		{
			//console.log('hiding all details');
			$('.budget-expand-img').attr('src', '/budget/images/expand.png');
			$('#breakdown .expanded-content').remove();
		}
	}

	//back end fusiontables fetch functions	
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
		  
		  var detailLoadFunction = "getFundDetails";
		  if (fundView != null && fundView != "")
			detailLoadFunction = "getDepartmentDetails";
		  
		  if (budgeted != 0 || spent != 0)
		  {
			  fusiontabledata += "<tr id='" + convertToSlug(fund) + "'>";
			  fusiontabledata += "<td><a onclick='" + detailLoadFunction + "(\"" + convertToSlug(fund) + "\");'><img class='budget-expand-img' src='/budget/images/expand.png' /></a> <a onclick='" + detailLoadFunction + "(\"" + convertToSlug(fund) + "\");'>" + fund + "</a></td>";
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
		//numRows = response.getDataTable().getNumberOfRows();
		var fusiontabledata;
		  
		fusiontabledata = "<tr class='expanded-content' id='" + itemId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>Health fund</h2>";
		fusiontabledata += "		<p>Portion of the general fund that pays for costs related to heathcare and prevention.</p>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><a href='/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "' rel='address:/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "'>View all departments</a></li>";
		fusiontabledata += "		  <li><strong>1</strong> <a href='#'>control officer</a></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='health-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><strong>-6.3%</strong> budgeted from 2010</li>";
		fusiontabledata += "		  <li><strong>-8.7%</strong> spent from 2010</li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		updateDetail(itemId, fusiontabledata);
	}
	
	//shows department details
	function getDepartmentDetails(itemId) {	
		//numRows = response.getDataTable().getNumberOfRows();
		var fusiontabledata;
		  
		fusiontabledata = "<tr class='expanded-content' id='" + itemId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>Example department</h2>";
		fusiontabledata += "		<p>Etc etc etc.</p>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><a href='/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "' rel='address:/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "'>View all departments</a></li>";
		fusiontabledata += "		  <li>Control officer: John Smith</li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='health-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><strong>-6.3%</strong> budgeted from 2010</li>";
		fusiontabledata += "		  <li><strong>-8.7%</strong> spent from 2010</li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		updateDetail(itemId, fusiontabledata);
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
		return Text.replace(/ /g,'-').replace(/[^\w-]+/g,'');
	}
	
	function convertToQueryString(Text)
	{
		return Text.replace(/\-+/g, '+');
	}
	
	function convertToPlainString(Text)
	{
		return Text.replace(/\++/g, ' ');
	}