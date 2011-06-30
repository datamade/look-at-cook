// Currency
jQuery.fn.dataTableExt.oSort['currency-asc'] = function(a,b) {
	/* Remove any commas (assumes that if present all strings will have a fixed number of d.p) */
	var x = a == "-" ? 0 : a.replace( /,/g, "" );
	var y = b == "-" ? 0 : b.replace( /,/g, "" );
	
	/* Remove the currency sign */
	x = x.substring( 1 );
	y = y.substring( 1 );
	
	/* Parse and return */
	x = parseFloat( x );
	y = parseFloat( y );
	return x - y;
};

jQuery.fn.dataTableExt.oSort['currency-desc'] = function(a,b) {
	/* Remove any commas (assumes that if present all strings will have a fixed number of d.p) */
	var x = a == "-" ? 0 : a.replace( /,/g, "" );
	var y = b == "-" ? 0 : b.replace( /,/g, "" );
	
	/* Remove the currency sign */
	x = x.substring( 1 );
	y = y.substring( 1 );
	
	/* Parse and return */
	x = parseFloat( x );
	y = parseFloat( y );
	return y - x;
};