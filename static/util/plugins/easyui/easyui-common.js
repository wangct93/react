(function ($) {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    function CreateIndentityWindowId() {
        return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    function destroy(target) {
        $(target).dialog("destroy");
    }
    function getWindow(target) {
        if (typeof target == "string") {
            return document.getElementById(target);
        } else {
            return $(target).closest(".window-body");
        }
    }
    $.createWin = function (options) {
        if (!options.url && !options.contents) {
            $.messager.alert("提示", "缺少必要参数!(url or contents)");
            return false;
        }
        var windowId = CreateIndentityWindowId();
        if (options.winId) {
            windowId = options.winId;
        } else {
            options.winId = windowId;
        }
        var defaultBtn = [{
            text: '关闭',
            iconCls: 'icon-cancel',
            handler: function () {
                $("#" + windowId).dialog("close");
            }
        }];
        
        if (options.buttons == null){
        	options.buttons = [];
        }
        
        $.each(options.buttons,function(i,btn){
        	btn.handler=function(){
        		btn.btnClick.call(this,dialog,$);
        	};
        });
        
        $.merge(options.buttons || [], defaultBtn);
        
        
        options = $.extend({}, $.createWin.defaults, options || {});
        if (options.isMax) {
            options.draggable = false;
            options.closed = true;
        }
        var dialog = $('<div/>');
        if (options.target != 'body') {
            options.inline = true;
        }
        dialog.appendTo($(options.target));
        dialog.dialog($.extend({}, options, {
            onClose: function () {
                if (typeof options.onClose == "function") {
                    options.onClose.call(dialog, $);
                }
                destroy(this);
            },
            onMove: function (left, top) {
                if (typeof options.onMove == "function") {
                    options.onMove.call(dialog, $);
                }
                var o = $.data(this, 'panel').options;
                if (top < 0) {
                    $(this).dialog("move", {
                        "left": left,
                        "top": 0
                    });
                } else if (o.maximized) {
                    $(this).dialog("restore");
                    $(this).dialog("move", {
                        "left": left + 100,
                        "top": top
                    });
                }
                if (top > ($(o.target).height() - 20)) {
                    $(this).dialog("move", {
                        "left": left,
                        "top": ($(o.target).height() - 25)
                    });
                }
            }
        }));
        if (options.align) {
            var w = dialog.closest(".window");
            switch (options.align) {
                case "right":
                    dialog.dialog("move", {
                        left: w.parent().width() - w.width() - 10
                    });
                    break;
                case "tright":
                    dialog.dialog("move", {
                        left: w.parent().width() - w.width() - 10,
                        top: 0
                    });
                    break;
                case "bright":
                    dialog.dialog("move", {
                        left: w.parent().width() - w.width() - 10,
                        top: w.parent().height() - w.height() - 10
                    });
                    break;
                case "left":
                    dialog.dialog("move", {
                        left: 0
                    });
                    break;
                case "tleft":
                    dialog.dialog("move", {
                        left: 0,
                        top: 0
                    });
                    break;
                case "bleft":
                    dialog.dialog("move", {
                        left: 0,
                        top: w.parent().height() - w.height() - 10
                    });
                    break;
                case "top":
                    dialog.dialog("move", {
                        top: 0
                    });
                    break;
                case "bottom":
                    dialog.dialog("move", {
                        top: w.parent().height() - w.height() - 10
                    });
                    break;
            }
        }
        if (options.isMax) {
            dialog.dialog("maximize");
            dialog.dialog("open");
        }
        if ($.fn.mask && options.mask)
            dialog.mask();
        if (options.contents) {
            ajaxSuccess(options.contents);
        } else {
            if (!options.isIframe) {
                $.ajax({
                    url: options.url,
                    type: options.ajaxType || "POST",
                    data: options.data == null ? "" : options.data,
                    success: function (date) {
                        ajaxSuccess(date);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                		var obj =  $.parseJSON(jqXHR.responseText);
                		var code = obj.code;
                    	$.dlg.alertError(obj.code);
                        
                        if ($.fn.mask && options.mask)
                            dialog.mask("hide");
                    }
                });
            } else {
                ajaxSuccess();
            }
        }
        dialog.attr("id", windowId);
        return dialog;
        function ajaxSuccess(date) {
            if (options.isIframe && !date) {
            	$('#'+windowId).html('<iframe width="100%" height="100%" frameborder="0" src="' + options.url + '" ></iframe>');
            } else {
            	$('#'+windowId).html(date);
            }
            $.parser.parse(dialog);
            options.onComplete.call(this, dialog, $);
            if ($.fn.mask && options.mask)
                dialog.mask("hide");
        }
    };
    $.fn.destroy = function () {
        destroy(this);
    };
    window.GETWIN = getWindow;
    $.createWin.defaults = $.extend({}, $.fn.dialog.defaults, {
        url: '',
        data: '',
        ajaxType: "POST",
        target: 'body',
        height: 200,
        width: 400,
        collapsible: false,
        minimizable: false,
        maximizable: false,
        closable: true,
        modal: true,
        shadow: false,
        mask: true,
        onComplete: function (dialog, jq) { }
    });
})(jQuery);
 
function parseParam(param,key){
	var paramStr="";
    if(param instanceof String||param instanceof Number||param instanceof Boolean){
        paramStr+="&"+key+"="+encodeURIComponent(param);
    }else{
        $.each(param,function(i){
            var k=key==null?i:key+(param instanceof Array?"["+i+"]":"."+i);
            paramStr+='&'+parseParam(this, k);
        });
    }
    return paramStr.substr(1);
}


function validateForm(form){
	return form.length > 0 && form.form('validate');
}

/** 处理tree数据 使其支持平滑数据格式 */
function treeDataFilter(opt, data, parent) {
	var idFiled, textFiled, parentField;
	if (opt.parentField) {
		idFiled = opt.idFiled || 'id';
		textFiled = opt.textFiled || 'text';
		parentField = opt.parentField;
		var i, l, treeData = [], tmpMap = [];
		for (i = 0, l = data.length; i < l; i++) {
			tmpMap[data[i][idFiled]] = data[i];
		}
		for (i = 0, l = data.length; i < l; i++) {
			if (tmpMap[data[i][parentField]]
					&& data[i][idFiled] != data[i][parentField]) {
				if (!tmpMap[data[i][parentField]]['children'])
					tmpMap[data[i][parentField]]['children'] = [];
				data[i]['text'] = data[i][textFiled];
				tmpMap[data[i][parentField]]['children'].push(data[i]);
			} else {
				data[i]['text'] = data[i][textFiled];
				treeData.push(data[i]);
			}
		}
		return treeData;
	}
	return data;
}

Date.prototype.format = function(format){
	var o = {
	"M+" : this.getMonth()+1, //month
	"d+" : this.getDate(), //day
	"h+" : this.getHours(), //hour
	"m+" : this.getMinutes(), //minute
	"s+" : this.getSeconds(), //second
	"q+" : Math.floor((this.getMonth()+3)/3), //quarter
	"S" : this.getMilliseconds() //millisecond
	};

	if(/(y+)/.test(format)) {
	format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
}; 


/**
 * easyui 默认设置
 */
$.fn.datagrid.defaults.loadMsg = '加载中....'; //加载等待提示
$.fn.datagrid.defaults.pagination = true; //分页
$.fn.datagrid.defaults.border = true; //表格边框
$.fn.datagrid.defaults.striped = true; //单元格边框
$.fn.datagrid.defaults.fit = true;//表格自适应
$.fn.datagrid.defaults.pageSize = 20;//每页显示行数
$.fn.datagrid.defaults.fitColumns = true; //自适应列宽
$.fn.datagrid.defaults.rownumbers = false; //序号
$.fn.datagrid.defaults.pageList = [5, 10, 20, 30, 50, 80, 100,200];//分页配置
$.fn.datagrid.defaults.singleSelect = true; //单选
$.fn.datagrid.defaults.pageNumber = 1; //默认显示第一页
$.messager.defaults.width=600;


/**
 * jQuery 将form表单元素的值序列化成对象
 */
$.extend($.fn.form.methods, {
	serialize : function(jq) {
		var arrayValue = $(jq[0]).serializeArray();
		var json = {};
		$.each(arrayValue, function() {
			var item = this;
			var value = "";

			if (item["value"] != null) {
				value = item["value"].replace(/(^\s*)|(\s*$)/g, "");
			}
			
			if(value == '---请选择---'){
				value = '';
			}

			if (json[item["name"]]) {
				json[item["name"]] = json[item["name"]] + "," + value;
			} else {
				json[item["name"]] = value;
			}
		});
		return json;
	},
	getValue : function(jq, name) {
		var jsonValue = $(jq[0]).form("serialize");
		return jsonValue[name];
	},
	setValue : function(jq, data) {
		return jq.each(function() {
			$(this).form("load", data);
		});
	}
});

/*
 * jquery easyui 验证扩展规则：rule 
 * vnull 文本框非空 vdefault 不能等默认值'---请选择---' 
 * vint 正整数+0
 * vpint 正整数 
 * vthan 两数(正整数+0)比较 param
 * 前者为0时，后者不等于0时返回false；前者不为0时，若后者大于0小于等于前者时返回false vv 正整数,购买气量验证,param.可够气量<0时无限制,大于0时，判断可够气量。
 * vread 正整数+0,param 验证抄表表读数，本次表读数小于上次表读数返回false vrcharge 金额格式,抄表收费验证 param
 * 2,账户金额，应收金额 公式:实收金额-绝对值(账户金额-应收金额)<0 返回false vthanm 两数比较(金额格式),param ,后者
 * 需大于0且小于前者 vthanmy 两数比较(金额格式),param,后者需大于等于前者且大于0 vthanmz
 * 两数比较(金额格式),param,后者需大于等于前者 vryear 抄表年份验证 vrmonth 抄表月份验证 vmoney 金额格式 vmy 金额格式
 * 需大于0 vdate 验证日期格式 格式yyyy-MM-dd vdatehm 验证日期格式 格式yyyy-MM-dd HH:mm eqPwd 验证两次密码
 * vdecimal 验证数字格式，小数点后0位，1位，2位，3位，4位都可 gteqnumber 验证大于等于某数字 gtnumber 验证大于某数字
 * alpha 只能输入字母 alphanum 只能输入字母和数字 chinese 只能输入中文
 */

/**
 * easyui 弹出提示框简单封装
 */
(function($) {
	function alertDlg(title, msg, icon, fn) {
		top.jQuery.messager.alert(title, msg, icon, function() {
			if (fn) {
				fn();
			}
		});
	}

	$.dlg = {
		/**
		 * 
		 *  确认框
		 * @author wangct
		 * @param msg
		 * @param fn
		 * @param canFn
		 * @param opt
		 */	
		dialog:function(msg,fn,canFn,opt){
			var self = this;
			
			var defaults={
					id:'dialog_'+new Date().getTime(),
					modal:true,
					title:'询问',
					height:235,
					width:600,
					buttons:[{iconCls:'icon-ok',text:'确定',handler:function(){
						try{
							if(fn){
								if(typeof fn == 'function'){
									fn();
								}else if(typeof fn == 'string' && typeof window[fn] == 'function'){
									window[fn]();
								}
							}
							jq('#'+id).dialog('destroy');
						}catch(e){
							self.alertError("确定方法执行失败("+e.message+")，请检查调用的方法");
						}
						
					}},{iconCls:'icon-close',text:'取消',handler:function(){
						try{
							jq('#'+id).dialog('destroy');
							if(canFn){
								if(typeof canFn == 'function'){
									canFn();
								}else if(typeof canFn == 'string' && typeof window[canFn] == 'function'){
									window[canFn]();
								}
							}
						}catch(e){
							self.alertError("取消方法执行失败("+e.message+")，请检查调用的方法");
						}
					}}]
				};
			if(opt && typeof opt == 'object'){
				for(var name in opt){
					defaults[name]=opt[name];
				}
			}
			var id=defaults.id;
			var jq=top.$;
		
			if(jq('#'+id).length != 0){
				jq('#'+id).remove();
			}
			jq('body').append('<div id="'+id+'"><div class="question-title"><span class="icon-question"></span><span class="startP-text">'+msg+'</span></div></div>');
			
			jq('#'+id).dialog(defaults).parent().addClass('messager-window');
		},
		alertError : function(msg, fn) {
			alertDlg('错误', msg, 'error', fn);
		},
		alertInfo : function(msg, fn) {
			alertDlg('提示', msg, 'info', fn);
		},
		alertQuestion : function(msg, fn) {
			alertDlg('询问', msg, 'question', fn);
		},
		alertWarning : function(msg, fn) {
			alertDlg('警告', msg, 'warning', fn);
		},
		confirm : function(msg, fn,cancleFn) {
			top.jQuery.messager.confirm('询问', msg, function(isOk) {
				if (fn && isOk) {
					fn();
				}else{
					if(cancleFn){
						cancleFn();
					}
				}
			});
		},
		/**
		 * 弹出窗口，确定按钮方法通用 
		 * @param options:
		 * title: 标题
		 * pageUrl:页面url
		 * data : url参数
		 * width :窗口宽度
		 * height:窗口高度
		 * saveUrl:保存url
		 * formId:form表单id
		 * succClose:执行成功后是否关闭窗口 默认为true
		 * @param successFn 成功后执行的函数
		 * @getDataFn 重新组装下数据
		 */
		alertAddOrEditForm:function(options,successFn,getDataFn){
			if(options.succClose == null){
				options.succClose = true;
			}
			
			var urlParam='';
			if(options.data){
				urlParam = '?' + parseParam(options.data);
			}
			
			top.jQuery.createWin({
				title:options.title,
				url:options.pageUrl+urlParam,
				width:options.width,
				height:options.height,
				modal: true,
				buttons:[{
					text:'确定',
					iconCls:'icon-ok',
					btnClick: function(dialog,target){
						if(target("[id="+options.formId+"]").form('validate')){
							var formData = null;
							if(getDataFn){
								formData = getDataFn(target);
							}else{
								formData = target("[id="+options.formId+"]").form('serialize');
							}
							
							$.ajax({
								url:options.saveUrl,
								data:formData,
								dataType:'json',
								success:function(data){
									if(data.code!='0000'){
										$.dlg.alertError(data.code);
										return;
									}
									
									//执行成功后关闭对话窗口
									if(options.succClose){
										dialog.dialog('destroy');
									}
									
									//执行回调方法
									if(successFn){
										successFn();
									}
								}
							});
						}
					}
				}]
			});
		},
		/**
		 * 弹出确认框并执行方法
		 * @param options:
		 * info: 提示信息
		 * fnUrl: 执行url
		 * data: 数据
		 * @param successFn 成功后执行的方法
		 * @param cancleFn 点击提示框取消按钮后的执行方法
		 */
		alertConfirmFn:function(options,successFn,cancleFn,errorFn){
			
			$.dlg.confirm(options.info,function(){
				$.ajax({
					url:options.fnUrl,
					dataType:'json',
					data:options.data,
					success:function(data){
						if(data.code!='0000'){
							$.dlg.alertError(data.code);
							
							if(errorFn){
								errorFn();
							}
							
							return;
						}
						
						if(successFn){
							successFn(data);
						}
					}
				});
			},cancleFn);
		}
	};
	
})(jQuery);

(function($){
	$.extend($.fn.layout.methods, {   
        /**  
         * 面板是否存在和可见  
         * @param {Object} jq  
         * @param {Object} params  
         */  
        isVisible: function(jq, params) {   
            var panels = $.data(jq[0], 'layout').panels;   
            var pp = panels[params];   
            if(!pp) {   
                return false;   
            }   
            if(pp.length) {   
                return pp.panel('panel').is(':visible');   
            } else {   
                return false;   
            }   
        },   
        /**  
         * 隐藏除某个region，center除外。  
         * @param {Object} jq  
         * @param {Object} params  
         */  
        hidden: function(jq, params) {   
            return jq.each(function() {   
                var opts = $.data(this, 'layout').options;   
                var panels = $.data(this, 'layout').panels;   
                if(!opts.regionState){   
                    opts.regionState = {};   
                }   
                var region = params;   
                function hide(dom,region,doResize){   
                    var first = region.substring(0,1);   
                    var others = region.substring(1);   
                    var expand = 'expand' + first.toUpperCase() + others;   
                    if(panels[expand]) {   
                        if($(dom).layout('isVisible', expand)) {  
                            opts.regionState[region] = 1;   
                            panels[expand].panel('close');   
                        } else if($(dom).layout('isVisible', region)) {   
                            opts.regionState[region] = 0;   
                            panels[region].panel('close');   
                        }   
                    } else {   
                        panels[region].panel('close');   
                    }   
                    if(doResize){ 
                        $(dom).layout('resize');   
                    }   
                };   
                if(region.toLowerCase() == 'all'){   
                    hide(this,'east',false);   
                    hide(this,'north',false);   
                    hide(this,'west',false);   
                    hide(this,'south',true);   
                }else{   
                    hide(this,region,true);
                }   
            });   
        },   
        /**  
         * 显示某个region，center除外。  
         * @param {Object} jq  
         * @param {Object} params  
         */  
        show: function(jq, params) {   
            return jq.each(function() {   
                var opts = $.data(this, 'layout').options;   
                var panels = $.data(this, 'layout').panels;   
                var region = params;   
      
                function show(dom,region,doResize){   
                    var first = region.substring(0,1);   
                    var others = region.substring(1);   
                    var expand = 'expand' + first.toUpperCase() + others;   
                    if(panels[expand]) {   
                        if(!$(dom).layout('isVisible', expand)) {   
                            if(!$(dom).layout('isVisible', region)) {   
                                if(opts.regionState[region] == 1) {   
                                    panels[expand].panel('open');   
                                } else {   
                                    panels[region].panel('open');   
                                }   
                            }   
                        }   
                    } else {   
                        panels[region].panel('open');   
                    }   
                    if(doResize){   
                        $(dom).layout('resize');   
                    }   
                };   
                
                if(region.toLowerCase() == 'all'){   
                    show(this,'east',false);   
                    show(this,'north',false);   
                    show(this,'west',false);   
                    show(this,'south',true);   
                }else{   
                    show(this,region,true);   
                }   
            });   
        }   
    }); 
	$.extend({
		bytesToSize : function (value){
			  if(null==value||value==''){
			    return "0 Bytes";
			  }
			  var unitArr = new Array("B","KB","MB","GB","TB","PB","EB","ZB","YB");
			  var index=0;
			  var srcsize = parseFloat(value);
			  var quotient = srcsize;
			  while(quotient>1024){
			    index +=1;
			   quotient=quotient/1024;
			  }
			  var roundFun = function(numberRound,roundDigit){
				   if(numberRound>=0) {   
				         var   tempNumber   =   parseInt((numberRound   *   Math.pow(10,roundDigit)+0.5))/Math.pow(10,roundDigit);   
				         return   tempNumber;   
				    }else{   
				     numberRound1=-numberRound;   
				     var   tempNumber   =   parseInt((numberRound1   *   Math.pow(10,roundDigit)+0.5))/Math.pow(10,roundDigit);  
				     return   -tempNumber;   
				    }   
			  };
			  return roundFun(quotient,2)+" "+unitArr[index];
		}
	});
})(jQuery);
