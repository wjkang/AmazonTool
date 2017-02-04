/**
 * FBA订单同步
 * */
var FbaObj={};

FbaObj.bossUrl="";
FbaObj.host=location.host;
//获取站点
FbaObj.MarketPlace=$("#sc-mkt-switcher-select").val();
/*var downLoadLink=$(".drrDocumentGroupTable").find("a[name='Download']");
$.each(downLoadLink,function(){
    $(this).parent().append("<input type='checkbox'/>");
});*/
FbaObj.SignInEmail="";
FbaObj.urlPro="https://";
FbaObj.fileCount=0;
FbaObj.requestCode = {
    Progress: 1,
    SingleError: 2,
    SingleSuccess: 3,
    AllComplete:4,
    Email:5,
    FBAStockProgress:6,
    FBAStockSingleError:7,
    FBAStockSingleSuccess:8,
    FBAStockAllComplete:9
};
FbaObj.SyncFbaOrders=function(url,bUrl){
    //是否日本站
    var isJapanSite=(FbaObj.host.indexOf("jp")>-1)||(FbaObj.host.indexOf("japan")>-1)?true:false;
    FbaObj.MarketPlace=isJapanSite?'A1VC38T7YXB528':FbaObj.MarketPlace;
    if(!FbaObj.MarketPlace){
        FbaObj.MarketPlace=$("#sc-mkt-switcher-select").val();
    }
    FbaObj.bossUrl=bUrl;
    FbaObj.SignInEmail=url.SignInEmail;
    chrome.extension.sendRequest({result: FbaObj.requestCode.Progress});
    var arrLink=$("a[role=button]");
    if(arrLink==null)
    {
        url.regex=/<a class="buttonImage" name="下载"(.|\n)*?<\/a>/g;//日本站
        arrLink = url.regex && data.match(url.regex);
    }
    console.log(arrLink);
    if (arrLink !== null && arrLink.length > 0) {
        FbaObj.fileCount=arrLink.length;
        $.each(arrLink, function () {
                //var downUrl = this.match(url.regex1)[0].replace(/&amp;/g, "&");
                var downUrl=$(this).attr("href");
                downUrl=downUrl.replace(/&amp;/g, "&");
                FbaObj.SyncFbaOrder(downUrl, FbaObj.bossUrl);
            }
        )
    }
    else
    {
        chrome.extension.sendRequest({result: FbaObj.requestCode.SingleError,code:"",msg:"未获取到下载地址"});
        chrome.extension.sendRequest({result: FbaObj.requestCode.AllComplete});
    }
    /*setTimeout(function() {
        var promise = $.ajax({
            type: 'get',
            url: FbaObj.urlPro + FbaObj.host + url.url,
            dataType: url.ajaxOption.type
        });
        promise.then(function (data) {
            //var arrLink = url.regex && data.match(url.regex);
            arrLink=$(".buttonImage[name=Download]");
            if(arrLink==null)
            {
                url.regex=/<a class="buttonImage" name="下载"(.|\n)*?<\/a>/g;//日本站
                arrLink = url.regex && data.match(url.regex);
            }
            console.log(arrLink);
            if (arrLink !== null && arrLink.length > 0) {
                FbaObj.fileCount=arrLink.length;
                $.each(arrLink, function () {
                        //var downUrl = this.match(url.regex1)[0].replace(/&amp;/g, "&");
                        var downUrl=$(this).attr("href");
                        downUrl=downUrl.replace(/&amp;/g, "&");
                        FbaObj.SyncFbaOrder(downUrl, FbaObj.bossUrl);
                    }
                )
            }
            else
            {
                chrome.extension.sendRequest({result: FbaObj.requestCode.SingleError,code:"",msg:"未获取到下载地址"});
                chrome.extension.sendRequest({result: FbaObj.requestCode.AllComplete});
            }
        },function(data){
            console.log(data);
            chrome.extension.sendRequest({result: FbaObj.requestCode.SingleError,code:data.statusText,msg:data.status});
            chrome.extension.sendRequest({result: FbaObj.requestCode.AllComplete});
        });
    },10000);*/
};
FbaObj.SyncFbaOrder=function(amazonUrl,bossUrl) {
    var fileName=amazonUrl.match(/(?!fileName=)(\d{4}.*\..{3})/)[0];
    if(!fileName.indexOf("_Monthly")>-1&&fileName.indexOf("Monthly")>-1) {
        fileName=fileName.replace("Monthly","_Monthly");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", amazonUrl, true);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function (e) {
        if (this.readyState == 4 && this.status == 200) {
            if(amazonUrl.indexOf("csv")>0) {
                var blob = new Blob([this.response],{type: "application/vnd.ms-excel"});
            }
            else{
                var blob = new Blob([this.response],{type: "application/pdf"});
            }
            var xhr1 = new XMLHttpRequest();

            xhr1.open("POST", bossUrl, true);

            xhr1.onreadystatechange = function (e) {
                if (this.readyState == 4 && this.status == 200) {
                    //后台抛异常
                    var json=JSON.parse(this.responseText);
                    if(json.statusCode=="2")
                    {
                        chrome.extension.sendRequest({result: FbaObj.requestCode.SingleError,code:0,msg:json.message});
                    }
                    else
                    {
                        chrome.extension.sendRequest({result: FbaObj.requestCode.SingleSuccess,msg:fileName});
                    }
                    console.log(this.responseText);
                    FbaObj.EmitCompleteEvent();
                }
                else if(this.readyState == 4 && this.status != 200)
                {
                    chrome.extension.sendRequest({result: FbaObj.requestCode.SingleError,code:this.status,msg:"BOSS"});
                    FbaObj.EmitCompleteEvent();
                }
            };
            var formData = new FormData();
            if(amazonUrl.indexOf("csv")>0) {
                formData.append("Type","csv");
                formData.append("File", blob,fileName);
            }
            else
            {
                formData.append("Type","pdf");
                formData.append("File", blob, fileName);
            }
            formData.append("MarketPlace",FbaObj.MarketPlace);
            formData.append("SignInEmail",FbaObj.SignInEmail);

            xhr1.send(formData);

        }
        else if(this.readyState == 4 && this.status != 200){
            FbaObj.EmitCompleteEvent();
            chrome.extension.sendRequest({result: FbaObj.requestCode.SingleError,code:this.status,msg:"Amazon"});
        }

    };
    xhr.send();
};
FbaObj.EmitCompleteEvent=function() {
    FbaObj.fileCount--;
    if(FbaObj.fileCount<=0)
    {
        chrome.extension.sendRequest({result: FbaObj.requestCode.AllComplete});
    }
}


