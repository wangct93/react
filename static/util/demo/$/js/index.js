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
            url:'/uploadFileToCloud',
            type:'post',
            processData:false,
            contentType:false,
            data:formData,
            success(data){
                console.log(data);
            }
        });
    });


    $.ajax({
        url:'/loadRemote',
        data:{
            url:'http://172.16.66.14:8080/tzcu/liveyc/index/cd/json/map_cd.json'
        },
        success(data){
            console.log(data);
        }
    });
});

