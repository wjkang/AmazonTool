document.addEventListener('DOMContentLoaded', function () {
    $("#tab").tabs({ tabPosition: 'left', plain: false });

    /*var listingInfo = chrome.extension.getBackgroundPage().listingInfo;
    *//**
     *  在线抓产品
     *//*
$("#platform").html(listingInfo.platform);
$("#listing_name").html(listingInfo.listing_name);
$("#listing_image").html("<img src='" + listingInfo.listing_image + "' style='width:300px;height:300px'>");
$("#listing_price").text(listingInfo.listing_price);
$("#listing_watching").text(listingInfo.listing_watching);
$("#listing_location").text(listingInfo.listing_location);

var htmls = "<div class='row'>";
for (var i = 0; i < listingInfo.listing_images.length; i++) {
htmls += "<div class='col-xs-3 col-md-3'><a href='#' class='thumbnail'><img src='" + listingInfo.listing_images[i] + "'></a></div>"
}
htmls += "</div>";

$("#listing_images").html(htmls);*/

    /**
     *  FBA订单
     **/
    var FBA = chrome.extension.getBackgroundPage().FBA;//引用，修改会影响到BG
    if (FBA.Status == 1) {
        $("#FBA_btn").attr("disabled", "false");
        $("#FBA_btn").html("请求中...");
    }
    else if (FBA.Status == 0) {
        $("#FBA_btn").removeAttr("disabled");
    }
    /**
     * FBA库存
     **/
    var FBAStock = chrome.extension.getBackgroundPage().FbaStock;
    console.log(FBAStock);
    if (FBAStock.Status == 1) {
        $("#Stock_btn").attr("disabled", "false");
        $("#Stock_btn").html("请求中...");
    }
    else if (FBAStock.Status == 0) {
        $("#Stock_btn").removeAttr("disabled");
    }
    if (FBAStock.FreeSelectFile) {
        $("#StockFree").attr("checked", "checked");
    }


    var date = new Date();
    var email = FBA.SignInEmail;
    if (email == "") {
        $("#FBA").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>无法获取登录邮箱! 请关闭浏览器,重新登录</div>');
        $("#FBA_btn").attr("disabled", "false");
        $("#FBAStock").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>无法获取登录邮箱! 请关闭浏览器,重新登录</div>');
        $("#Stock_btn").attr("disabled", "false");
    }
    var ajaxParams = "month=" + (date.getMonth() + 1) + "&year=" + date.getFullYear() + "&timeRangeType=Monthly&reportType=Transaction";
    console.log(ajaxParams);
    //线上配置
    var amazonUrl = '{"name":"订单明细","SignInEmail":"' + email + '","genurl":"/gp/payments-account/generate-date-range-report.html","url":"/gp/payments-account/date-range-reports.html/ref=ag_xx_cont_xx","ajaxOption":{"method":"post","params":"' + ajaxParams + '","type":"html"},"regex":/<a class="buttonImage" name="Download"(.|\\n)*?<\\/a>/g,"regex1":/(?!href=")(http.*\\d)/g}';
    var bossUrl = "https://.../AmazonFbaBill/UploadBillFile";
    //测试配置
    //var amazonUrl='{"name":"订单明细","genurl":"/gp/payments-account/generate-date-range-report.html","url":"/AmazonPage/Payments%20-%20Amazon%20Seller%20Central.html","ajaxOption":{"method":"post","params":"startDate=1464796800&endDate=1464969599&timeRangeType=Custom&reportType=Transaction&startDateDay=2&startDateMonth=6&startDateYear=2016&endDateDay=3&endDateMonth=6&endDateYear=2016&generationDate=1464969600","type":"html"},"regex":/<a class="buttonImage" name="Download"(.|\\n)*?<\\/a>/g,"regex1":/(?!href=")(http.*\\d)/g}';
    //var bossUrl="http://localhost:2252/AmazonFbaBill/UploadBillFile";
    //FBA订单页面事件
    $("#FBA_btn").click(function () {
        $(this).parent().parent().find(".alert-dismissable").remove();
        $(this).attr("disabled", "false");
        console.log("SyncFbaOrders(" + amazonUrl + ",'" + bossUrl + "')");
        chrome.tabs.executeScript(null, { code: "FbaObj.SyncFbaOrders(" + amazonUrl + ",'" + bossUrl + "')" });
    });
    //FBA库存页面事件
    $("#Stock_btn").click(function () {
        if ($("#StockFree").prop("checked") && FBAStock.Files.length <= 0) {
            $("#FBAStock").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> 请勾选要同步的文件 </div>');
            return false;
        }
        $(this).parent().parent().find(".alert-dismissable").remove();
        $(this).attr("disabled", "false");
        if ($("#StockFree").prop("checked")) {
            chrome.tabs.getSelected(function (tab) {
                chrome.tabs.sendMessage(tab.id, { result: FBAStock.RequestCode.StartSync,email:email,free: true });
            });
        }
        else {
            chrome.tabs.getSelected(function (tab) {
                chrome.tabs.sendMessage(tab.id, { result: FBAStock.RequestCode.StartSync,email:email,free: false });
            });
        }
    });
    $("#StockFree").click(function () {
        if ($(this).prop("checked")) {
            chrome.tabs.getSelected(function (tab) {
                chrome.tabs.sendMessage(tab.id, { result: FBAStock.RequestCode.FreeSelectFile });
            });
        } else {
            chrome.tabs.getSelected(function (tab) {
                chrome.tabs.sendMessage(tab.id, { result: FBAStock.RequestCode.CancelFreeSelectFile });
            });
        }
    });
    console.log(FBA.Msg);
    $.each(FBA.Msg, function (index, data) {
        $("#FBA").prepend(data);
    });
    $.each(FBAStock.Msg, function (index, data) {
        $("#FBAStock").prepend(data);
    });
    chrome.extension.onRequest.addListener(
        function (request) {
            console.log(request);
            if (request.result == FBA.RequestCode.Progress) {
                $("#FBA_btn").html("同步中...");
            }
            else if (request.result == FBA.RequestCode.SingleSuccess) {
                $("#FBA").prepend('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步' + request.msg + '完成。</div>');
            }
            else if (request.result == FBA.RequestCode.SingleError) {
                $("#FBA").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步失败,来源：' + request.msg + '.' + request.code + '</div>');
            }
            else if (request.result == FBA.RequestCode.AllComplete) {
                $("#FBA_btn").removeAttr("disabled");
                $("#FBA_btn").html("立即同步FBA订单报告");
            }
            //FBA库存
            else if (request.result == FBAStock.RequestCode.Progress) {
                $("#Stock_btn").html("同步中...");
            }
            else if (request.result == FBAStock.RequestCode.SingleSuccess) {
                $("#FBAStock").prepend('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步' + request.msg + '完成。</div>');
            }
            else if (request.result == FBAStock.RequestCode.SingleError) {
                $("#FBAStock").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步失败,来源：' + request.msg + '.' + request.code + '</div>');
            }
            else if (request.result == FBAStock.RequestCode.AllComplete) {
                $("#Stock_btn").removeAttr("disabled");
                $("#Stock_btn").html("立即同步FBA库存明细");
            }
        });
});

