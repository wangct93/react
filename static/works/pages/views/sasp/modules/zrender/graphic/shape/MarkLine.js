/**
 * zrender
 *
 * @author weiwj
 *
 * shape类：标线
 */
define(function (require) {
	'use strict';
	var env = require('zrender/core/env');
    var useVML = !env.canvasSupported; //环境是否支持
    
    var Path = require('zrender/graphic/Path');
    
    var IconShape = require('zrender/tool/Icon');
    
    var LineShape = require('zrender/graphic/shape/Line');
    var lineInstance = new LineShape({});
    
    var BezierCurve = require('zrender/graphic/shape/BezierCurve');
    var BezierCurveInstance = new BezierCurve({});
    
    var Polyline = require('zrender/graphic/shape/Polyline');//折线
    var PolylineInstance = new Polyline({});//折线

    var matrix = require('zrender/core/matrix');
	
	var smoothSpline = require('zrender/graphic/helper/smoothSpline');
    var smoothBezier = require('zrender/graphic/helper/smoothBezier');
    
    return Path.extend({
    	
        type : 'mark-line',
        
        shape:{
        	
        	percent: 1,
        	
        	points: null,

            smooth: false, //折线转角是否平滑

            smoothConstraint: null //平滑约束
        },
        /**MarkLine：style的fill属性会导致曲线形状下，曲线的包围圈也被颜色填充，所以fill的值必须为null*/
        style:{
        	fill:null
        },
        
        /**
         * 创建线条路径
         * @param {Context2D} ctx Canvas 2D上下文
         * @param {Object} shape 图形
         */
        buildPath : function (ctx,shape,inBundle) {
        	
            var lineProxy  = this.getLineProxy(shape);
            
            lineProxy.buildPath.call(this,ctx, shape);
            
            this.drawSymbol(ctx,this.shape,this.style);
        },
        
        drawSymbol:function(ctx,shape,style){
            
            if(!this.shape.pointList || this.__dirty){
            	this.getPointList(shape);
            }
            
            this.brushSymbol(ctx,style,shape, 0);
            this.brushSymbol(ctx,style,shape, 1);
        },
        
        getLineProxy:function(shape){
        	if(!shape){
        		shape = this.shape;
        	}
        	
        	if(shape){
        		//折线
        		if(shape.lineProxy == 'polyline'){ 
        			return PolylineInstance;
        		}
        		//贝塞尔曲线
        		if(shape.lineProxy == 'bezier'){
        			return BezierCurveInstance;
        		}
        	}
        	//直线
    		return lineInstance;
        },
        /**
         * 标线始末标注
         */
        brushSymbol : function (ctx, style,shape, idx) {
            if (style.symbol[idx] == 'none') {
                return;
            }
            
            //ctx.beginPath();

            ctx.lineWidth = style.symbolBorder;
            ctx.strokeStyle = style.symbolBorderColor;
            // symbol
            style.iconType = style.symbol[idx].replace('empty', '').toLowerCase();
            if (style.symbol[idx].match('empty')) {
                ctx.fillStyle = '#fff'; //'rgba(0, 0, 0, 0)';
            }
            
            if(ctx.strokeStyle){
            	ctx.fillStyle = ctx.strokeStyle; //填充颜色和描边颜色一致
            }

            // symbolRotate
            var pointList = this.shape.pointList;
            var len = pointList.length;
            
            var x = idx === 0 ? pointList[0][0] : pointList[len - 1][0];
            var y = idx === 0 ? pointList[0][1] : pointList[len - 1][1];
            var rotate = typeof style.symbolRotate[idx] != 'undefined'? (style.symbolRotate[idx] - 0) : 0;
            
            if(style.iconType == 'arrow') {
                // 箭头自动旋转，手动画
                this.buildArrawPath(ctx, shape,style, idx);
            }else {
                // symbolSize
                var symbolSize = style.symbolSize[idx];
                style.x = x - symbolSize;
                style.y = y - symbolSize,
                style.width = symbolSize * 2;
                style.height = symbolSize * 2;
                IconShape.prototype.buildPath(ctx, style);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        },

        buildArrawPath : function (ctx,shape,style,idx) {
    	    var pointList = this.shape.pointList;
            var len = pointList.length;
            
            var symbolSize = style.symbolSize[idx] * 2;
            var x1 = pointList[len - 2][0];
            var x2 = pointList[len - 1][0];
            var y1 = pointList[len - 2][1]; 
            var y2 = pointList[len - 1][1];
            var delta = 0;
            if (shape.smooth === 'spline') {
                delta = 0.2; // 偏移0.2弧度
            }
            // 原谅我吧，这三角函数实在没想明白，只能这么笨了
            
            var rotate = Math.atan(
                    Math.abs((y2 - y1) / (x1 - x2)
                ));
            if (idx === 0) {
                if (x2 > x1) {
                    if (y2 > y1) {
                        rotate =  Math.PI * 2 - rotate + delta;
                    }
                    else {
                        rotate += delta;
                    }
                }
                else {
                    if (y2 > y1) {
                        rotate += Math.PI - delta;
                    }
                    else {
                        rotate = Math.PI - rotate - delta;
                    }
                }
            }
            else {
                if (x1 > x2) {
                    if (y1 > y2) {
                        rotate =  Math.PI * 2 - rotate + delta;
                    }
                    else {
                        rotate += delta;
                    }
                }
                else {
                    if (y1 > y2) {
                        rotate += Math.PI - delta;
                    }
                    else {
                        rotate = Math.PI - rotate - delta;
                    }
                }
            }

            var halfRotate = Math.PI / 8; // 夹角
            var x = idx === 0 ? x1 : x2;
            var y = idx === 0 ? y1 : y2;
            var point= [
                [
                    x + symbolSize * Math.cos(rotate - halfRotate),
                    y - symbolSize * Math.sin(rotate - halfRotate)
                ],
                [
                    x + symbolSize * 0.6 * Math.cos(rotate),
                    y - symbolSize * 0.6 * Math.sin(rotate)
                ],
                [
                    x + symbolSize * Math.cos(rotate + halfRotate),
                    y - symbolSize * Math.sin(rotate + halfRotate)
                ]
            ];
            ctx.moveTo(x, y);
            for (var i = 0, l = point.length; i <l; i++) {
                ctx.lineTo(point[i][0], point[i][1]);
            }
            ctx.lineTo(x, y);
        },

        getPointList : function (shape) {
        	var points;
        	if(shape.lineProxy == 'polyline'){//折线
        		var smooth = shape.smooth;
        		if(smooth && smooth != 'spline'){//贝塞尔曲线
        			var controlPoints = smoothBezier(
    					shape.points, smooth, false, shape.smoothConstraint
                    );
        			var len = controlPoints.length;
        			var length = shape.points.length;
        			points = [controlPoints[len-1],shape.points[length-1]];//只要2个点就可以了，主要是为了确定箭头方向
        		}else{
        			if(smooth == 'spline'){
        				points = smoothSpline(points, false);
        			}else{
        				points = shape.points;
        			}
        		}
        	}else if(shape.lineProxy == 'bezier'){//贝塞尔曲线
        		if (shape.cpx2 == null || shape.cpy2 == null) {
        			points = [[shape.cpx1,shape.cpy1],[shape.x2,shape.y2]];
                }else {
                	points = [[shape.cpx2,shape.cpy2],[shape.x2,shape.y2]];
                }
        	}else{//直线
        		points = [[shape.x1,shape.y1],[shape.x2,shape.y2]];
        	}
            this.shape.pointList = points;
            return points;
        },
        /**
         * Get point at percent
         * @param  {number} t
         * @return {Array.<number>}
         */
        pointAt: function (p) {
        	return this.getLineProxy(this.shape).pointAt.call(this,p);
        }
    });
    
});
