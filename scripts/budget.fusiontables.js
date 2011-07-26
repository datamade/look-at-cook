/*--------------------------+
 | Site: Budget Breakdown   |
 | Budget Display library   |
 +--------------------------*/	
	
	//init
	google.load('visualization', '1', {}); //using Google visulaization API to do Fusion Tables SQL calls
	
	var fusionTableId = 1113478;
	var fundDescriptionTableId = 1113392;
  	var breakdownData = "";
  	var breakdownTable;
  	var appropTotalArray;
  	var expendTotalArray;
  	var sparkAppropTotalArray;
  	var sparkExpendTotalArray;
	var loadYear;
	var fundView;
  	var arraysLoaded = 0;
	
	//front end display functions
	
	//primary load for graph and table
	function loadFor(year, fund, externalLoad) {
	  console.log('externalLoad: ' + externalLoad);
	  console.log('fundView: ' + fundView + ', fund: ' + convertToPlainString(fund));
	  
      var fundChanged = false;
      if (fundView != convertToPlainString(fund))
        	fundChanged = true;
      
      if (fund != null && fund != "")
      	fundView = convertToPlainString(fund);
      else
        fundView = '';
        
      console.log('fundChanged: ' + fundChanged);
      
      if (year != null && year != "")
      	loadYear = year;
      else
      	loadYear = 2011;
      
      console.log('fundView: ' + fundView + ", loadYear: " + loadYear);	
      if (fundView != ""){
        if (fundChanged || externalLoad)
        {
	        window.scrollTo(0, 0);
	    	getTotalArray(fundView, false, true, updateAppropTotal);
			getTotalArray(fundView, false, false, updateExpendTotal);
		}
        getDepartmentsForFund(fundView, loadYear, getDataAsBudgetTable);
        
        $('#timeline h2').html("<a href='/?year=" + loadYear + "' rel='address:/?year=" + loadYear + "'> Cook County Budget</a> &raquo; " + fundView);
        $('#secondary-title').html('<h3>' + loadYear + ' Breakdown by Department</h3>');
        $('#breakdown-item-title span').html('Department');
        $('#timeline h2 a').address();
      }
      else{
        if (fundChanged || externalLoad) {
  			getTotalArray('', false, true, updateAppropTotal);
			getTotalArray('', false, false, updateExpendTotal);
		}
      	getAllFundsForYear(loadYear, getDataAsBudgetTable);
      	
      	$('#timeline h2').html('Cook County Budget');
      	$('#secondary-title').html('<h3>' + loadYear + ' Breakdown by Fund</h3>');
      	$('#breakdown-item-title span').html('Fund');
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
	      chart1 = new Highcharts.Chart({
	      chart: {
	        defaultSeriesType: "area",
	        marginBottom: 20,
	        marginRight: 0,
	        marginTop: 10,
	        renderTo: "timeline-chart"
	      },
	      credits: { enabled: false },
	      legend: {
	        backgroundColor: "#ffffff",
	        borderColor: "#cccccc",
	        floating: true,
	        verticalAlign: "top",
	        x: -310,
	        y: 10,
	      },
	      plotOptions: {
	        area: { fillOpacity: 0.25 },
	        series: {
	          lineWidth: 5,
	          point: {
              events: {
                click: function() {
                  var x = this.x,
				      y = this.y,
                      selected = !this.selected,
                      index = this.series.index;
                  //console.log(this)
                  this.select(selected, false);

                  $.each(this.series.chart.series, function(i, serie) {
                    if (serie.index !== index) {
                      $(serie.data).each(function(j, point){
                        if(x === point.x && y != null) {
						  console.log('y: ' + y);
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
		//select the current year on load
		console.log('loadYear: ' + loadYear);
		var selectedYearIndex = 18 - (2011 - loadYear);
		console.log('selectedYearIndex: ' + selectedYearIndex);
		if (chart1.series[0].data[selectedYearIndex] != null)
			chart1.series[0].data[selectedYearIndex].select(true,false);
		//if (chart1.series[1].data[selectedYearIndex] != null)
		//	chart1.series[1].data[selectedYearIndex].select(true,false);
		}
    }
    
    function updateSparkline() {
      arraysLoaded++;
   	  if (arraysLoaded >= 2)
   	  {
   	  	var minValuesArray = $.grep(sparkAppropTotalArray.concat(sparkExpendTotalArray), function(val) { return val != null; });
	   	  arraysLoaded = 0;
	      // Small chart
	      chart2 = new Highcharts.Chart({
	        chart: {
	          defaultSeriesType: "area",
	          margin: [0, 0, 0, 0],
	          renderTo: "selected-chart"
	        },
	        legend: { enabled: false },
	        credits: { enabled: false },
	        plotOptions: {
	          area: { fillOpacity: 0.25 },
	          series: {
	            lineWidth: 2,
	            marker: { enabled: false },
	            shadow: false
	          }
	        },
	        series: [
	          {
	            color: "#264870",
	            data: sparkAppropTotalArray
	          }, {
	            color: "#4c7099",
	            data: sparkExpendTotalArray
	          }
	        ],
	        title: null,
	        tooltip: { enabled: false },
	        xAxis: {
	          labels: { enabled: false },
	          lineWidth: 0,
	          maxPadding: 0,
	          minPadding: 0
	        },
	        yAxis: {
	          endOnTick: false,
	          gridLineWidth: 0,
	          labels: { enabled: false },
	          min: Math.min.apply( Math, minValuesArray ),
	          maxPadding: 0,
	          minPadding: 0,
	          text: null
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
		if ($('#' + itemId + '-expanded').length == 0)
		{
			//console.log('showing detail');
			$('.budget-expand-img').attr('src', '/budget/images/expand.png');
			$('#breakdown .expanded-content').remove();
			$('#breakdown tr').removeClass('expanded-head');
			$('#' + itemId + ' .budget-expand-img').attr('src', '/budget/images/collapse.png');
			$(detail).insertAfter($('#' + itemId));
			$('#' + itemId).addClass('expanded-head');
		}
		else
		{
			//console.log('hiding all details');
			$('.budget-expand-img').attr('src', '/budget/images/expand.png');
			$('#breakdown .expanded-content').remove();
			$('#breakdown tr').removeClass('expanded-head');
		}
	}
  	
  	//gets fund or department totals per year for highcharts  	
	function getTotalArray(name, forDepartment, isAppropriation, callback) {
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
		{
			if (forDepartment)
				myQuery += " WHERE 'Department ID' = '" + name + "'";
			else
				myQuery += " WHERE 'Fund' = '" + name + "'";
		}
		
		getQuery(myQuery).send(callback);
	}
	
	//returns all funds budgeted/spent totals for given year
	function getAllFundsForYear(year, callback) {		
		var myQuery = "SELECT Fund, SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', Fund AS '" + year + "' FROM " + fusionTableId + " GROUP BY Fund";			
		getQuery(myQuery).send(callback);
	}
	
	//returns all funds budgeted/spent totals for given year
	function getDepartmentsForFund(fund, year, callback) {		
		var myQuery = "SELECT 'Short Title', SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', 'Short Title' AS '" + year + "', 'Department ID' FROM " + fusionTableId + " WHERE Fund = '" + fund + "' GROUP BY 'Department ID', 'Short Title'";			
		getQuery(myQuery).send(callback);
	}
	
	function getFundDescription(fund, callback) {
		var myQuery = "SELECT 'Fund Description' FROM " + fundDescriptionTableId + " WHERE Item = '" + fund + "'";			
		getQuery(myQuery).send(callback);
	}
	
	function getDepartmentDescription(departmentId, callback) {
		var myQuery = "SELECT 'Department ID', Department, 'Link to Website', 'Department Description', 'Control Officer' FROM " + fusionTableId + " WHERE 'Department ID' = " + departmentId;			
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
	
	function updateSparkAppropTotal(response) {
		sparkAppropTotalArray = getDataAsArray(response);
		updateSparkline();
	}
	
	function updateSparkExpendTotal(response) {
		sparkExpendTotalArray = getDataAsArray(response);
		updateSparkline();
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
		console.log('rows found: ' + numRows);
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
		  if (fundView != null && fundView != "") {
		    rowId = "department-" + departmentId;
			detailLoadFunction = "getDepartmentDetails(\"department-" + departmentId + "\");";
		  }
		  
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
		var fusiontabledata;
		  
		fusiontabledata = "<tr class='expanded-content' id='" + itemId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>" + convertToPlainString(itemId) + "</h2>";
		fusiontabledata += "		<p id='fund-description'></p>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><a class='adr' href='/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "' rel='address:/?year=" + loadYear + "&amp;fund=" + convertToQueryString(itemId) + "'>Breakdown by department&nbsp;&raquo;</a></li>";
		//fusiontabledata += "		  <li><a href='#'>Breakdown by control officer&nbsp;&raquo;</a></li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='selected-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><strong>x.x%</strong> budgeted from 2010</li>";
		fusiontabledata += "		  <li><strong>y.y%</strong> spent from 2010</li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		updateDetail(itemId, fusiontabledata);
		getFundDescription(convertToPlainString(itemId), updateFundDescription);

		getTotalArray(convertToPlainString(itemId), false, true, updateSparkAppropTotal);
		getTotalArray(convertToPlainString(itemId), false, false, updateSparkExpendTotal);
	}
	
	function updateFundDescription(response) {
		var description = 'Description not available';
		
		if (response.getDataTable().getNumberOfRows() > 0)
			description = response.getDataTable().getValue(0, 0);
			
		$('#fund-description').fadeOut('fast', function(){
			$('#fund-description').html(description);
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
		
		fusiontabledata = "<tr class='expanded-content' id='department-" + departmentId + "-expanded'>";
		fusiontabledata += "	<td colspan='5'>";
		fusiontabledata += "  <div class='expanded-primary'>";
		fusiontabledata += "		<h2>" + department + "</h2>";
		fusiontabledata += "		<p>" + description + "</p>";
		fusiontabledata += "		<ul class='stats'>";
		if (controlOfficer != '')
			fusiontabledata += "		  <li>Control officer: " + controlOfficer + "</li>";
		if (linkToWebsite != '')
			fusiontabledata += "		  <li><a href='" + linkToWebsite + "'>Official website &raquo;</a></li>";	
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	  <div class='expanded-secondary'>";
		fusiontabledata += "		<div class='sparkline' id='selected-chart'></div>";
		fusiontabledata += "		<ul class='stats'>";
		fusiontabledata += "		  <li><strong>x.x%</strong> budgeted from 2010</li>";
		fusiontabledata += "		  <li><strong>y.y%</strong> spent from 2010</li>";
		fusiontabledata += "		</ul>";
		fusiontabledata += "	  </div>";
		fusiontabledata += "	</td>";
		fusiontabledata += "  </tr>";
		updateDetail('department-' + departmentId, fusiontabledata);
		
		getTotalArray(departmentId, true, true, updateSparkAppropTotal);
		getTotalArray(departmentId, true, false, updateSparkExpendTotal);
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
		return (Text+'').replace(/\-+/g, '+');
	}
	
	function convertToPlainString(Text)
	{
	    if (Text == undefined) return '';
	    
		return (Text+'').replace(/\++/g, ' ')
		.replace(/\-+/g, ' ');
	}