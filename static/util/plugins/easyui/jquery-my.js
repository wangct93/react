$(document).ajaxError(function(event,xhr,settings){
    if(xhr.status==999){
		  	var proName = top.window.location.pathname.split("/")[1];
	 		top.window.location.href= "http://"+window.location.host+"/"+proName;
	 		return;
    }
});
$.preloadImages = function() {
  for (var i = 0; i < arguments.length; i++) {
   	 $("<img/>").attr("src", arguments[i]);
  }
}
 
function formatter2(date){
    if (!date){return '';}
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    return y + '-' + (m<10?('0'+m):m);
}
function parser2(s){
    if (!s){return null;}
    var ss = s.split('-');
    var y = parseInt(ss[0],10);
    var m = parseInt(ss[1],10);
    if (!isNaN(y) && !isNaN(m)){
        return new Date(y,m-1,1);
    } else {
        return new Date();
    }
}

function getQueryString(name) {    
  	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");    
  	var search = window.location.search.substr(1);
  	var href = window.location.href;
  	if(href.indexOf("?")>=0){
  		search = href.substr(href.indexOf("?")+1);
  	}
  	var r = search.match(reg);    
  	if (r != null) return unescape(r[2]); return null;    
 }