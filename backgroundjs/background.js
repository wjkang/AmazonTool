function getDomainFromUrl(url){
	var host = "null";
	if(typeof url == "undefined" || null == url)
		url = window.location.href;
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

function checkForValidUrl(tabId, changeInfo, tab) {
	chrome.pageAction.show(tabId);
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	chrome.pageAction.show(tabId);
});

var listingInfo = {};
listingInfo.error = "加载中...";
chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
	listingInfo = request;
});



