/**
 * 圆柱形
 * @module zrender/graphic/shape/Cylinder
 */

define(function (require) {
    'use strict';
    var BoundingRect = require('zrender/core/BoundingRect');
    var env = require('zrender/core/env');
    var matrix = require('zrender/core/matrix');
    var useVML = !env.canvasSupported; //环境是否支持
    function pathHasStroke(style) {
        var stroke = style.stroke;
        return stroke != null && stroke !== 'none' && style.lineWidth > 0;
    }
    function pathHasFill(style) {
        var fill = style.fill;
        return fill != null && fill !== 'none';
    }
    return require('../Path').extend({
        
    	
        type: 'cylinder',

        shape: {
            cx: 0, //椭圆圆心的x坐标
            cy: 0,  //椭圆圆心的y坐标
            rx: 0,  //椭圆圆心的x轴半径
            ry: 0,   //椭圆圆心的Y轴半径
            h :0     //圆柱形的高度
        },
        brush: function (ctx) {
            ctx.save();
            var style = this.style;
            var path = this.path;
            var hasStroke = pathHasStroke(style);
            var hasFill = pathHasFill(style);
            var hasFillGradient = hasFill && !!(style.fill.colorStops);
            var hasStrokeGradient = hasStroke && !!(style.stroke.colorStops);
            
            // Update path sx, sy
            var scale = this.getGlobalScale();

            style.bind(ctx, this);
            
            if(!style.scale){
            	style.scale = scale ;
            }
            
            this.setTransform(ctx); // 这个要设置scale的值 不然坐标会出问题
            
            if (this.__dirtyPath) {
                var rect = this.getBoundingRect();
                // Update gradient because bounding rect may changed
                if (hasFillGradient) {
                    this._fillGradient = style.getGradient(ctx, style.fill, rect);
                }
                if (hasStrokeGradient) {
                    this._strokeGradient = style.getGradient(ctx, style.stroke, rect);
                }
            }
            // Use the gradient
            if (hasFillGradient) {
                ctx.fillStyle = this._fillGradient;
            }
            if (hasStrokeGradient) {
                ctx.strokeStyle = this._strokeGradient;
            }

            var lineDash = style.lineDash;
            var lineDashOffset = style.lineDashOffset;

            var ctxLineDash = !!ctx.setLineDash;

            
            path.setScale(scale[0], scale[1]);

            // Proxy context
            // Rebuild path in following 2 cases
            // 1. Path is dirty
            // 2. Path needs javascript implemented lineDash stroking.
            //    In this case, lineDash information will not be saved in PathProxy
            if (this.__dirtyPath || (
                lineDash && !ctxLineDash && hasStroke
            )) {
                path = this.path.beginPath(ctx);

                // Setting line dash before build path
                if (lineDash && !ctxLineDash) {
                    path.setLineDash(lineDash);
                    path.setLineDashOffset(lineDashOffset);
                }

                this.buildPath(ctx, this.shape);

                // Clear path dirty flag
                this.__dirtyPath = false;
            }
            else {
                // Replay path building
                ctx.beginPath();
                this.path.rebuildPath(ctx);
            }

            hasFill && path.fill(ctx);

            if (lineDash && ctxLineDash) {
                ctx.setLineDash(lineDash);
                ctx.lineDashOffset = lineDashOffset;
            }

            hasStroke && path.stroke(ctx);

            //圆柱的文字
            if (style.text != null) {
                // var rect = this.getBoundingRect();
                this.drawRectText(ctx,this.getRect());
            }
            
            //圆柱的椭圆的文字
            if (style.topText != null) {
                // var rect = this.getBoundingRect();
           	 	style.text = this.style.topText ;
           	 	style.textFill = this.style.topTextFill ;   	 	
                this.drawRectText(ctx, this.getCylinder() );
            }
            ctx.restore();
        },
        buildPath: function (ctx, shape) {
        	
            if(useVML){
            	var transform = matrix.create();
                this.transform = transform;
            }
            
            var k = 0.5522848;
            var x = shape.cx;
            var y = shape.cy;
            var a = shape.rx;
            var b = shape.ry;
            var h = shape.h ;
            var x2 = x ;
            var y2 = y + h ;
            var ox = a * k; // 水平控制点偏移量
            var oy = b * k; // 垂直控制点偏移量
            // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
            
            var fillColor = this.style.fill ;
            var strokeColor =this.style.stroke ;
            
            ctx.moveTo(x-a, y);
            ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
            ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
            ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
            ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
            
            ctx.lineTo(x2-a,y2);
            ctx.bezierCurveTo(x2 - a, y2+ oy, x2 - ox, y2 + b, x2, y2 + b);
            ctx.bezierCurveTo(x2 + ox, y2 + b, x2 + a, y2 + oy, x2 + a, y2);
            ctx.lineTo(x + a, y);
            
            ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
            ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        },
        /**
         * 获取椭圆的区域范围
         */
        getCylinder : function () {
        	var style = this.style;
        	var shape = this.shape ;

            var x = shape.cx - shape.rx;
            var y = shape.cy - shape.ry;
            var lineWidth = style.lineWidth || 1;
            this.__rect = new BoundingRect(
            		x - lineWidth, 
            		y - lineWidth, 
            		shape.rx *2 + lineWidth, 
            		shape.ry *2 + lineWidth
            );
            return this.__rect;
        },
        /**
         * 获取柱状形下面正方形的区域范围
         */
        getRect : function () {
        	var style = this.style;
        	var shape = this.shape ;

            var x = shape.cx - shape.rx;
            var y = shape.cy + shape.ry;
            var lineWidth = style.lineWidth || 1;
            this.__rect = new BoundingRect(
            		x - lineWidth, 
            		y - lineWidth, 
            		shape.rx *2 + lineWidth, 
            		shape.h + lineWidth
            );
            return this.__rect;
        },
        /**
         * 返回矩形区域，用于局部刷新和文字定位
         * @param {Object} style
         */
        getBoundingRect : function () {
        	var style = this.style;
        	var shape = this.shape ;
           /* if (this.__rect) {
                return this.__rect;   //按照其他方法是需要这段代码的  由于这里有三个获取区域方法 所以这段要去掉 不然这段代码后面的都将
            }*/
            var x = shape.cx - shape.rx;
            var y = shape.cy - shape.ry;
            var lineWidth = style.lineWidth || 1;
            this.__rect = new BoundingRect(
            		x - lineWidth, 
            		y - lineWidth, 
            		shape.rx *2 + lineWidth, 
            		shape.ry *2 + shape.h + lineWidth
            );
            return this.__rect;
        },

        contain : function (x, y) {
            var originPos = this.transformCoordToLocal(x, y);
            x = originPos[0];
            y = originPos[1];

            // 快速预判并保留判断矩形
           /* var rect = this.__rect;   //正常情况下也是需要这段的 但是这里返回的是椭圆形的面积 这样onclick事件只能在椭圆形区域内
            if (!rect) {*/
             var rect = this.__rect = this.getBoundingRect();
            /*}*/
            
            return rect.contain(x, y);
        }
    });
});
