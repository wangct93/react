/**
 * Created by Administrator on 2017/12/6.
 */





$.ajax({
    url:'http://localhost:63342/mysql/static/util/demo/ajax/json/test.json',
    data:{
        name:'wangct'
    },
    success:function(result){
        wt.alert('获取数据成功：' + JSON.stringify(result));
    },
    error:function(err){
        wt.alert('获取数据失败：' + err);
    }
});
