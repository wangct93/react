/**
 * Created by Administrator on 2017/10/18.
 */


var manage;
var map;
wt.DOMReady(function(){
    map = new WMap({
        $target:$('#box')
    });
    var u1 = new User({
        $target:$('#user1'),
        type:1,
        map:map,
        isAuto:true
    });
    var u2 = new User({
        $target:$('#user2'),
        type:2,
        map:map
    });
    manage = new Manage([u1,u2]);
    $('#startBtn').click(function(){
        manage.restart();
    });
});



function WMap(opt){
    this.init(opt);
}

WMap.prototype = {
    init:function(opt){
        this.setOption(opt);
        this.initHtml();
        this.addEvent();
    },
    setOption:function(opt){
        var defaultOpt = {
            width:16,
            height:16
        };
        wt.extend(this,defaultOpt,opt);
    },
    initHtml:function(){
        if(!this.map){
            var map = [];
            for(var y = 0;y < this.height;y++){
                var temp = [];
                for(var x = 0;x < this.width;x++){
                    temp.push(0);
                }
                map.push(temp);
            }
            this.map = map;
        }
        this.updateHtml();
    },
    addEvent:function(){
        var _this = this;
        this.$target.click(function(e){
            var $target = $(e.target);
            var $item = $target.closest('.qz');
            var opUser = manage.getOpUser();
            if($item.length && !manage.getOpUser().isAuto){
                var x = $item.parent().index();
                var y = $item.parent().parent().index();
                opUser.down(x,y);
            }
        });
    },
    click:function(x,y,type){
        var v = this.map[y][x];
        var bol = (this.state == 'ready' || this.state == 'opening') && !v;
        if(bol){
            this.map[y][x] = type;
            this.get$Elem(x,y).children('.qz').attr('class','qz qz-' + (type == 1 ? 'hei' : 'bai'));
        }
        return bol;
    },
    updateHtml:function(){
        var html = '';
        this.map.forEach(function(ary,y){
            html += '<div class="line">';
            ary.forEach(function(type,x){
                var typeClass = type == 1 ? 'qz-hei' : type == 2 ? 'qz-bai' : '';
                html += '<div class="point"><div class="qz '+ typeClass +'"></div></div>';
            });
            html += '</div>';
        });
        this.$target.html(html);
    },
    get$Elem:function(x,y){
        return this.$target.children().eq(y).children().eq(x);
    },
    getFinalValue:function(x,y,type,cb){
        var selfValue = this.getValue(x,y,type);
        this.map[y][x] = type;
        var _this = this;
        this.getBestPoint(type == 1 ? 2 : 1,false,function(point){
            _this.map[y][x] = 0;
            cb(selfValue - point.max);
        });
    },
    getValue:function(x,y,type){
        return this.getStrData(x,y).map(function(item){
            return this.getValueByStr(item,type);
        },this).reduce(function(prev,next,index){
            return prev + next;
        },0);
    },
    getValueByStr:function(str,type){
        var re = new RegExp('0?(' + type + '*\\?' + type + '*)0?');
        var match = str.match(re);
        var level = match ? match[1].length + (match[0].length > match[1].length + 1 ? '' : '-') : '1';
        return this.scoreData[level] || 0;
    },
    getStrData:function(x,y){
        var strY = '';
        var strX = '';
        var strS = '';
        var strF = '';
        this.map.forEach(function(temp,yIndex){
            var bol = yIndex == y;
            strY += bol ? '?' : temp[x];
            if(bol){
                temp.forEach(function(num,xIndex){
                    strX += xIndex == x ? '?' : num;
                });
            }
        });
        for(var cx = 0,max = this.width;cx < max;cx++){
            var d = x - cx;
            var sy = y - d;
            var fy = y + d;
            if(sy >= 0 && sy < this.height){
                strS += d ? this.map[sy][cx] : '?';
            }
            if(fy >= 0 && fy < this.height){
                strF += d ? this.map[fy][cx] : '?';
            }
        }
        return [strX,strY,strS,strF];
    },
    scoreData:{
        '5':100000,
        '5-':100000,
        '4':10000,
        '4-':1000,
        '3':1000,
        '3-':100,
        '2':100,
        '2-':10,
        '1':10
    },
    check:function(x,y,type){
        return this.getValue(x,y,type) > 50000;
    },
    end:function(){
        this.state = 'gameover';
    },
    restart:function(){
        this.map.forEach(function(temp,y){
            temp.forEach(function(num,x){
                temp[x] = 0;
            });
        });
        this.updateHtml();
        this.state = 'ready';
    },
    getBestPoint:function(type,bol,cb){
        var px;
        var py;
        if(this.state == 'opening'){
            var max = -1000000;
            var map = this.map;
            var list = [];
            var minX = map[0].length - 1;
            var minY = map.length - 1;
            var maxX = 0;
            var maxY = 0;
            map.forEach(function(temp,y){
                temp.forEach(function(v,x){
                    if( v == type){
                        minX = Math.max(Math.min(minX,x - 1),0);
                        minY = Math.max(Math.min(minY,y - 1),0);
                        maxX = Math.min(Math.max(maxX,x + 1),temp.length - 1);
                        maxY = Math.min(Math.max(maxY,y + 1),map.length - 1);
                    }
                });
            });
            for(var i = minY;i <= maxY;i++){
                var temp = map[i];
                for(var j = minX;j <= maxX;j++ ){
                    list.push({
                        x:j,
                        y:i
                    });
                }
            }
            var _this = this;
            var queue = new wt.Queue({
                list:list,
                execFunc:function(item,cb){
                    var x = item.x;
                    var y = item.y;
                    var n;
                    if(!map[y][x]){
                        if(bol){
                            _this.getFinalValue(x,y,type,function(n){
                                if(n > max){
                                    max = n;
                                    px = x;
                                    py = y;
                                }
                                cb();
                            });
                        }else{
                            n = _this.getValue(x,y,type);
                            if(n > max){
                                max = n;
                                px = x;
                                py = y;
                            }
                            cb();
                        }
                    }else{
                        cb();
                    }
                },
                success:function(){
                    cb({
                        x:px,
                        y:py,
                        max:max,
                        type:type
                    });
                },
                limit:1
            });
            queue.start();
        }else{
            this.state = 'opening';
            px = Math.floor(this.width / 2);
            py = Math.floor(this.width / 2);
            cb({
                x:px,
                y:py,
                max:max,
                type:type
            });
        }
    }
}






