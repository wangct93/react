/**
 * Created by Administrator on 2017/12/6.
 */


$(() => {
    $('#file').change(e => {
        let input = e.target;
        let {files,name} = input;
        let formData = new FormData();
        wt.forEach(files,(item,i) => {
            formData.append(name + '_' + i,item);
        });
        $.ajax({
            url:'/imageOCR',
            type:'post',
            processData:false,
            contentType:false,
            data:formData,
            success(data){
                console.log(data);
            }
        });
    });
    let config = {
        "AppId": "1256164624",
        "SecretId": "AKIDlLm23q0hlbCZjhywCE0Wnoa6uUs6oqQs",
        "SecretKey": "MTLxINDm5B4h39zZuymLfjeKkuoSqyqS",
        "Bucket":"ycc",
        "Region":"ap-beijing",
        "wxBucket":"ocr"
    };
    let {AppId,SecretId,SecretKey,wxBucket} = config;

    $.ajax({
        url:'http://recognition.image.myqcloud.com/ocr/general',
        type:'post',
        headers:{
            'content-type':'application/json',
            authorization:'tL1UtOXDyrWxCfCmH5/nXxczYF0='
        },
        data:{
            appid:AppId,
            bucket:wxBucket,
            url:'https://ss3.baidu.com/-rVXeDTa2gU2pMbgoY3K/it/u=94176867,3139555548&fm=202&mola=new&crop=v1'
        },
        success(data){
            console.log(data);
        }
    });
});

