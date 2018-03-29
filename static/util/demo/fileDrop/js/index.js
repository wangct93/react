/**
 * Created by Administrator on 2017/12/6.
 */



wt.DOMReady(function(){
    $('#box').fileDrop({
        success(data){
            console.log(data);
            data.forEach(item => {
                $('.container').append('<img style="width: 100px;height: 100px" src="'+ item +'">');
            })
        }
    });
});



