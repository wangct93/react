/**
 * Created by Administrator on 2017/12/6.
 */





$(function(){
    play();
    addEvent();
})

function addEvent(){
    $('#btn').click(function(){
        showView();
    })
}

function showView(){
    var $iframe = $('#imgBox').children('iframe');
    var pdt = parseInt($iframe.css('paddingTop'));
    pdt = isNaN(pdt) ? 0 : pdt;
    pdt = pdt ? 0 : 1;
    $iframe.css('padding',pdt + 'px');
}


function play(){
    var url = 'http://172.16.70.251:80/casematerial/A/330421/510000/201714/01/36/-2358074121.mp4';
    var playerElem = $('#player')[0];
    try{
        playerElem.SetAttribute("LYPLAYEROCX_CONFIG_VCS", "1");
        playerElem.SetAttribute("LYPLAYEROCX_PLAY_MODE", "1");
        playerElem.OpenFile(url);
    }catch(e){
        console.log(e);
    }
}