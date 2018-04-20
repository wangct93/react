/**
 * Created by Administrator on 2018/4/2.
 */

var proName = location.pathname.split('/')[1];
$(function(){
    initBg();
    view.init();
    map.init();
});

function initBg(){
    $('#bgImg').css('minHeight',$('#content')[0].offsetHeight + 120);
}

var view = {
    init:function(){
        this.getElems();
        this.initValue();
        this.update();
        this.interval();
        this.addEvent();
    },
    detailUrls:{
        TP_COUNT:{
            title:'套牌车',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=commonPlateNoVehicleSumDetail&notitle=1',
            field:'IDEXT'
        },
        PlatenoCount04:{
            title:'假牌车',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=platenoCountjcsj&notitle=1&TYPE=04',
            getUrl:function(){
                var now = new Date();
                var endTime = now.toFormatString('YYYY-MM-DD hh:mm:ss');
                now.setMinutes(now.getMinutes() - 2);
                var startTime = now.toFormatString('YYYY-MM-DD hh:mm:ss');
                return this.url += '&startdate=' + encodeURIComponent(startTime) + '&enddate=' + encodeURIComponent(endTime);
            },
            field:'IDEXT',
            hasName:true
        },
        VI_COUNT:{
            title:'卡口接入量',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=VideoInputDetail&notitle=1',
            field:'IDEXT'
        },
        VM_COUNT:{
            title:'当日过车量',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=vehicleAlarmPreciseList&notitle=1',
            field:'IDEXT'
        },
        PlatenoCount:{
            title:'当日出行车辆',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=platenoCountjcsj&notitle=1&TYPE',
            getUrl:function(){
                var now = new Date();
                var startTime = now.toFormatString('YYYY-MM-DD') + ' 00:00:00';
                var endTime = now.toFormatString('YYYY-MM-DD hh:mm:ss');
                return this.url += '&startdate=' + encodeURIComponent(startTime) + '&enddate=' + encodeURIComponent(endTime);
            },
            field:'IDEXT',
            hasName:true
        },
        PlatenoCount01:{
            title:'本地车辆',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=platenoCountjcsj&notitle=1&TYPE=01',
            getUrl:function(){
                var now = new Date();
                var startTime = now.toFormatString('YYYY-MM-DD') + ' 00:00:00';
                var endTime = now.toFormatString('YYYY-MM-DD hh:mm:ss');
                return this.url += '&startdate=' + encodeURIComponent(startTime) + '&enddate=' + encodeURIComponent(endTime);
            },
            field:'IDEXT',
            hasName:true
        },
        PlatenoCount02:{
            title:'外地车',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=platenoCountjcsj&notitle=1&TYPE=02',
            getUrl:function(){
                var now = new Date();
                var startTime = now.toFormatString('YYYY-MM-DD') + ' 00:00:00';
                var endTime = now.toFormatString('YYYY-MM-DD hh:mm:ss');
                return this.url += '&startdate=' + encodeURIComponent(startTime) + '&enddate=' + encodeURIComponent(endTime);
            },
            field:'IDEXT',
            hasName:true
        },
        PlatenoCount05:{
            title:'绕城内车',
            url:'/its2/servletInvoker.invoke?requestType=dsearch&dtableName=platenoCountjcsj&notitle=1&TYPE=05',
            getUrl:function(){
                var now = new Date();
                var startTime = now.toFormatString('YYYY-MM-DD') + ' 00:00:00';
                var endTime = now.toFormatString('YYYY-MM-DD') + ' 23:59:59';
                return this.url += '&startdate=' + encodeURIComponent(startTime) + '&enddate=' + encodeURIComponent(endTime);
            },
            field:'IDEXT2224',
            hasName:true
        },
        TWCOUNT:{
            title:'天网视频',
            url:'/appCase/servletInvoker.invoke?requestType=dsearch&dtableName=cameraList&notitle=1&type=3',
            hasName:true
        },
        WHITECOUNT:{
            title:'雪亮视频',
            url:'/appCase/servletInvoker.invoke?requestType=dsearch&dtableName=cameraList&notitle=1&type=0',
            hasName:true
        },
        SUBWAYCOUNT:{
            title:'地铁视频',
            url:'/appCase/servletInvoker.invoke?requestType=dsearch&dtableName=cameraList&notitle=1&type=2',
            hasName:true
        },
        SOCIETYCOUNT:{
            title:'社会视频',
            url:'/appCase/servletInvoker.invoke?requestType=dsearch&dtableName=cameraList&notitle=1&type=1',
            hasName:true
        },
        TOTALCOUNT:{
            title:'视频资源',
            url:'/appCase/servletInvoker.invoke?requestType=dsearch&dtableName=cameraList&notitle=1',
            hasName:true
        }
    },
    getElems:function(){
        var $targets = {};
        $('.update-num').each(function(i,elem){
            var $elem = $(elem);
            var field = $elem.attr('field');
            if($elem && field){
                $targets[field] = $elem;
            }
        });

        this.$targets = $targets;
    },
    addEvent:function(){
        var _this = this;
        $('.update-num').click(function(){
            var $this = $(this);
            var field = $this.attr('field');
            var data = _this.detailUrls[field];
            if(data){
                var url = data.getUrl ? data.getUrl() : data.url;
                var areaField = data.field || 'area';
                url = url + (url.indexOf('?') === -1 ? '?' : '&') + areaField + '=' + _this.areaCode;
                if(data.hasName){
                    url += '&'+ areaField +'_text=' + encodeURIComponent(_this.areaName);
                }
                dialog(data.title,url);
            }else{
                $alert('无法找到匹配的地址！');
            }
        });
        $('#kkzyHeader').click(function(){
            if(top.topMenu){
                top.topMenu.click('400050001');
            }
        });
        $('#wdcNum').mousemove(function(e){
            var $this = $(this);
            var $target = $this.next();
            if($target.find('p').length === 0){
                return;
            }
            var $li = $this.parent();
            var rect = $li[0].getBoundingClientRect();
            $target.css({
                display:'block',
                left:e.clientX - rect.left + 20 + 'px',
                bottom:rect.bottom - e.clientY - 20 + 'px'
            });
        }).mouseleave(function(e){
            var $target = $(this).next();
            $target.hide();
        });
        $('#expandBtn').click(function(){
            var $btn = top.$('#colBtn');
            if($btn.length){
                $(this).hide();
                $btn.click();
            }
        });
    },
    initValue:function(){
        var $targets = this.$targets;
        for(var name in $targets){
            if($targets.hasOwnProperty(name) && $targets[name]){
                this.setValue($targets[name],0);
            }
        }
    },
    update:function(areaCode,areaName){
        areaCode = areaCode || this.areaCode || '5101';
        areaName = areaName || this.areaName || '成都市';
        this.areaCode = areaCode;
        this.areaName = areaName;

        this.update_temp();

        // var config = this.config;
        // var _this = this;
        // for(var name in config){
        //     var url = config[name];
        //     if(typeof url === 'string'){
        //         this.doAjax({
        //             IDEXT:areaCode
        //         },url,function(data){
        //             _this.updateNumByData(data);
        //         });
        //     }else if(typeof url === 'function'){
        //         url.call(this,areaCode,function(data){
        //             _this.updateNumByData(data);
        //         });
        //     }
        // }
    },
    update_temp:function(){
        var $targets = this.$targets;
        for(var field in $targets){
            var $elem = $targets[field];
            var maxLength = $elem.attr('maxLength');
            this.setValue($elem,Math.floor(Math.random() * Math.pow(10,maxLength || 5)));
        }
    },
    updateNumByData:function(data){
        for(var name in data){
            var $elem = this.$targets[name];
            if($elem){
                var value = (data[name] + '').toNum();
                this.setValue($elem,value);
            }
        }
    },
    setValue:function($elem,num){
        num = num.toString().toNum();
        var emptyToHide = $elem.attr('emptyToHide');
        if(emptyToHide){
            if(num === 0){
                $elem.parent().hide();
                return;
            }else{
                $elem.parent().show();
            }
        }
        var type = $elem.attr('type');
        var noUnit = $elem.attr('noUnit');
        var unitHtml = '';
        if(num > 99999 && type !== 'bg' && !noUnit){
            num = parseInt(num / 10000);
            unitHtml = '<span class="unit-text">万</span>';
        }
        var noImg = $elem.attr('noimg');
        $elem.html(noImg ? num : this.getHtmlByNum(num,type,type === 'bg' ? 5 : null) + unitHtml);
    },
    interval:function(){
        clearInterval(this.timer);
        var _this = this;
        this.timer = setInterval(function(){
            _this.update();
        },15000);
        setInterval(function(){
            _this.getKkData();
        },1000 * 3600);
    },
    kkData:[],
    getKkData:function(){
        var url = 'https://51.4.1.46/fms/services/rest/remoteStatisticsService/faceSnapshotDeviceStatistics';
        var _this = this;
        $.ajax({
            url:'getMessageByUrlAction!getPeopleFaceMessage.do',
            data:{
                url:encodeURIComponent(url)
            },
            success:function(data){
                if(data.success){
                    var list = JSON.parse(JSON.parse(data.msg).data) || [];
                    var areaCode = view.areaCode;
                    _this.kkData = list;
                    var target = list.filter(function(item){
                        return item.indexCode === areaCode;
                    });
                    if(target){
                        _this.updateNumByData({
                            rxkkjrl:target.cameraTotal
                        });
                    }
                }

            }
        });
    },
    stop:function(){
        clearInterval(this.timer);
    },
    config:{
        // other:function(areaCode,cb,eb){
        //     cb({
        //         rxkkjrl:221
        //     });
        // },
        alarm:function(areaCode,cb,eb){
            var now = new Date();
            var beginDate = now.toFormatString('YYYY-MM-DD') + ' 00:00:00';
            var endDate = now.diffDays(1).toFormatString('YYYY-MM-DD') + ' 00:00:00';
            var url = 'https://51.4.1.46/fms/services/rest/remoteStatisticsService/alarmStatistics?beginDate=' + beginDate + '&endDate=' + endDate;
            $.ajax({
                url:'getMessageByUrlAction!getPeopleFaceMessage.do',
                data:{
                    url:encodeURIComponent(url)
                },
                success:function(data){
                    if(data.success){
                        data = JSON.parse(data.msg).data;
                        cb({
                            rxbd:data[now.toFormatString('YYYY-MM-DD')] || 0
                        });
                    }
                }
            });
        },
        cameraTotal:function(areaCode,cb,eb){
            var target = this.kkData.filter(function(item){
                return item.indexCode === areaCode;
            });
            if(target){
                cb({
                    rxkkjrl:target.cameraTotal
                });
            }
        },
        rlcjl:function(areaCode,cb,eb){
            var url = 'https://51.4.1.46/fms/services/rest/remoteStatisticsService/snapshotStatistics?statisticsDate=' + new Date().toFormatString('YYYY-MM-DD');
            $.ajax({
                url:'getMessageByUrlAction!getPeopleFaceMessage.do',
                data:{
                    url:encodeURIComponent(url)
                },
                success:function(data){
                    if(data.success){
                        cb({
                            rlckl:JSON.parse(data.msg).data
                        });
                    }
                }
            });
        },
        wdc:function(areaCode,cb,eb){
            $.ajax({
                url:'/its2/jfgzAction!getWdPlatenoCount.do',
                type:'post',
                data:{
                    IDEXT:areaCode
                },
                success:function(data){
                    var html = '';
                    var count = 0;
                    data.forEach(function(item,i){
                        if(item.VEHICLECOUNT && count < 10){
                            count++;
                            html += '<p><span class="tooltip-title">'+ item.PLATENO +'</span>：' + item.VEHICLECOUNT + '</p>';
                        }
                    });
                    $('#wdcHover').html(html);
                }
            })
        },
        // rlckl:'/' + proName + '/test/testcount.jsp',
        // car:'/its2/jfgzAction!getPlatenoCount.do',
        car:function(areaCode,cb,eb){
            $.ajax({
                url:'/its2/jfgzAction!getPlatenoCount.do',
                type:'post',
                data:{
                    IDEXT:areaCode
                },
                success:function(data){
                    var ary = ['510114','510184','510131','5101'];
                    if(ary.indexOf(areaCode) !== -1){
                        data.PlatenoCount04 = data.PlatenoCount04.toString().toNum() * 0.005;
                    }
                    cb(data);
                },
                error:eb
            });
        },
        // tpc:'/its2/trackedVehiceAction!countCommonPlateNoVehicle.do',
        tpc:function(areaCode,cb,eb){
            $.ajax({
                url:'/its2/trackedVehiceAction!countCommonPlateNoVehicle.do',
                type:'post',
                data:{
                    IDEXT:areaCode === '5101' ? '' : areaCode
                },
                success:function(data){
                    var ary = ['510114','510184','510131','5101'];
                    if(ary.indexOf(areaCode) !== -1){
                        data.TP_COUNT = data.TP_COUNT.toString().toNum() * 0.05;
                    }
                    cb(data);
                },
                error:eb
            });
        },
        spzy:function(areaCode,cb,eb){
            $.ajax({
                url:'/appCase/cameraAction!getVideoCount.do',
                type:'post',
                data:{
                    areaCode:areaCode
                },
                success:function(data){
                    var config = {
                        510181:1118,
                        510131:271,
                        510183:392,
                        5101:1781
                    };
                    var xlCount = config[areaCode];
                    if(xlCount){
                        wt.extend(data,{
                            WHITECOUNT:xlCount,
                            TOTALCOUNT:data.TWCOUNT + xlCount + data.SUBWAYCOUNT + data.SOCIETYCOUNT
                        });
                    }
                    cb(data);
                },
                error:eb
            });
        }
    },
    doAjax:function(params,url,cb,eb){
        $.ajax({
            type:'post',
            url:url,
            data:params,
            dataType:'json',
            success:cb,
            error:eb
        });
    },
    getHtmlByNum:function(num,type,n){
        var str = (num || 0) + '';
        if(n){
            str = str.addZero(n);
        }
        var html = '<ul class="num-list '+ (type ? 'num-list-' + type : '') +'">';
        for(var i = 0,len = str.length;i < len;i++){
            html += '<li class="icon-num-'+ str.charAt(i) +'"></li>';
        }
        html += '</ul>';
        return html;
    }
};


