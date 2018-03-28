/**
 * Created by Administrator on 2017/12/6.
 */




wt.DOMReady(function(){
    new wt.Paging({
        target:qs('#paging'),
        onSelect:function(){
            console.log(arguments);
        }
    });
    new wt.Paging({
        target:qs('#paging2'),
        total:40,
        onSelect:function(){
            console.log(arguments);
        }
    });
    new wt.Paging({
        target:qs('#paging3'),
        total:1000,
        itemLength:1,
        onSelect:function(){
            console.log(arguments);
        }
    });
});