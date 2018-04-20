/**
 * Created by Administrator on 2017/10/18.
 */




wt.DOMReady(function(){
    Ocr.init();
});






var Ocr = {
    init:function(){
        this.addEvent();
    },
    addEvent:function(){
        var _this = this;
        $('#uploadBtn').click(function(){
            $('#file').click();
        });
        $('#searchBtn').click(function(){
            var v = $('#searchInput').val();
            if(!v){
                wt.alert('图片地址不能为空！');
            }else{
                $('#showImg').attr('src',src);
                $.ajax({
                    url:'/ocr!byUrl',
                    data:{
                        url:v
                    },
                    success:function(data){
                        console.log(data);
                    }
                })
            }
            // wt.ajax({
            //     url:'/ocr!byUrl',
            //     data:{
            //         url:v
            //     },
            //     success:function(result){
            //         qs('#resultBox').innerHTML = JSON.stringify(result).addSpace(1);
            //     }
            // });
        });
        $('#file').bind('change',function(){
            if(this.value){
                var file = this.files[0];
                Ocr.ajaxFile(file,qs('#imgBox img'));
            }
            this.value = '';
        });

        $('#screenshotBtn').click(function(){
            var $imgBox = $('#imgBox');
            $imgBox.unbind('mousedown');
            $('.rect-box').remove();

            wt.bindDrawRect({
                target:$imgBox,
                mouseup:function(div){
                    wt.unbindDrawRect({
                        target:$imgBox
                    });
                    $imgBox.drag();
                    var src = $imgBox.find('img').attr('src');
                    var coord = div.attr('coord');
                    var coordAry = coord.split(',');
                    _this.cutImg({
                        url:src,
                        sx:coordAry[0],
                        sy:coordAry[1],
                        ex:coordAry[2],
                        ey:coordAry[3],
                        success:function(dataUrl){
                            $('#viewImg').attr('src',dataUrl);
                        }
                    });
                }
            });
        });
        var imgBox = $('#imgBox');
        // wt.dragEle({
        //     target:imgBox
        // });
        // wt.zoomEle({
        //     target:imgBox
        // });


    },
    cutImg:function(opt){
        var defaultOpt = {
            sx:0,
            sy:0,
            ex:1,
            ey:1
        };
        opt = wt.extend(defaultOpt,opt);
        var $img = $('<img>');
        $img.bind('load',function(){
            var dx = opt.ex - opt.sx;
            var dy = opt.ey - opt.sy;
            var width = dx * this.width;
            var height = dy * this.height;
            var $canvas = $('<canvas width="'+ width +'" height="'+ height +'"></canvas>');
            var c = $canvas[0].getContext('2d');
            c.drawImage(this,opt.sx * this.width,opt.sy * this.height,width,height,0,0,width,height);
            wt.execFunc(opt.success,$canvas[0].toDataURL('image/png',.92));
        });
        $img.attr('src',opt.url);
    },
    ajaxFile:function(file,img){
        var data = new FormData();
        data.append('file',file);
        wt.ajax({
            url:'/ocr!byImg',
            type:'post',
            processData:false,
            data:data,
            success:function(result){
                qs('#resultBox').innerHTML = JSON.stringify(result).addSpace(1);
            }
        });
        var r = new FileReader();
        r.onload = function(data){
            img.src = data.target.result;
        };
        r.readAsDataURL(file);
    },
    getTextByUrl:function(url){
        $.ajax({
            url:'/getTextByOcr',
            data:{
                url:url
            },
            success:function(data){
                console.log(data);
            }
        })
    }
};


function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}


