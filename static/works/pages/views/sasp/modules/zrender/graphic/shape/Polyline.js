/**
 * @module zrender/graphic/shape/Polyline
 */
define(function (require) {

    var polyHelper = require('../helper/poly');

    return require('../Path').extend({
        
        type: 'polyline',

        shape: {
            points: null,

            smooth: false, //折线转角是否平滑

            smoothConstraint: null //平滑约束
        },

        style: {
            stroke: '#000',

            fill: null
        },

        buildPath: function (ctx, shape) {
            polyHelper.buildPath(ctx, shape, false);
        },
        /**
         * Get point at percent
         * @param  {number} t
         * @return {Array.<number>}
         */
        pointAt: function (p) {
        	//当smooth不为true时，计算当前点所在位置
        	
        	var shape = this.shape;
        	var sacle = this.scale ||[1,1]; //缩放比例
        	
        	var points = shape.points;
        	var len = points.length;
        	
        	var c = getLength(points); //线段的总周长
        	
        	var xStart;
        	var xEnd;
        	var yStart;
        	var yEnd;
    		var cu=0;  //所在点的之前的所有线段所占百分比
    		for ( var i = 1; i < len; i++) {
    			var begin = points[i-1] ;
    			var end =  points[i] ;
    			var cc = getc(begin,end)/c;  //该线段所占总周长的百分比
    			cu += cc;
    			if(cu >= p){
    				//点所在当前一段的百分比 ，假设第一段占40% 第二段 占20%  而p为50%，则可判断p处在第二段；那么p在当前线段的位置百分比为50-(60-20)/20
    				p = (p-(cu-cc))/cc;
    				xStart = begin[0];     
    				xEnd = end[0];			
    				yStart = begin[1];
    				yEnd = end[1];
    				break;
    			}
    		}
        	
        	return [
	                xStart * (1 - p)*sacle[0] + xEnd * p*sacle[0],      
	                yStart * (1 - p)*sacle[1] + yEnd * p*sacle[1]
	            ];    //得到的是当前点所在的坐标
        }
    });
    
    /**
     * 两点的距离
     */
    function getc(start,end){
     	return Math.sqrt(Math.pow(start[0]-end[0],2)+Math.pow(start[1]-end[1],2));
     }
    
    /**
     * 计算周长
     */
    function getLength(points){
    	var l = 0;
    	for(var i=1,len=points.length;i<len;i++){
    		var start = points[i-1];
    		var end = points[i];
    		l += getc(start,end);
    	}
    	return l;
    }
});