;(function(){
    var compareList = [];
    var pathname=location.protocol+'//'+location.host+'/'+location.pathname.split('/')[1];
    function Compare(opt){
        this.maxLength = opt.maxLength || 10;
        this.title = opt.title || '比对';
        this.url = opt.url;
        this.btn = opt.btn;
        this.fields = opt.fields;
        this.list = [];
        this.isExpand = false;
        this.option = opt;
        this.createHtml(opt);
        compareList.push(this);
    }
    Compare.prototype = {
        createHtml:function(opt){
            var title = this.title;
            var tHide = opt.titleHide;
            var btn = opt.btn;
            var dy = opt.top || 0;
            var maxH = document.body.offsetHeight - dy - 75;
            var $div = $('<div class="compare-box" style="right:' + (opt.right || 0) + 'px;top:' + dy + 'px;"><div class="compare-btn">' + title + '列表<span class="compare-count"></span></div><div class="compare-body"><div class="compare-title">' + title + '列表</div><div class="compare-list" style="max-height:' + maxH + 'px;"></div><div class="compare-btnbox"><a class="w-btn w-btn-noicon">开始'+ title +'</a><span class="compare-clear fr">删除</span></div></div></div>');
            var wrap = opt.wrapEle;
            if(!wrap){
                wrap = $('body');
            }
            if(tHide){
                $div.find('.compare-title').first().hide().next().hide().next().hide();
            }
            wrap.append($div);
            this.$ele = $div;
            var _this = this;

            //列表显示隐藏按钮事件
            $div.children('.compare-btn').click(function(){
                var $this = $(this);
                var $box = $this.parent();
                var $body = $this.next();
                if(_this.isExpand){
                    $body.stop().animate({left:0,opacity:0},300,'linear',function(){
                        $box.removeClass('compare-show');
                    });
                    _this.isExpand = false;
                }else{
                    for(var i = 0;i < compareList.length;i++){
                        var obj = compareList[i];
                        if(obj != this && obj.isExpand){
                            obj.close();
                        }
                    }
                    $box.addClass('compare-show');
                    $body.stop().animate({left:-$body[0].offsetWidth,opacity:1},300,'linear');
                    _this.isExpand = true;
                }
            }).bind('selectstart',function(){
                return false;
            });

            //删除数据事件
            $div.find('.compare-list').click(function(ev){
                var e = ev || event;
                var target = e.target || e.srcElement;
                var $target = $(target);
                if($target.hasClass('compare-remove')){
                    var $item = $target.parent();
                    var source = $item[0].source;
                    if(source){
                        source.removeClass('disabled').html(title);
                    }
                    var index = $item.index();
                    _this.list.splice(index,1);
                    $item.remove();
                    _this.updateCount();
                }else if($target.hasClass('hand-text')){
                    var caseId = $target.attr('caseid');
                    window.open(pathname + '/liveyc/caseJudge/caseInfo.jsp?caseId=' + caseId);
                }
            });
            //按钮事件
            $div.find('.w-btn').click(function(){
                var list = _this.list;
                var mergeState = 0;
                //案件串并状态分析
                if(list.length>0){
                    for(var i=0;i<list.length;i++){
                        if(list[i].MERGESTATE!=undefined&&list[i].MERGESTATE>0){
                            mergeState++;
                        }
                    }
                }
                window.open(_this.url + '?caseIds='+ _this.getCaseIds()+'&mergeState='+mergeState);
            }).next().click(function(){
                var $box = $(this).parent().prev();
                $box.children().each(function(index,item){
                    var source = item.source;
                    if(source){
                        source.removeClass('disabled').html(title);
                    }
                });
                $box.html('');
                _this.list = [];
                _this.updateCount();
            });
        },
        addRow:function(row){
            var rows = this.list;
            row = $.extend({},row);
            var l = rows.length;
            var rowId = this.option.fields.caseId;
            var title = this.title;
            for(var i = 0;i < l;i++){
                if(rows[i][rowId] == row[rowId]){
                    $.dlg.alertInfo('该案件已加入' + title + '列表！');
                    return;
                }
            }
            this.$ele.show();
            this.open();
            var $box = this.$ele.find('.compare-list');
            var $div = $(this.getItemStr(row));
            $box.append($div);
            rows.push(row);
            this.updateCount();
        },
        updateCount:function(){
            var l = this.list.length;
            var $ele = this.$ele;
            var $target = $ele.find('.compare-count');
            if(l){
                $target.html(l);
            }else{
                $ele.hide();
            }
        },
        removeRow:function(){

        },
        getItemStr:function(row,btnText){
            var fields = this.fields;
            var pathname = location.protocol+'//'+location.host+'/'+location.pathname.split('/')[1]+'/';
            var iconStr = btnText ? '<a class="w-btn w-btn-add">'+ btnText +'</a>' : '<i class="compare-remove"></i>';
            return '<div class="compare-item inline-box"><div class="compare-imgbox"><img src="' +
                row[fields.src] + '" onerror="this.src=\''+ pathname + 'commonui/images/searchListIcons/blankImg.png\';"></div><div class="fit"><p class="compare-text"><span class="hand-text" caseid="' +
                row[fields.caseId]+ '">' +
                row[fields.oldCaseId] +  '</span></p><p class="compare-text">' +
                (row[fields.title] || '&nbsp;') + '</p><p class="compare-text">案发时间：' +
                (row[fields.time] || '&nbsp;') + '</p></div>' +
                iconStr + '</div>';
        },
        getRows:function(){
            return this.list;
        },
        getCaseIds:function(){
            var list = this.list;
            var ary = [];
            for(var i = 0;i < list.length;i++){
                ary.push(list[i].CASEID);
            }
            return ary.join(',');
        },
        hide:function(){
            this.$ele.hide();
        },
        show:function(){
            if(this.list.length){
                this.$ele.show();
            }else{
                this.$ele.hide();
            }
        },
        open:function(){
            if(this.isExpand){
                return;
            }
            this.$ele.children('.compare-btn').trigger('click');
        },
        close:function(){
            if(!this.isExpand){
                return;
            }
            this.$ele.children('.compare-btn').trigger('click');
        }
    };
    window.Compare = Compare;
})();