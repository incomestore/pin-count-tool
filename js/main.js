var homeUrl = "http://pinplugins.com/pincount/";

var baseApiUrl = "https://widgets.pinterest.com/v1/urls/count.json?callback=?";
//Example: https://widgets.pinterest.com/v1/urls/count.json?callback=receiveCount&url=http://pinterest.com/

var mainUrlCount = 0;

//Get pin counts for 4 main URLs, append to results and add total
function getPinCountMain(urlArray, strippedUrl) {
    //Show bottom sections
    $("#url_variation_container").show();
    
    $.getJSON(baseApiUrl, { url: urlArray[0] }, function (data) {
        processMainUrlVariation(urlArray[0], data.count);
        
        $.getJSON(baseApiUrl, { url: urlArray[1] }, function (data) {
            processMainUrlVariation(urlArray[1], data.count);

            $.getJSON(baseApiUrl, { url: urlArray[2] }, function (data) {
                processMainUrlVariation(urlArray[2], data.count);
                
                $.getJSON(baseApiUrl, { url: urlArray[3] }, function (data) {
                    processMainUrlVariation(urlArray[3], data.count);
                    
                    //Show main url and total count
                    $("#results").append(strippedUrl + " has " + addCommasToNum(mainUrlCount) + " total" + pinOrPins(mainUrlCount));                    
                    
                    //processSampleUrls();
                });
            });
        });
    });
}

function processMainUrlVariation(url, pinCount) {
	//Add table row
	var dataRow = "<tr><td>" + url + "</td><td>" + addCommasToNum(pinCount) + "</td></tr>" + "\n";
	$("#url_variation_table").append(dataRow);
	
	//Add to total pin count
	mainUrlCount += pinCount;
}

//Get pin count for sample URL and set element's text
function getPinCountSampleUrl(urlToCheck, displayEle) {
	$.getJSON(baseApiUrl, { url: urlToCheck }, function (data) {      
        displayEle.text(addCommasToNum(data.count) + pinOrPins(data.count));
	});
}

//Each page load looks for a URL in the querystring to run
function processMainUrl() {
    $("#results").empty();

    //Strip down to base domain name then create variations
    
    //Trim in case trailing spaces
    var urlToCheck = $.trim(getParameterByName("url"));
    var originalUrl = urlToCheck;
    
    if (urlToCheck) {
        var usingHttps = false;
        
        //Remove https and set flag if using
        if (urlToCheck.substr(0, 8).toLowerCase() == "https://") {
            urlToCheck = urlToCheck.substr(8, urlToCheck.length);
            usingHttps = true;
        }
        else if (urlToCheck.substr(0, 7).toLowerCase() == "http://") {
            //Remove http if using
            urlToCheck = urlToCheck.substr(7, urlToCheck.length);
        }
        
        //Remove ending slash
        if (urlToCheck.charAt(urlToCheck.length - 1) == "/") {
            urlToCheck = urlToCheck.substr(0, urlToCheck.length - 1);
        }        
        
        //Remove "www."
        if (urlToCheck.substr(0, 4).toLowerCase() == "www.") {
            urlToCheck = urlToCheck.substr(4, urlToCheck.length);
        }        
        
        //Save stripped URL
        var strippedUrl = urlToCheck;
        
        //Set the 4 variations of the url
        //Add "http://" or "https://" back
        var urlArray = [];
        urlArray[0] = addHttp(urlToCheck + "/", usingHttps);
        urlArray[1] = addHttp(urlToCheck, usingHttps);
        urlArray[2] = addHttp("www." + urlToCheck + "/", usingHttps);
        urlArray[3] = addHttp("www." + urlToCheck, usingHttps);
        
        getPinCountMain(urlArray, strippedUrl);
        
        //Set input box to original URL
        $("#url_to_check").val(originalUrl);
    }
    else {
        //processSampleUrls();
    }
}

//Display sample URL pin counts. Execute after main URL. (not using currently)
function processSampleUrls() {
    getPinCountSampleUrl("http://pinterest.com/", $("#pinterest_count_2"))
    getPinCountSampleUrl("http://pinterest.com", $("#pinterest_count_1"))
    getPinCountSampleUrl("http://www.pinterest.com/", $("#pinterest_count_4"))
    getPinCountSampleUrl("http://www.pinterest.com", $("#pinterest_count_3"))
}

//Get # of downloads for free button (jquery screen scrape)
function getFreePluginDownloadNum() {
	// References:
	// https://codex.wordpress.org/WordPress.org_API
	// http://code.tutsplus.com/tutorials/communicating-with-the-wordpress-org-plugin-api--wp-33069

	var pluginApiBaseUrl = '//api.wordpress.org/plugins/info/1.0/pinterest-pin-it-button.json';

	/*
	$.getJSON(pluginApiBaseUrl, function(data) {
		$("#num_downloads").text(addCommasToNum(data.downloaded));
	});
	*/

	$.ajax({
		url: pluginApiBaseUrl,
		dataType: "jsonp",
		success: function(data) {
			$("#num_downloads").text(addCommasToNum(data.downloaded));
		}
	});
}

//Add "http://" or "https://" to URL if no prefix
function addHttp(url, usingHttps) {
    if (url.length == 0) { return ""; }
 
    // if user has not entered http:// or https:// assume they mean http://
    if (!/^(https?):\/\//i.test(url)) {
        if (usingHttps) {
            return "https://" + url;
        }
        else {
            return "http://" + url;
        }
    }
    else {
        return url;
    }
}

//http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

//Format number with commas when 1,000+
function addCommasToNum(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

//Return pins singular or plural
function pinOrPins(pinCount) {
    if (pinCount != 1) {
        return " pins";
    }
    else {
        return " pin";
    }
}

//*** Doc Ready ***

$(document).ready(function () {
    //Init
    $("#page_title a").attr("href", homeUrl);
    
    //Process main url in case already in querystring
	processMainUrl();
    
    getFreePluginDownloadNum();
});
