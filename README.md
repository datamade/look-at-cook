[Look at Cook](http://lookatcook.com)
=====================================

A budget transparency visualization for Cook County, IL (Chicago's county) displaying all county departments broken down by fund and control officer from 1993 to 2011. Done as a collaboration with Cook County Commissioner John Fritchey.

Dependencies
------------

- [jQuery](http://jquery.com)
- [Google Fusion Tables v1 API](https://developers.google.com/fusiontables/docs/v1/getting_started)
- [jQuery Address](http://www.asual.com/jquery/address/) (for RESTful URLs)
- [Highcharts](http://www.highcharts.com/) (for the line graph)
- [Datatables](http://datatables.net) (for the appropriations and expenditures lists)

Press
-----

- [O'reilly Radar](http://radar.oreilly.com/2011/09/look-at-cook-gov-data-visualization.html)
- [govfresh](http://govfresh.com/2011/09/beautiful-budgets-look-at-cook/)
- [Civic Commons](http://civiccommons.org/2011/11/look-at-cook-open-sourced/)
- [Metafilter Projects](http://projects.metafilter.com/3241/Look-at-Cook-A-Budget-Visualization-for-Cook-County-IL)

Overview
--------

This budget visualization is built entirely using HTML and jQuery. There is no server-side code, except for the stuff that happens behind the scenes with Google Fusion Tables. Even so, the data is fetched from Fusion Tables using the javascript Google Visualization API.

The bulk of the code is in /scripts/budget_lib.js. This file contains all of the init, data fetching, display and helper functions that the visualization uses to run. To get a good idea of how it works, you should first look at the data in Fusion Tables that it uses:

 - [Main budget table](https://www.google.com/fusiontables/DataSource?docid=16T1LB-lcPz6uQORLE7KtCc0sINMFF5EbsVaycoUU) (expenditures and appropriations per department per year)
 - [Fund descriptions](http://www.google.com/fusiontables/DataSource?dsrcid=1270538)
 - [Control officer descriptions](http://www.google.com/fusiontables/DataSource?dsrcid=1270539)

The data is read from these tables and the appropriate content on the page is updated via asynchronous callback (for more info on callbacks see: http://docs.jquery.com/Tutorials:How_jQuery_Works#Callback_and_Functions). Whenever a chart point or link are clicked or the URL changes, the jQuery address code detects the change and updates the page using the 'updateDisplay' function. The 'loadFor' function updates all the internal variables and sets the display mode to either default, control officer list, fund detail or control officer detail.

The appropriations and expenditures per year are then fetched based on the view using the 'getTotalArray' which in turn updates the main chart (which uses Highcharts) via 'updateMainChart'. The list of departments for that particular view are also fetched via 'getDepartments' which then calls 'getDataAsBudgetTable' to build an HTML table (which then uses DataTables to do sorting).

When a row is clicked, the details for that row are fetched and then displayed using either the 'getFundDetails', 'getControlOfficerDetails' or 'updateDepartmentDetails' functions. From inside that expanded row are links to other views (depending on your current view) which are handled the same way as above. 

View paths / hierarchy 
----------------------

Note: the year could also be updated by clicking on a point on the main chart.

 - List of funds (default view when loading the site) -> Expanded fund detail -> Fund view with list of departments -> Expanded department detail
 - List of control officers -> Expanded control officer detail -> Control officer view with list of departments -> Expanded department detail

Known issues
------------

 - Search engines: Because this is an AJAX application, the data that is displayed is NOT crawlable by search engines. I would love to fix this. See http://code.google.com/web/ajaxcrawling/docs/specification.html for more info
 - Special characters: Some of the data elements I'm filtering on don't have proper IDs or slugs in my Fusion Table. This results in the visualization not supporting special characters (anything that a URL wouldn't like) in the Fund and Control Officer name fields. Departments are ok because they each have a unique ID. I'd recommend using IDs for everything if you plan on making your own budget visualization.

Errors / bugs
-------------

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/open-city/look-at-cook/issues

You can also email me at derek.eder+git@gmail.com or tweet @derek_eder.

Note on patches/pull requests
-----------------------------
 
* Fork the project.
* Make your feature addition or bug fix.
* Commit and send me a pull request. Bonus points for topic branches.

Copyright
---------

Copyright (c) 2012 Derek Eder and Nick Rougeux. Released under the MIT License.

See LICENSE for details https://github.com/open-city/look-at-cook/wiki/License