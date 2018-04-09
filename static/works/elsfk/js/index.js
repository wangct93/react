/**
 * Created by Administrator on 2017/10/18.
 */

$(() => {
    new Map({
        $target:$('#box'),
        $score:$('#score')
    }).start();
});




class Map{
    constructor(option){
        this.init(option);
    }
    init(option){
        this.initOption(option);
        this.updateHtml();
        this.addEvent();
    }
    initOption(option){
        wt.extend(this,option);
    }
    updateHtml(){
        let {map = [],width = 30,height = 30} = this;
        if(map.length === 0){
            for(let i = 0;i < height;i++){
                let temp = [];
                for(let j = 0;j < width;j++){
                    temp.push(0);
                }
                map.push(temp);
            }
            this.map = map;
        }
        let html = '';
        map.forEach((item,i) => {
            html += '<div class="row" index="'+ i +'">';
            item.forEach((item,j) => {
                html += '<div class="' + `cell ${item === 0 ? '' : 'active'}` + '" index="'+ j +'"></div>';
            });
            html += '</div>';
        });
        this.$target.html(html);
        this.$score.html(this.score);
    }
    addEvent(){
        $(document).keyup(e => {
            let {keyCode} = e;
            if(!this.paused){
                this.keyup(keyCode);
            }
        })
    }
    moveSquare({dx = 0,dy = 0,rotate}){
        if(this.check({dx,dy,rotate})){
            this.drawSquare(false);
            let sq = this.square;
            sq.x += dx;
            sq.y += dy;
            if(rotate){
                sq.rotate();
            }
            this.drawSquare(true);
            return true;
        }else{
            return false;
        }
    }
    drawSquare(bol){
        let list = this.square.getList();
        let func = bol ? 'addClass' : 'removeClass';
        list.forEach(({x,y}) => {
            if(y >= 0){
                this.$target.children().eq(y).children().eq(x)[func]('active');
            }
            this.updatePoint(x,y,bol ? 1 : 0);
        });
    }
    start(){
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.exec();
        },50);
        this.paused = false;
    }
    stop(){
        this.paused = true;
        clearInterval(this.timer);
    }
    exec(){
        if(!this.moveSquare({dy:1})){
            if(this.checkOver()){
                wt.alert('game over!');
                clearInterval(this.timer);
            }else{
                this.createSquare();
                this.drawSquare(true);
            }
        }
    }
    createSquare(){
        let square = new Square({
            x:14,
            // type:'正5',
            y:-3
        });
        this.square = square;
        return square;
    }
    check({dx = 0,dy = 0,rotate}){
        let sq = this.square;
        if(!sq){
            sq = this.createSquare();
        }
        sq.getList().forEach(({x,y}) => {
            this.updatePoint(x,y,0);
        });
        sq.x += dx;
        sq.y += dy;
        if(rotate){
            sq.rotate();
        }
        let result = sq.getList().every(({x,y}) => this.checkPoint(x,y));
        sq.x -= dx;
        sq.y -= dy;
        if(rotate){
            sq.rotateBack();
        }
        sq.getList().forEach(({x,y}) => {
            this.updatePoint(x,y,1);
        });
        return result;
    }
    checkPoint(x,y){
        return y >= 0 ? this.map[y] ? this.map[y][x] === 0 : false : true;
    }
    checkOver(){
        return this.square.getList().some(({x,y}) => y < 0);
    }
    updatePoint(x,y,value){
        if(this.map[y]){
            this.map[y][x] = value;
        }
    }
    keyup(keyCode){
        switch(keyCode){
            case 37:
                this.moveSquare({dx:-1});
                break;
            case 39:
                this.moveSquare({dx:1});
                break;
            case 38:
                this.moveSquare({rotate:1});
                break;
        }
    }
    clear(){
        let count = 0;
        let {score = 0} = this;
        this.map.forEach((item,i,map) => {
            let bol = item.every(item => item === 1);
            if(bol){
                count++;
                map.splice(i,1);
                map.unshift(map[0].map(item => 0));
            }
        });
        score += Math.pow(2,count);
        this.score = score;
        this.updateHtml();
    }
}

class Square{
    constructor(option){
        this.init(option);
    }
    init(option){
        let {type,x = 14,y = 0,state = 0} = option || {};
        let list = this.allTypes[type];
        if(!list){
            let {typeList} = this;
            list = this.allTypes[typeList[Math.floor(Math.random() * typeList.length)]];
        }
        if(state > list.length - 1){
            state = 0;
        }

        wt.extend(this,{
            state,
            list,
            x,
            y
        });
    }
    back(){
        this.y--;
    }
    move(){
        this.y++;
    }
    getList(){
        return this.list[this.state].map(item => {
            let temp = item.split('_');
            return {
                x:+temp[0] + this.x,
                y:+temp[1] + this.y
            };
        });
    }
    rotate(){
        this.state++;
        if(this.state >= this.list.length){
            this.state = 0;
        }
    }
    rotateBack(){
        this.state--;
        if(this.state < 0){
            this.state = this.list.length - 1;
        }
    }
}

wt.extend(Square.prototype,{
    typeList:['田','一','正7','反7','土','正5','反5'],
    allTypes: {
        '田': [
            ['0_0', '0_1', '1_0', '1_1']
        ],
        '一': [
            ['-1_0', '0_0', '1_0', '2_0'],
            ['0_-1', '0_0', '0_1', '0_2']
        ],
        '正7': [
            ['-1_0', '0_0', '0_1', '0_2'],
            ['-1_1', '0_1', '1_1', '1_0'],
            ['0_0', '0_1', '0_2', '1_2'],
            ['-1_2', '-1_1', '0_1', '1_1']
        ],
        '反7': [
            ['0_0', '0_1', '0_2', '1_0'],
            ['1_2', '-1_1', '0_1', '1_1'],
            ['0_0', '0_1', '0_2', '-1_2'],
            ['-1_0', '-1_1', '0_1', '1_1']
        ],
        '土': [
            ['-1_1', '0_1', '1_1', '0_0'],
            ['0_0', '0_1', '0_2', '1_1'],
            ['-1_0', '0_0', '1_0', '0_1'],
            ['0_0', '0_1', '0_2', '-1_1']
        ],
        '正5': [
            ['0_0', '0_1', '1_1', '1_2'],
            ['-1_2', '0_2', '0_1', '1_1']
        ],
        '反5': [
            ['0_0', '0_1', '-1_1', '-1_2'],
            ['-1_1', '0_1', '0_2', '1_2']
        ]
    }
});