function User(opt){
    this.init(opt);
}

User.prototype = {
    init:function(opt){
        this.setOption(opt);
        this.initHtml();
    },
    setOption:function(opt){
        var defaultOpt = {
            time:600    //单位（秒）
        };
        wt.extend(this,defaultOpt,opt);
    },
    initHtml:function(){
        this.$target.find('.qz').addClass('qz-' + (this.type == 1 ? 'hei' : 'bai'));
    },
    start:function(){
        var _this = this;
        clearInterval(this.timer);
        this.timer = setInterval(function(){
            _this.time--;
            _this.showTime();
        },1000);
        this.isAuto && this.autoPlay();
    },
    pause:function(){
        clearInterval(this.timer);
    },
    showTime:function(){
        var times = this.time;
        var m = Math.floor(times / 60) + '';
        var s = times % 60 + '';
        var timeStr = m.addZero(2) + ':' + s.addZero(2);
        this.$target.find('.show-time').html(timeStr);
    },
    autoPlay:function(){
        var _this = this;
        console.log('自动下子开启：');
        this.map.getBestPoint(this.type,true,function(point){
            _this.down(point.x,point.y);
            console.log('自动下子结束！');
        });
    },
    down:function(x,y){
        if(this.map.click(x,y,this.type)){
            if(this.map.check(x,y,this.type)){
                wt.alert('游戏结束，' + (this.type == 1 ? '黑' : '白') + '子获胜！');
                this.pause();
            }else{
                this.manage.tab();
            }
        }
    },
    restart:function(){
        this.time = 600;
        this.showTime();
        this.pause();
    }
}

function Manage(list){
    this.list = list;
    this.init();
}

Manage.prototype = {
    init:function(){
        this.addLink();
    },
    addLink:function(){
        this.list.forEach(function(item){
            item.manage = this;
            if(!item.isAuto){
                this.user = item;
            }
        },this);
    },
    tab:function(index){
        index = index != null ? index : this.index ? 0 : 1;
        var _this = this;
        this.index = index;
        this.list.forEach(function(user,i){
            user[i == _this.index ? 'start' : 'pause']();
        });
    },
    getType:function(){
        return this.list[this.index].type;
    },
    getOpUser:function(){
        return this.list[this.index];
    },
    restart:function(){
        this.list[0].map.restart();
        this.list.forEach(function(user){
            user.restart();
        });
        this.tab(0);
    }
}