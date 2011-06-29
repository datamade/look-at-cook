/*-------------------------------------------------------+
 | Utilizes event tracking in Google Analytics to track  |
 | clicks on outbound, document, email, and image links. |
 |                                                       |
 | Requires jQuery                                       |
 +-------------------------------------------------------*/

$(document).ready(function(){
  $('a').click(function() {
    var $a = $(this);
    var href = $a.attr("href");

    if ((href.match(/^http/i)) && (!href.match(document.domain))) {
      var category = "Outgoing";
      var event = "Click";
      var label = href;
      _gaq.push(['_trackEvent', category, event, label]);
    }
    
    if ( href.match(/\.(avi|css|doc|docx|exe|gif|js|jpg|mov|mp3|pdf|png|ppt|pptx|rar|txt|vsd|vxd|wma|wmv|xls|xlsx|zip)$/i) ) {
      var category = "Downloads";
      var event = "Click";
      var label = href;
      _gaq.push(['_trackEvent', category, event, label]);
    }
    
    if ( href.match(/^mailto:/i) ) {
      var category = "Emails";
      var event = "Click";
      var label = href;
      _gaq.push(['_trackEvent', category, event, label]);
    }
  });
});