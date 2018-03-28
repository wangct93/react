/**
 * Created by Administrator on 2017/12/6.
 */



wt.DOMReady(function(){
    wt.previewImg({
        input:$('#file')[0],
        target:$('#box')[0]
    });
    wt.dragEle({
        target:$('#box')[0]
    });
    wt.zoomEle({
        target:$('#box')[0]
    });
    $('#btn').on('click',function(e){
        wt.ajaxSubmit({
            form:$('#form')[0],
            url:'/upload',
            success:function(result){
                console.log(result);
            },
            error:function(err){
                console.log(err);
            }
        });
        // var data = new FormData();
        // data.append('name',$('#file')[0].files[0]);
        // $.ajax({
        //     type:'post',
        //     data:data,
        //     url:'/upload',
        //     processData:false,
        //     contentType:false,
        //     success:function(){
        //
        //     }
        // })
    });
});



