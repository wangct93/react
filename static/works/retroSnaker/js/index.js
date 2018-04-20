/**
 * Created by Administrator on 2017/10/18.
 */

wt.DOMReady(function(){
    createMap();
});


function createMap(){
    $('#box').data('map',new Map({
        $target:$('#box'),
        $score:$('#score'),
        width:20,
        height:20
    }));
}

function start(){
    var map = $('#box').data('map');
    map.clear();
    var snake = new Snake({
        map:map,
        list:[
            {
                x:5,
                y:10
            },
            {
                x:4,
                y:10
            },
            {
                x:3,
                y:10
            }
        ]
    });
    var food = new Food({
        x:15,
        y:10,
        map:map
    });
    addEvent(snake);
    map.updateHtml();
}

function addEvent(snake){
    $('body').keydown(function(e){
        var keyCode = e.keyCode;
        if([37,38,39,40].indexOf(keyCode) != -1){
            snake.trun(keyCode);
        }
    }).keyup(function(e){
        snake.slow();
    });
}


function Map(opt){
    this.init(opt);
}

Map.prototype = {
    init:function(opt){
        this.setOption(opt);
        this.createMapData();
        this.updateHtml();
    },
    setOption:function(opt){
        this.snakeList = [];
        this.foodList = [];
        wt.extend(this,opt);
    },
    createMapData:function(){
        if(!this.map){
            var map = [];
            for(var i = 0;i < this.height;i++){
                var temp = [];
                for(var k = 0;k < this.width;k++){
                    temp.push(0);
                }
                map.push(temp);
            }
            this.map = map;
        }
    },
    updateHtml:function(){
        var $target = this.$target;
        var html = '';
        var snakePointList = [];
        var map = wt.extend(true,[],this.map);
        this.snakeList.forEach(function(snake){
            snake.list.forEach(function(point){
                map[point.y][point.x] = 11;
            });
        });
        this.foodList.forEach(function(food){
            map[food.y][food.x] = 10;
        });
        map.forEach(function(temp,y){
            html += '<div class="bg-row">';
            temp.forEach(function(num,x){
                var isSnake = num == 11;
                var isFood = num == 10;
                html += '<div class="bg-cell'+ (isSnake ? ' tcs-div' : isFood ? ' food-div' : '') +'"></div>';
            });
            html += '</div>';
        });
        $target.html(html);
        var score = 0;
        if(this.snakeList[0]){
            score = this.snakeList[0].list.length - 3;
        }
        this.$score.html(score);
    },
    getFood:function(point){
        return this.foodList.filter(function(food){
            return food.x == point.x && food.y == point.y;
        })[0];
    },
    removeFood:function(food){
        this.foodList.remove(food);
    },
    createFood:function(){
        var map = wt.extend(true,[],this.map);
        this.snakeList.forEach(function(snake){
            snake.list.forEach(function(point){
                map[point.y][point.x] = 11;
            });
        });
        this.foodList.forEach(function(food){
            map[food.y][food.x] = 10;
        });
        var list = [];
        map.forEach(function(temp,y){
            temp.forEach(function(num,x){
                num == 0 && list.push({
                    x:x,
                    y:y
                });
            });
        });
        var random = Math.floor(Math.random() * list.length);
        var point = list[random];
        point.map = this;
        new Food(point);
    },
    clear:function(){
        this.snakeList = [];
        this.foodList = [];
    }
}


function Snake(opt){
    this.init(opt);
}

Snake.prototype = {
    init:function(opt){
        this.setOption(opt);
        opt.map && opt.map.snakeList.push(this);
        this.start();
    },
    setOption:function(opt){
        var defaultOpt = {
            state:'waiting',
            speed:'slow',
            nextDirectionCode:39,
            directionCode:39        //37 : left , 38 : top , 39 : right , 40 : bottom
        };
        wt.extend(this,defaultOpt,opt);
    },
    trun:function(keyCode){
        if(this.nextDirectionCode == keyCode){
            this.quick();
        }else if((this.directionCode - keyCode) % 2){
            this.nextDirectionCode = keyCode;
        }
    },
    move:function(){
        var headPoint = this.getNextPoint(this.list[0]);
        var x = headPoint.x;
        var y = headPoint.y;
        var listIndex = this.list.indexOfFunc(function(item){
            return x == item.x && y == item.y;
        });
        if(x < 0 || x >= this.map.map[0].length || y < 0 || y >= this.map.map.length ||  listIndex != -1 && listIndex != this.list.length - 1){
            wt.alert('gameover，你的得分：' + (this.list.length - 3) + '分');
            this.pause();
        }else{
            this.list.unshift(headPoint);
            var food = this.map.getFood(headPoint);
            if(food){
                this.map.removeFood(food);
                this.map.createFood();
            }else{
                this.list.pop();
            }
            this.map.updateHtml();
        }
    },
    start:function(){
        if(this.state != 'running'){
            this.state = 'running';
            var _this = this;
            this.nowDate = +new Date();
            this.timer = setInterval(function(){
                var nowDate = +new Date();
                if(nowDate - _this.nowDate > _this.interval){
                    _this.move();
                    _this.nowDate = nowDate;
                }
            },30);
        }
    },
    interval:500,
    pause:function(){
        this.state = 'pause';
        clearInterval(this.timer);
    },
    getNextPoint:function(point){
        var x = point.x;
        var y = point.y;;
        switch(this.nextDirectionCode){
            case 39:
                x++;
                break;
            case 37:
                x--;
                break;
            case 40:
                y++;
                break;
            case 38:
                y--;
                break;
            default:
                x++;
                break;
        }
        this.directionCode = this.nextDirectionCode;
        return {
            x:x,
            y:y
        };
    },
    quick:function(){
        if(this.speed != 'quick'){
            this.speed = 'quick';
            this.interval = 30;
        }
    },
    slow:function(){
        if(this.speed != 'slow'){
            this.speed = 'slow';
            this.interval = 500;
        }
    }
}

function Food(opt){
    this.init(opt);
}

Food.prototype = {
    init:function(opt){
        this.setOption(opt);
        opt.map && opt.map.foodList.push(this);
    },
    setOption:function(opt){
        wt.extend(this,opt);
    }
}