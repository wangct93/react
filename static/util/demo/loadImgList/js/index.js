/**
 * Created by Administrator on 2017/12/6.
 */




$(() => {
    var list = wt.toArray(qsAll('.imgbox img'));
    var loadImg = new wt.LoadImgList({
        imgLoad:function(img){
            console.log(111);
        },
        list,
        interval:3000
    });
    loadImg.load();
})