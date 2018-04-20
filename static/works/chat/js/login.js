/**
 * Created by Administrator on 2015/11/4.
 */

wt.DOMReady(function(){
    $('#loginBtn').click(function(){
        var name = $('#name').val() || 2;
        var password = $('#password').val() || 2;
        if(!name){
            wt.alert('帐号不能为空');
        }else if(!password){
            wt.alert('密码不能为空')
        }else{
            $.ajax({
                type:'post',
                url:'/chat/login',
                data:{
                    name:name,
                    password:password
                },
                success:function(data){
                    if(data){
                        location.href = './index.html';
                    }else{
                        // wt.alert('用户名或者密码错误！');
                    }
                }
            });
        }
    });
})
