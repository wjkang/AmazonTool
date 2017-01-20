var FbaStock = {};
FbaStock.SignInEmail = "";
FbaStock.FreeSelectFile = false;
FbaStock.Msg = [];
FbaStock.Files = [];
FbaStock.Status = 0;//1请求中，0未请求
FbaStock.RequestCode = {
    "Progress": 6,
    "SingleError": 7,
    "SingleSuccess": 8,
    "AllComplete": 9,
    "FreeSelectFile": 10,
    "CancelFreeSelectFile": 11,
    "GetFiles": 12,
    "RefreshFiles": 13,
    "StartSync":14
};
chrome.extension.onRequest.addListener(
    function (request) {
        console.log(request);
        if (request.result == FbaStock.RequestCode.AllComplete) {
            FbaStock.Status = 0;
            FbaStock.Files = [];
        }
        else if (request.result == FbaStock.RequestCode.Progress) {
            FbaStock.Status = 1;
            FbaStock.Msg = [];
        }
        else if (request.result == FbaStock.RequestCode.Email) {
            FbaStock.SignInEmail = request.data;
        }
        else if (request.result == FbaStock.RequestCode.SingleSuccess) {
            FbaStock.Msg.push('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步' + request.msg + '完成。</div>');
        }
        else if (request.result == FbaStock.RequestCode.SingleError) {
            FbaStock.Msg.push('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步失败,来源：' + request.msg + '.' + request.code + '</div>');
        }
    });
chrome.runtime.onMessage.addListener(function (request) {
    if (request.result == FbaStock.RequestCode.FreeSelectFile) {
        FbaStock.FreeSelectFile = true;
    }
    else if (request.result == FbaStock.RequestCode.CancelFreeSelectFile) {
        FbaStock.FreeSelectFile = false;
        FbaStock.Files = [];
    }
    else if (request.result == FbaStock.RequestCode.RefreshFiles) {
        FbaStock.Files = request.files;
    }
});
