/**
 * Created by Administrator on 2018/3/29.
 */


$(()=>{
    $('#box').bind('paste',(e) => {
        e = e.originalEvent;
        clipboardData = e.clipboardData;
        let item = clipboardData.items[0];
        let a = clipboardData;
        if (clipboardData && clipboardData.items[0].type.indexOf('image') > -1) {
            var that = this,
                reader =  new FileReader();
            file = clipboardData.items[0].getAsFile();//读取e.clipboardData中的数据：Blob对象

            reader.onload = function (e) { //reader读取完成后，xhr上传
                console.log(reader.result);
            }
            reader.readAsDataURL(file);//获取base64编码
        }else{
            console.log(clipboardData.getData('text'));
        }
    })
});