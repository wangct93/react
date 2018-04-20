/**
 * Created by Administrator on 2017/11/17.
 */





define(['bullet','tankList'],function(Bullet,tankList){
    function Tank(opt){
        this.map = opt.map;
        this.x = opt.x;
        this.y = opt.y;
        this.direction = opt.direction || 'top';
        this.control = opt.control;
        this.attackTarget = opt.attackTarget;
        this.init();
        tankList.push(this);
    }
    Tank.prototype = {
        init:function(){
            this.initCDList();
            this.createHtml();
            this.updateHtml();
            this.initAutoAction();
        },
        initCDList:function(){
            this.cdList = {
                move:{
                    enable:true,
                        cdTime:100
                },
                launch:{
                    enable:true,
                        cdTime:500
                }
            };
        },
        initAutoAction:function(){
            if(!this.control && this.attackTarget){
                var _this = this;
                this.timer = setInterval(function(){
                    _this.autoAction();
                },300);
            }
        },
        autoAction:function(){
            var sx = this.x;
            var sy = this.y;
            var tx = this.attackTarget.x;
            var ty = this.attackTarget.y;
            var dx = sx - tx;
            var dy = sy - ty;
            if(Math.abs(dx) < Math.abs(dy)){
                if(dx > 0){
                    this.action('move','left');
                    this.move('left');
                }else if(dx < 0){
                    this.action('move','right');
                }else{
                    if(dy > 0){
                        this.action('move','top');
                    }else{
                        this.action('move','bottom');
                    }
                    this.action('launch');
                }
            }else{
                if(dy > 0){
                    this.action('move','top');
                }else if(dy < 0){
                    this.action('move','top');
                }else{
                    if(dx > 0){
                        this.action('move','left');
                    }else{
                        this.action('move','right');
                    }
                    this.action('launch');
                }
            }
        },
        createHtml:function(){
            this.$target = $('<div class="tank1"></div>');
            this.map.$target.append(this.$target);
        },
        launch:function(){
            var bullet = new Bullet({
                map:this.map,
                x:this.x,
                y:this.y,
                direction:this.direction,
                tank:this
            });
        },
        killer:function(tank){
            new Tank({
                map:this.map,
                x:0,
                y:0,
                attackTarget:this
            });
        },
        action:function(actionName){
            var action = this.cdList[actionName];
            if(action && action.enable){
                var func = this[action.handName] || this[actionName];
                if(wt.isFunction(func)){
                    var arg = [];
                    for(var i = 1,len = arguments.length;i < len;i++){
                        arg.push(arguments[i]);
                    }
                    func.apply(this,arg);
                    action.enable = false;
                    action.timer = setTimeout(function(){
                        action.enable = true;
                    },action.cdTime);
                }
            }
        },
        directionConfig:{
            37:'left',
            38:'top',
            39:'right',
            40:'bottom'
        },
        moveByCode:function(code){
            this.action('move',this.directionConfig[code]);
        },
        move:function(fx){
            if(this.direction == fx){
                var x = this.x;
                var y = this.y;
                switch(fx) {
                    case 'top':
                        if(this.checkMove(x,y - 1,x + 1,y - 1)){
                            this.y--;
                        }
                        break;
                    case 'bottom':
                        if(this.checkMove(x,y + 2,x + 1,y + 2)){
                            this.y++;
                        }
                        break;
                    case 'left':
                        if(this.checkMove(x - 1,y,x - 1,y + 1)){
                            this.x--;
                        }
                        break;
                    case 'right':
                        if(this.checkMove(x + 2,y,x + 2,y + 1)){
                            this.x++;
                        }
                        break;
                }
                this.updateHtml();
            }else{
                this.turnFx(fx);
            }
        },
        turnFx:function(direction){
            this.direction = direction;
            var config = {
                top:'0',
                bottom:'180',
                left:'-90',
                right:'90'
            };
            var deg = config[direction];
            this.$target.css({
                transform:'rotate('+ deg +'deg)'
            });
        },
        updateHtml:function(){
            this.$target.css({
                left:this.x * 15 + 'px',
                top:this.y * 15 + 'px'
            });
        },
        checkMove:function(x1,y1,x2,y2){
            var mapAry = this.map.map;
            var maxY = mapAry.length - 1;
            var maxX = mapAry[0].length - 1;
            return this.between(x1,0,maxX)
                && this.between(y1,0,maxY)
                && this.between(x2,0,maxX)
                && this.between(y2,0,maxY)
                && mapAry[y1][x1] == 0
                && mapAry[y2][x2] == 0;
        },
        between:function(v,min,max){
            return v >= min && v <= max;
        },
        beAttack:function(bullet){
            this.destroy();
        },
        destroy:function(){
            this.$target.remove();
            tankList.remove(this);
            wt.isUndefined(this.timer) || clearInterval(this.timer);
        }
    };
    $('body').keydown(function(e){
        var code = e.keyCode;
        if(code > 36 && code < 41){
            tankList.forEach(function(tank){
                if(tank.control){
                    tank.moveByCode(code);
                }
            });
        }else if(code == 88){
            tankList.forEach(function(tank){
                if(tank.control){
                    tank.action('launch');
                }
            });
        }
    });
    return Tank;
});