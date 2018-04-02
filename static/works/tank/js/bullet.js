/**
 * Created by Administrator on 2017/11/17.
 */


define(['tankList'],function(tankList){
    function Bullet(opt){
        this.map = opt.map;
        this.level = opt.level || 1;
        this.direction = opt.direction;
        this.setCoord(opt.x,opt.y,opt.direction);
        this.tank = opt.tank;
        this.init();
    }
    Bullet.prototype = {
        init:function(){
            this.createHtml();
            this.start();
        },
        createHtml:function(){
            this.$target = $('<div class="bullet bullet-'+ this.direction +'"></div>');
            this.map.$target.append(this.$target);
            this.updateHtml();
        },
        setCoord:function(x,y,fx){
            var x2 = x;
            var y2 = y;
            if(fx == 'top' || fx == 'bottom'){
                x2 = x + 1;
            }else{
                y2 = y + 1;
            }
            this.points = [
                {
                    x:x,
                    y:y
                },
                {
                    x:x2,
                    y:y2
                }
            ];
        },
        updateHtml:function(){
            var points = this.points;
            var x1 = points[0].x;
            var y1 = points[0].y;
            var x2 = points[1].x;
            var y2 = points[1].y;
            var mapAry = this.map.map;
            var maxY = mapAry.length - 1;
            var maxX = mapAry[0].length - 1;
            if(this.between(x1,0,maxX) && this.between(y1,0,maxY)){
                if(mapAry[y1][x1] != 0 || mapAry[y2][x2] != 0){
                    this.map.beAttack(this);
                    this.destroy();
                }else if(this.checkAttackTank()){
                    this.destroy();
                }else{
                    this.$target.css({
                        left:x1 * 15 + 'px',
                        top:y1 * 15 + 'px'
                    });
                }
            }else{
                this.destroy();
            }
        },
        checkAttackTank:function(){
            var points = this.points;
            var fromTank = this.tank;
            var x, y,x1,x2,x3,x4,y1,y2,y3,y4,point;
            for(var i = 0;i < tankList.length;i++){
                var tank = tankList[i];
                if(fromTank != tank){
                    x1 = x4 = tank.x;
                    y1 = y2 = tank.y;
                    x2 = x3 = x1 + 1;
                    y3 = y4 = y1 + 1;
                    for(var j = 0;j < points.length;j++){
                        point = points[j];
                        x = point.x;
                        y = point.y;
                        if(x == x1 && y == y1 || x == x2 && y == y2 || x == x3 && y == y3 || x == x4 && y == y4){
                            tank.beAttack(this);
                            fromTank.killer(tank);
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        start:function(){
            var _this = this;
            this.timer = setInterval(function(){
                _this.next();
            },100);
        },
        next:function(){
            var fx = this.direction;
            this.setNextCoord(fx == 'left' || fx == 'right',fx == 'top' || fx == 'left' ? -1 : 1);
            this.updateHtml();
        },
        setNextCoord:function(bol,num){
            this.points.forEach(function(point){
                if(bol){
                    point.x += num;
                }else{
                    point.y += num;
                }
            });
            return this.points;
        },
        between:function(v,min,max){
            return v >= min && v <= max;
        },
        check:function(){

        },
        destroy:function(){
            this.$target.remove();
            clearInterval(this.timer);
        }
    };
    return Bullet;
});