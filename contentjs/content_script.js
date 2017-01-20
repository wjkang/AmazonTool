var images = [];

$("td.tdThumb img").each(function () {
    images.push($(this).attr("src"));
});


var msg = {
    platform: "eBay美国站",
    url: window.location.href,
    listing_name: $("#itemTitle").text(),
    listing_image: $("#icImg").attr('src'),
    listing_price: $("#prcIsum").text(),
    listing_watching: $("#vi-bybox-watchers").text(),
    listing_location: $("#itemLocation").text(),
    listing_images: images
};
chrome.runtime.sendMessage(msg);

//登录界面获取登录邮箱
$(function(){
$("#sign-in-button").click(function () {
    var SignInEmail = $("#username").val();
    console.log(SignInEmail);
    chrome.extension.sendRequest({ result: requestCode.Email, data:SignInEmail});
});
$("#signInSubmit").click(function () {
    var SignInEmail = $("#ap_email").val();
    console.log(SignInEmail);
    chrome.extension.sendRequest({ result: requestCode.Email, data: SignInEmail });
});
});
var requestCode = {
    Email: 5
};


