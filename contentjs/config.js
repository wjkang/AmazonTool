var AmazonConfig={
    //bossFbaStockUrl:'https://admin.sjlpj.cn/AmazonFbaBill/UploadBillFile',
    bossFbaStockUrl:'https://admin.sjlpj.cn/AmazonFbaStock/UploadBillFile',
    FbaStockFileLinkReg:/<a class="buttonImage" name="Download"(.|\n)*?<\/a>/g,
    FbaStockFileReg:/(?!href=")(http.*\d)/g,
}