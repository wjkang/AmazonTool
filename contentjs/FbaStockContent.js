var FbaStockObj = {};
FbaStockObj.Files = [];
FbaStockObj.CheckboxTpl = '<input type="checkbox" name="StockInsertCheckbox" />';
FbaStockObj.host = location.host;
//获取站点
FbaStockObj.MarketPlace = $("#sc-mkt-switcher-select").val();
if(!FbaStockObj.MarketPlace){
    FbaStockObj.MarketPlace = $("#sc-mkt-picker-switcher-select").val();
}
FbaStockObj.SignInEmail = "";
FbaStockObj.urlPro = "https://";
FbaStockObj.fileCount = 0;
FbaStockObj.RequestCode = {
    "Progress": 6,
    "SingleError": 7,
    "SingleSuccess": 8,
    "AllComplete": 9,
    "FreeSelectFile": 10,
    "CancelFreeSelectFile": 11,
    "GetFiles": 12,
    "RefreshFiles": 13,
    "StartSync": 14
};
FbaStockObj.insetCheckbox = function () {
    var trs = $("#downloadArchive tbody tr");
    $.each(trs, function () {
        $(this).find("td:last-child").append(FbaStockObj.CheckboxTpl);
    });
};
FbaStockObj.removeCheckbox = function () {
    $("input[type=checkbox][name=StockInsertCheckbox]").remove();
}
FbaStockObj.SyncFbaStocks = function () {
    FbaStockObj.MarketPlace = $("#sc-mkt-switcher-select").val();
    if(!FbaStockObj.MarketPlace) {
        FbaStockObj.MarketPlace = $("#sc-mkt-picker-switcher-select").val();
    }
    if(FbaStockObj.MarketPlace&&FbaStockObj.MarketPlace.indexOf("marketplaceId")>-1)
    {
        FbaStockObj.MarketPlace=FbaStockObj.MarketPlace.match(/.*marketplaceId=(.*)&.*/)[1];
    }
    //是否日本站
    var isJapanSite = (FbaStockObj.host.indexOf("jp") > -1)||(FbaStockObj.host.indexOf("japan") > -1) ? true : false;
    FbaStockObj.MarketPlace = isJapanSite ? 'A1VC38T7YXB528' : FbaStockObj.MarketPlace;
    chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.Progress });
    var trs = $("#downloadArchive tbody tr");
    var files = [];
    $.each(trs, function () {
        var requestDate = $(this).find("td:last-child").prev().html();
        var link = $(this).find("td:last-child").find("a[name=Download]").attr("href");
        if (link) {
            files.push({ requestDate: requestDate, link: link });
        }
    });
    if (files.length <= 0) {
        chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.SingleError, code: "", msg: "未获取到下载地址" });
        chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.AllComplete });
        return;
    }
    $.each(files, function () {
        FbaStockObj.SyncFbaStock(this);
    });

};
FbaStockObj.SyncFbaStocksFree = function () {
    //是否日本站
    var isJapanSite = (FbaStockObj.host.indexOf("jp") > -1)||(FbaStockObj.host.indexOf("japan") > -1) ? true : false;
    FbaStockObj.MarketPlace = isJapanSite ? 'A1VC38T7YXB528' : FbaStockObj.MarketPlace;
    chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.Progress });
    FbaStockObj.fileCount = FbaStockObj.Files.length;
    $.each(FbaStockObj.Files, function () {
        FbaStockObj.SyncFbaStock(this);
    });
};
FbaStockObj.SyncFbaStock = function (urlObj) {
    var url = urlObj.link.replace(/&amp;/g, "&");
    var requestDate = urlObj.requestDate.replace(/\s/g, "");
    if(/^[a-zA-Z]/.test(requestDate))
    {
        var month=requestDate.match(/[a-zA-Z]/g).toString().replace(/,/g,"");
        requestDate=requestDate.replace(month,"").replace(",",month);
    }
    var fileName = requestDate+".txt";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            var blob = new Blob([this.response], { type: " text/plain" });
            var xhr1 = new XMLHttpRequest();
            xhr1.open("POST", AmazonConfig.bossFbaStockUrl, true);
            xhr1.onreadystatechange = function (e) {
                if (this.readyState == 4 && this.status == 200) {
                    //后台抛异常
                    var json = JSON.parse(this.responseText);
                    if (json.statusCode == "2") {
                        chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.SingleError, code: 0, msg: json.message });
                    }
                    else {
                        chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.SingleSuccess, msg: fileName });
                    }
                    console.log(this.responseText);
                    FbaStockObj.EmitCompleteEvent();
                }
                else if (this.readyState == 4 && this.status != 200) {
                    chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.SingleError, code: this.status, msg: "BOSS" });
                    FbaStockObj.EmitCompleteEvent();
                }
            };
            var formData = new FormData();
            formData.append("File", blob, fileName);
            formData.append("MarketPlace", FbaStockObj.MarketPlace);
            formData.append("SignInEmail", FbaStockObj.SignInEmail);
            formData.append("RequestDate",requestDate);
            xhr1.send(formData);

        }
        else if (this.readyState == 4 && this.status != 200) {
            FbaStockObj.EmitCompleteEvent();
            chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.SingleError, code: this.status, msg: "Amazon" });
        }

    };
    xhr.send();
};
//动态插入的checkbox委托事件
$("#downloadArchive tbody tr").on("click", "input[name=StockInsertCheckbox]", function () {
    if ($(this).prop("checked")) {
        var requestDate = $(this).parent().prev().html();
        var link = $(this).prev().attr("href");
        FbaStockObj.Files.push({ requestDate: requestDate, link: link });
    }
    else {
        var link = $(this).prev().attr("href");
        FbaStockObj.Files.removeFile(link);
        console.log(FbaStockObj.Files);
    }
    //更新文件数到bg
    chrome.runtime.sendMessage({ result: FbaStockObj.RequestCode.RefreshFiles, files: FbaStockObj.Files });
});
chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.result == FbaStockObj.RequestCode.FreeSelectFile) {
            FbaStockObj.insetCheckbox();
            //往bg传递消息
            chrome.runtime.sendMessage(request);
        }
        else if (request.result == FbaStockObj.RequestCode.CancelFreeSelectFile) {
            FbaStockObj.removeCheckbox();
            FbaStockObj.Files = [];
            //往bg传递消息
            chrome.runtime.sendMessage(request);
        }
        else if (request.result == FbaStockObj.RequestCode.StartSync) {
            FbaStockObj.SignInEmail = request.email;
            if (request.free) {
                FbaStockObj.SyncFbaStocksFree();
            }
            else {
                FbaStockObj.SyncFbaStocks();
            }
        }

    });
FbaStockObj.EmitCompleteEvent = function () {
    FbaStockObj.fileCount--;
    if (FbaStockObj.fileCount <= 0) {
        chrome.extension.sendRequest({ result: FbaStockObj.RequestCode.AllComplete });
    }
}
Array.prototype.removeFile = function (link) {
    var index = -1;
    for (var i = 0; i <= this.length; i++) {
        if (this[i].link == link) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        this.splice(index, 1);
    }
}