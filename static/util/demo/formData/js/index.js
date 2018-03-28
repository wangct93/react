/**
 * Created by Administrator on 2017/12/6.
 */



wt.DOMReady(function(){
    $('#btn').on('click',function(){
        var $elemList = $('.table-input');
        var data = wt.formData({
            list:$elemList,
            field:'vtext'
        });
        $elemList = $('.td-value');
        wt.formData({
            list:$elemList,
            field:'vtext',
            data:data
        });
    });
});