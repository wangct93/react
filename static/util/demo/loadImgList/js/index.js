/**
 * Created by Administrator on 2017/12/6.
 */


var list;
var loadImg = new wt.LoadImgList({
    imgLoad:function(img){
        console.log(111);
    }
});
wt.DOMReady(function(){
    list = wt.toArray(qsAll('.imgbox img'));
    loadImg.add(list);
    loadImg.load();
});