/**
 * Created by Administrator on 2017/12/6.
 */



wt.DOMReady(function(){
    $('#box').paste({
        success(data){
            console.log(data);
        }
    });
});



