/**
 * Created by Administrator on 2017/10/18.
 */

wt.DOMReady(function(){
    Page.init();
});

var Page = {
    init:function(){
        this.initGame();
        this.addEvent();
    },
    initGame:function(){
        this.game = new Game2048({
            $target:$('#box'),
            $score:$('#score')
        });
    },
    addEvent:function(){
        var _this = this;
        $('#startBtn').click(function(){
            _this.initGame();
        });
    }
}


function Game2048(opt){
    this.init(opt);
}



Game2048.prototype = {
    init:function(opt){
        this.setOptions(opt);
        this.initHtml();
        this.addEvent();
    },
    setOptions:function(opt){
        var defaultOpt = {
            width:4,
            height:4,
            score:0
        };
        wt.extend(this,defaultOpt,opt);
    },
    initHtml:function(){
        if(this.map == null){
            var map = [];
            var html = '';
            for(var i = 0;i < this.height;i++){
                var temp = [];
                for(var j = 0;j < this.width;j++){
                    temp.push(0);
                }
                map.push(temp);
            }
            this.map = map;
            this.createNum(map);
            this.createNum(map);
        }
        this.updateHtml();
    },
    updateHtml:function(){
        var html = '';
        this.map.forEach(function(temp,y){
            html += '<div class="line">';
            temp.forEach(function(v,x){
                html += '<div class="point point-'+ v +'">'+ (v || '') +'</div>';
            });
            html += '</div>';
        });
        this.$target.html(html);
        this.$score.html(this.score);
    },
    addEvent:function(){
        var _this = this;
        $(document).off('keydown').keydown(function(e){
            var config = {
                '37':'left',
                '38':'up',
                '39':'right',
                '40':'down'
            };
            config[e.keyCode] && _this.move(config[e.keyCode]);
        });
    },
    move:function(direction){
        var map = wt.extend(true,[],this.map);
        if(this.state == 'gameover'){
            return;
        }
        switch(direction){
            case 'right':
                this.xReverse(map);
                this.exec(map,true);
                this.xReverse(map);
                break;
            case 'up':
                this.exec(map);
                break;
            case 'down':
                map.reverse();
                this.exec(map);
                map.reverse();
                break;
            default:
                this.exec(map,true);
                break;
        }
        this.map = map;
        this.updateHtml();
    },
    createNum:function(map){
        var ary = [];
        map.forEach(function(temp,y){
            temp.forEach(function(v,x){
                if(v == 0){
                    ary.push(y + '_' + x);
                }
            });
        });
        if(ary.length){
            var random = Math.floor(Math.random() * ary.length);
            var temp = ary[random].split('_');
            map[temp[0]][temp[1]] = 2;
            this.score += 2;
        }else{

        }
    },
    xReverse:function(map){
        map.forEach(function(ary){
            ary.reverse();
        });
    },
    exec:function(map,isLeft){
        var temp = isLeft ? map : this.getOtherAry(map);
        this.setMap(map,temp.map(function(ary){
            return this.compute(ary);
        },this),isLeft);
    },
    getOtherAry:function(map){
        var ary = [];
        map.forEach(function(temp,y){
            temp.forEach(function(v,x){
                var temp = ary[x];
                if(!temp){
                    temp = ary[x] = [];
                }
                temp[y] = v;
            });
        });
        return ary;
    },
    setMap:function(map,valueMap,isLeft){
        var changed = false;
        map.forEach(function(temp,y){
            temp.forEach(function(v,x){
                var num = isLeft ? valueMap[y][x] : valueMap[x][y];
                if(num == null && v != 0){
                    changed = true;
                }
                temp[x] = num || 0;
            });
        });
        if(this.isOver(map)){
            this.state = 'gameover';
            wt.alert('游戏结束，得分：' + this.score);
        }else{
            changed && this.createNum(map);
        }
    },
    isOver:function(map){
        return !map.some(function(temp,y){
            return temp.some(function(v,x){
                var bol = true;
                if(v){
                    var siblings = [
                        {
                            y:y - 1,
                            x:x
                        },
                        {
                            y:y + 1,
                            x:x
                        },
                        {
                            y:y,
                            x:x - 1
                        },
                        {
                            y:y,
                            x:x + 1
                        }
                    ];
                    bol = siblings.some(function(item){
                        var num = this.getNum(map,item.x,item.y);
                        return num == 0 || num == v;
                    },this);
                }
                return bol;
            },this);
        },this);
    },
    getNum:function(map,x,y){
        return map[y] ? map[y][x] : null;
    },
    compute:function(ary){
        var compare = true;
        var result = [ary[0]];
        for(var i = 1;i < ary.length;i++){
            var cur = ary[i];
            var len = result.length;
            var tar = result[len - 1];
            if(cur){
                if(compare){
                    if(tar == cur){
                        compare = false;
                        result[len - 1] = 2 * cur;
                    }else{
                        result.push(cur);
                    }
                }else{
                    result.push(cur);
                }
            }
        }
        return result.filter(function(item){
            return item;
        });
    }
};
