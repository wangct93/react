/**
 * Created by Administrator on 2017/11/17.
 */
define(function(){
    function Map($target,map,width,height){
        this.$target = $target;
        this.width = width;
        this.height = height;
        this.map = map;
        this.init();
    }
    Map.prototype = {
        init:function(){
            this.initMap();
            this.createHtml();
        },
        initMap:function(){
            if(!this.map){
                var height = this.height;
                var width = this.width;
                var map = [];
                for(var i = 0;i < height;i++){
                    var temp = [];
                    for(var j = 0;j < width;j++){
                        temp.push(0);
                    }
                    map.push(temp);
                }
                this.map = map;
            }
        },
        createHtml:function(){
            var html = '';
            var map = this.map;
            var height = map.length;
            var width = map[0].length;
            for(var i = 0;i < height;i++){
                html += '<div class="tank-line">';
                for(var j = 0;j < width;j++){
                    html += '<div coord="'+ i + '_' + j +'" class="tank-cell bg-cell-'+ i % 2 + j % 2 + '-' + map[i][j] +'"></div>';
                }
                html += '</div>';
            }
            this.$target.html(html);
        },
        setBgByCoord:function(y,x,level){
            level = level == undefined ? 1 : level;
            var map = this.map;
            map[y][x] = level;
            this.$target.children().eq(y).children().eq(x).attr('class','tank-cell bg-cell-'+ y % 2 + x % 2 + '-' + level);
        },
        beAttack:function(bullet){
            bullet.points.forEach(function(point){
                this.setBgByCoord(point.y,point.x,0);
            },this);
        }
    };
    return Map;
});
