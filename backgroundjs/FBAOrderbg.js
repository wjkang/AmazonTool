var FBA = {};
FBA.SignInEmail = "";
FBA.Msg = [];
FBA.Status = 0;//1请求中，0未请求
FBA.RequestCode = {
    "Progress": 1,
    "SingleError": 2,
    "SingleSuccess": 3,
    "AllComplete": 4,
    "Email": 5
};
chrome.extension.onRequest.addListener(
    function (request) {
        console.log(request);
        if (request.result == FBA.RequestCode.AllComplete) {
            FBA.Status = 0;
        }
        else if (request.result == FBA.RequestCode.Progress) {
            FBA.Status = 1;
            FBA.Msg = [];
        }
        else if (request.result == FBA.RequestCode.Email) {
            FBA.SignInEmail = request.data;
        }
        else if (request.result == FBA.RequestCode.SingleSuccess) {
            FBA.Msg.push('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步' + request.msg + '完成。</div>');
        }
        else if (request.result == FBA.RequestCode.SingleError) {
            FBA.Msg.push('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>同步失败,来源：' + request.msg + '.' + request.code + '</div>');
        }
    });
