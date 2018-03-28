/**
 * Created by Administrator on 2017/12/6.
 */


$(function(){
    $('.wdc-dropdown').click(function(e){
        $(this).toggleClass('active');
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
    });
    $('.wdc-dropdown-box').click(function(e){
        if(e.stopPropagation){
            e.stopPropagation();
        }else{
            e.cancelBubble = true;
        }
    });
    $('.wdc-dropdown-list').children().click(function(){
        $('.wdc-show').css('backgroundColor',$(this).attr('color'));
        $('.wdc-dropdown').removeClass('active');
    });
    $(document).click(function(){
        $('.wdc-dropdown').removeClass('active');
    });

});