var map = {
    init:function(){
        this.setTarget();
        this.getData();
    },
    setTarget:function(){
        this.$box = $('#mapBox');
    },
    getData:function(){
        var _this = this;
        var Promise = window.Promise || wt.Promise;
        var mapPro = new Promise(function(cb,eb){
                $.ajax({
                    // url:'./json/chengdu.json',
                    url:'./json/map_cd.json',
                    // url:'./json/a.json',
                    success:cb,
                    error:eb
                });
        });
        var areaPro = new Promise(function(cb,eb){
            $.ajax({
                url:'./json/area_cd.json',
                success:cb,
                error:eb
            });
        });
        Promise.all([mapPro,areaPro]).then(function(result){
            echarts.registerMap('成都',result[0]);
            var data = result[1];
            data.forEach(function(item){
                item.name = item.region;
                item.code = item.regionId;
            });
            _this.create(data);
        },function(err){
            console.log(err);
        });
    },
    areaColor:'#0eba68',
    hoverAreaColor:'#197549',
    create:function(data){
        var _this = this;
        var chart = echarts.init(this.$box[0]);
        var option = this.getOption(data);
        chart.setOption(option);
        chart.on('click',function(area){
            var areaData = area.data;
            var isChecked = view.areaCode !== areaData.code;
            var paramCode = isChecked ? areaData.code : '5101';
            var areaName = isChecked ? areaData.name : '成都市';

            data.forEach(function(item){
                if(item.code === areaData.code){
                    item.selected = !item.selected;
                }else{
                    item.selected = false;
                }
            });
            chart.setOption(option);
            view.update(paramCode,areaName);
            $('#area').html(areaName);
        });
        this.chart = chart;
    },
    getOption:function(data){
        var _this = this;
        return {
            series:{
                // selectedMode:'single',
                type:'map',
                map:'成都',
                data:data,
                label:{
                    show:true,
                    color:'#fff'
                },
                itemStyle: {
                    areaColor: this.areaColor,
                    borderColor: '#fff'
                },
                emphasis:{
                    label:{
                        color:'#fff'
                    },
                    itemStyle:{
                        areaColor: this.hoverAreaColor
                    }
                }
            },
            tooltip:{
                trigger:'item',
                borderWidth:0,
                borderColor:'#eee',
                padding:0,
                formatter:function(area){
                    var spData = _this.spData;
                    if(!spData){
                        _this.spData = spData = {};
                    }
                    var data = area.data;
                    var max = 1000;
                    var areaSpData = spData[data.code];
                    if(!areaSpData){
                        areaSpData = spData[data.code] = {
                            TWCOUNT:Math.floor(Math.random() * max),
                            WHITECOUNT:Math.floor(Math.random() * max),
                            SUBWAYCOUNT:Math.floor(Math.random() * max),
                            SOCIETYCOUNT:Math.floor(Math.random() * max)
                        };
                    }
                    // $.ajax({
                    //     url:'/appCase/cameraAction!getVideoCount.do',
                    //     type:'post',
                    //     async:false,
                    //     data:{
                    //         areaCode:data.code
                    //     },
                    //     success:function(ajaxData){
                    //         var config = {
                    //             510181:1118,
                    //             510131:271,
                    //             510183:392,
                    //             5101:1781
                    //         };
                    //         var xlCount = config[data.code];
                    //         if(xlCount){
                    //             wt.extend(ajaxData,{
                    //                 WHITECOUNT:xlCount,
                    //                 TOTALCOUNT:data.TWCOUNT + xlCount + data.SUBWAYCOUNT + data.SOCIETYCOUNT
                    //             });
                    //         }
                    //         spData = ajaxData;
                    //     },
                    //     error:function(){
                    //         spData = {
                    //             TWCOUNT:0,
                    //             WHITECOUNT:0,
                    //             SUBWAYCOUNT:0,
                    //             SOCIETYCOUNT:0
                    //         }
                    //     }
                    // });
                    return '<div style="position:relative;z-index:1;padding:10px 20px;color: #fff;font-size: 14px;line-height:24px;"><div class="tooltip-bg fit"></div><div style="text-align:center">' + data.name + '</div><div>天网视频：'+ areaSpData.TWCOUNT +'</div>' + '<div>雪亮视频：'+ areaSpData.WHITECOUNT +'</div>' + '<div>地铁视频：'+ areaSpData.SUBWAYCOUNT +'</div>' + '<div>社会视频：'+ areaSpData.SOCIETYCOUNT +'</div></div>';
                }
            }
        };
    }
};


function dialog(title,url){
    var $div;
    if(top.$('body').dialog){
        $div = top.$('<div class="index-dialog"><iframe frameborder="0" style="height: 100%;width: 100%"></iframe></div>');
        $div.dialog({
            title:title,
            width:800,
            height:600,
            modal:true,
            buttons:[
                {
                    iconCls:'icon-close',
                    text:'关闭',
                    handler:function(){
                        $div.dialog('destroy');
                    }
                }
            ],
            onClose:function(){
                $div.dialog('destroy');
            }
        });
        $div.find('iframe').attr('src',url);
    }else{
        var iframeId = 'iframeId_' + +new Date();
        wt.dialog({
            title:title,
            width:800,
            height:600,
            content:'<iframe id="'+ iframeId +'" frameborder="0" style="height: 100%;width: 100%"></iframe>'
        });
        $('#' + iframeId).attr('src',url);
    }
}

function $alert(msg){
    var t$ = top.$;
    if(t$.dlg && t$.dlg.alertInfo){
        t$.dlg.alertInfo(msg);
    }else{
        alert(msg);
    }
}

function colMenuFunc(){
    $('#expandBtn').show();
}