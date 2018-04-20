/**
 * Created by Administrator on 2018/3/29.
 */



wt.DOMReady(() => {
    $('#file').change(e => {
        let files = e.target.files;
        if(files.length){
            let formData = new FormData();
            for(let i = 0;i < files.length;i++){
                formData.append(this.name + '_' + i,files[i]);
            }
            $.ajax({
                url:'/test',
                type:'post',
                data:formData,
                processData:false,
                contentType:false,
                success(data){
                    console.log(data);
                },
                error(err){
                    console.log(err);
                }
            })
        }

    })
    $.ajax({
        url:'/test',
        type:'post',
        data:{
            a:1
        },
        success(data){
            console.log(data);
        },
        error(er){
            console.log(er);
        }
    });


});


function aa(name){
    name = 1;
    console.log(arguments[0]);
}

aa(4);