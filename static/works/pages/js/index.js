/**
 * Created by Administrator on 2018/2/28.
 */


wt.DOMReady(function(){
    Control.init();
});


var Control = {
    init:function(){
        this.addEvent();
        this.addNavItems();
    },
    addEvent:function(){
        $('#navList').click(function(e){
            var $li = $(e.target).closest('li');
            if($li.length && !$li.hasClass('active')){
                var itemData = $(this).data('data')[$li.index()];
                $('#targetIframe').attr('src',itemData.url);
                $li.addClass('active').siblings().removeClass('active');
            }
        });
    },
    addNavItems:function(){
        $.ajax({
            url:'./json/navList.json',
            success:function(data){
                var $box = $('#navList');
                var html = '';
                data.forEach(function(item,i){
                    html += '<li>'+ item.name +'</li>';
                });
                $box.html(html).data('data',data).children().first().click();
            }
        });
    }
}