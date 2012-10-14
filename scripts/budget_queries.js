/*!
 * Look at Cook Budget Queryies library
 * http://lookatcook.com/
 *
 * Copyright 2012, Derek Eder and Nick Rougeux
 * Licensed under the MIT license.
 * https://github.com/open-city/look-at-cook/wiki/License
 *
 * Date: 3/24/2012
 *
 * Fusion Table queries called by BudgetLib
 * 
 */

var BudgetQueries = BudgetQueries || {};  
var BudgetQueries = {

  //gets fund or department totals per year for highcharts  	
	getTotalArray: function(name, queryType, isAppropriation, callback) {
		var typeStr = "Expenditures";
		if (isAppropriation == true) 
			typeStr = "Appropriations";

		var myQuery = "SELECT ";
		var year = BudgetLib.startYear;
		while (year <= BudgetLib.endYear)
		{
			myQuery += "SUM('" + typeStr + " " + year + "') AS '" + year + "', ";
			year++;
		}
		myQuery = myQuery.slice(0,myQuery.length-2);  
		myQuery += " FROM " + BudgetLib.BUDGET_TABLE_ID;
		if (name != '')
			myQuery += " WHERE '" + queryType + "' = '" + name + "'";
		
		BudgetHelpers.query(myQuery, callback);
	},
	
	//returns total given year
	getTotalsForYear: function(name, queryType, year, callback) {
		var whereClause = "";
		if (name != "")
			whereClause = " WHERE '" + queryType + "' = '" + name + "'";
		
		var percentageQuery = "";	
		if (year > BudgetLib.startYear) {
			percentageQuery = ", SUM('Appropriations " + year + "') AS 'Appropriations Top', SUM('Expenditures " + year + "') AS 'Expenditures Top', SUM('Appropriations " + (year - 1) + "') AS 'Appropriations Bottom', SUM('Expenditures " + (year - 1) + "') AS 'Expenditures Bottom'";
		}
			
		var myQuery = "SELECT SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures' " + percentageQuery + " FROM " + BudgetLib.BUDGET_TABLE_ID + whereClause;			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//returns all funds budgeted/spent totals for given year
	getAllFundsForYear: function(year, callback) {		
		var myQuery = "SELECT Fund, SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', Fund AS '" + year + "' FROM " + BudgetLib.BUDGET_TABLE_ID + " GROUP BY Fund";			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//returns all funds budgeted/spent totals for given year
	getDepartments: function(name, queryType, year, callback) {		
		var myQuery = "SELECT 'Short Title', SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', 'Short Title' AS '" + year + "', 'Department ID' FROM " + BudgetLib.BUDGET_TABLE_ID + " WHERE '" + queryType + "' = '" + name + "' GROUP BY 'Department ID', 'Short Title'";			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//returns all control officers budgeted/spent totals for given year
	getAllControlOfficersForYear: function (year, callback) {		
		var myQuery = "SELECT 'Control Officer', SUM('Appropriations " + year + "') AS 'Appropriations', SUM('Expenditures " + year + "') AS 'Expenditures', 'Control Officer' AS '" + year + "' FROM " + BudgetLib.BUDGET_TABLE_ID + " GROUP BY 'Control Officer'";			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//gets a fund description based on a fund name
	getFundDescription: function(fund, callback) {
		var myQuery = "SELECT 'Fund Description' FROM " + BudgetLib.FUND_DESCRIPTION_TABLE_ID + " WHERE Item = '" + fund + "'";			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//get a control officer description based on the officer name
	getControlOfficerDescription: function(officer, callback) {
		var myQuery = "SELECT 'Control Officer Description' FROM " + BudgetLib.OFFICER_DESCRIPTION_TABLE_ID + " WHERE Item = '" + officer + "'";			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//get a department description from a department ID
	getDepartmentDescription: function(departmentId, callback) {
		var myQuery = "SELECT 'Department ID', Department, 'Link to Website', 'Department Description', 'Control Officer', Fund FROM " + BudgetLib.BUDGET_TABLE_ID + " WHERE 'Department ID' = " + departmentId;			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//get percentage change per year for display below the sparkline in expanded row detail
	getSparklinePercentages: function(name, queryType, year, callback) {	
		if (year > BudgetLib.startYear) {
			var whereClause = "";
			if (queryType != "")
				whereClause += " WHERE '" + queryType + "' = '" + name + "'";
				
			var myQuery = "SELECT SUM('Appropriations " + year + "') AS 'Appropriations Top', SUM('Expenditures " + year + "') AS 'Expenditures Top', SUM('Appropriations " + (year - 1) + "') AS 'Appropriations Bottom', SUM('Expenditures " + (year - 1) + "') AS 'Expenditures Bottom' FROM " + BudgetLib.BUDGET_TABLE_ID + whereClause;			
			BudgetHelpers.query(myQuery, callback);
		}
	}
}