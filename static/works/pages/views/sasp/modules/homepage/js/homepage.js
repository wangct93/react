var baseUrl = window.location.protocol + "//" + window.location.host;
var userInfo = parent.userInfo;
var pathname = location.protocol + '//' + location.host + '/' + location.pathname.split('/')[1] + '/';
var clickEvents = {
    domain: function () {
        var type = arguments[0];
        if (!userInfo && type != 'mbqr') {
            showLoginBox();
        } else if (typeof this[type] == 'function') {
            var args = [];
            for (var i = 1, l = arguments.length; i < l; i++) {
                args.push(arguments[i]);
            }
            this[type].apply(this, args);
        }
    },
    mbqr: function () {
        window.open(pathname + 'liveyc/newMain/view/detail/detail.html?id=' + arguments[0], 'mbbr_win');
//			window.open(pathname + 'servletInvoker.invoke?requestType=new&dtableName=caseIndetifyDetail&zdqx=detail&attach=1&title=%25E7%259B%25AE%25E6%25A0%2587%25E8%25BE%25A8%25E8%25AE%25A4&id=' + arguments[0]);
    },
    zxaj: function () {
        window.open(pathname + 'liveyc/caseJudge/caseInfo.jsp?caseId=' + arguments[0], 'zxaj_win');
    },
    zxcb: function () {
        window.open(pathname + 'liveyc/seriesAndParallel/jsp/caseMergerDetail.jsp?chuangbingflag=0&infoType=4&mergeId=' + arguments[0] + '&caseIds=' + arguments[1]);
    },
    tzgg: function () {
        var num = arguments[0];
        window.open('/appSystem/liveyc/announceManage/jsp/noticeDetail.html?nid=' + num, 'tzgg_win');
    },
    dxal: function () {
        window.open(pathname + 'typicalCase/pdfDetail1.jsp?pdf=' + arguments[0], 'dxal_win');
    },
    tszs: function () {
        window.open(pathname + 'liveyc/systemInfo/detail.html?id=' + arguments[0], 'tszs_win');
    },
    ajxc: function () {
        var url = pathname + 'liveyc/bulletin/jsp/bulletinDetail.htm?bId=' + arguments[0];
        window.open(url);
    }
};
$(function () {
    //临时登录子系统
    loginChildComp(location.pathname.split('/')[1]);
    loginChildComp('appSystem');
    updateNotice();
    initTabs();
    initEvent();
    initEcharts();
    initAreaClickEvent();
    initLastCase(); //最新案件，最新串并
    initFriendLink();
});


function initLastCase() {
    var configs = {
        zxaj: {
            url: 'json/getCaseInfoMapList.json',
            length: 8,
            fields: {
                src: 'HTTPIMG',
                title: 'CASENAME',
                time: 'CREATEDATE_SHOWVALUE'
            },
            data: {
                SEARCHSPAN: 2,
                start: 0,
                limit: 8,
                homePage: 1,
                NOTZC: 1
            },
            rowField: 'results',
            method: 'post',
            id: "zxaj"
        },
        zxcb: {
            url: 'json/getCaseInfoMergeList.json',
            length: 8,
            fields: {
                src: 'defaultImgPath',
                title: 'mergeTitle',
                time: 'mergeTimeStr',
                id: 'mergeBh',
                id2: 'caseIds'
            },
            data: {
                mergeType: '全部',
                type: 0,
                start: 0,
                limit: 8
            },
            rowField: 'results',
            method: 'post',
            id: "zxcb"
        },
        ajxc: {
            url: 'json/getBulletinList.json',
            length: 8,
            fields: {
                src: 'PHOTOID',
                title: 'CASENAME',
                time: 'PUBLISHTIME',
                id: 'ID'
            },
            data: {
                inbulletintype: '0,1,2',
                start: 0,
                limit: 8
            },
            rowField: 'results',
            method: 'post',
            id: "ajxc"
        }

    };
    for (var i in configs) {
        var config = configs[i];
        var $ele = $("#" + config.id);
        doAjax(config, $ele);
    }
}

function initAreaClickEvent() {
    var $parent = $('.box-range');
    $parent.children().click(function () {
        var $this = $(this);
        var index = $this.index();
        var areacode = 3 - index;
        var $ele = $this.parent().parent().next().children('.item-list');
        $this.addClass('active').siblings().removeClass('active');
        var configs = {
            mbqr: {
                url: 'json/getCaseIdentifyList.json',
                length: 8,
                fields: {
                    src: 'MAINPIC',
                    title: 'CASENAME',
                    time: 'CREATEDATE',
                    infoType: 'INFOTYPE',
                    id: 'ID'
                }
            }
        };
        var config = configs[$ele.attr('id')];
        doAjax(config, $ele);
    });
    $parent.each(function (index, item) {
        $(item).children().eq(0).trigger('click');
    });
}

function doAjax(config, $ele) {
    $.ajax({
        type: config.method || 'get',
        url: config.url,
        data: config.data,
        success: function (data) {
            if (!data) {
                data = {rows: [], results: []};
            }
            var rows = data[config.rowField || 'rows'];
            updateHtml($ele, rows, config.fields, config.length);
        },
        error: function (e) {
            updateHtml($ele, [], config.fields, config.length);
        }
    });
}

var clickSA = {};
function getClickSA() {
    return clickSA;
}

var clickCA = {};
function getClickCA() {
    return clickCA;
}

function initEcharts() {
    var img_option = {
        color: ["#6FD2F6"],
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            data: ['涉案统计'],
            show: false
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#888'
                    }
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#888'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#888'
                    }
                }
            }
        ],
        series: [
            {
                name: '涉案统计',
                type: 'bar',
                barWidth: 20,
                data: []
            }
        ]
    };
    var cb_option = {
        color: ["#6FD2F6"],
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            data: ['串并统计'],
            show: false
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                axisLabel: {
                    rotate: 0,
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#888'
                    }
                }
            }

        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    textStyle: {
                        color: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#888'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#888'
                    }
                }
            }
        ],
        series: [
            {
                name: '涉案统计',
                type: 'bar',
                barWidth: 20,
                data: []
            }
        ]
    };
    //涉案图
    var now = new Date();
    var et = now.toFormatString();
    now.setYear(now.getFullYear() - 1);
    var st = now.toFormatString();
    $.ajax({
        type: 'get',
        url: 'json/sastk.json',
        data: {
            startTime: st,
            endTime: et
        },
        success: function (data) {
            var sheAn = document.getElementById("sheAn");
            var myChart = echarts.init(sheAn);
            var xAxis = [];
            ;
            var series = [];
            ;
            for (var i = 0; i < data.length; i++) {
                if (data[i].ROLENAME == null || data[i].ROLENAME == 'null') {
                    continue;
                }
                if (data[i].ROLENAME.indexOf('省') != -1) {
                    data[i].ROLENAME = data[i].ROLENAME.substr(data[i].ROLENAME.indexOf('省') + 1)
                }
                xAxis.push(data[i].ROLENAME.replace("公安局", ""));
                series.push({
                    value: data[i].TREECOUNT,
                    roleId: data[i].ROLEID,
                    roleName: data[i].ROLENAME
                });

            }
            img_option['xAxis'][0].data = xAxis;
            img_option['series'][0].data = series;
            myChart.setOption(img_option);
            myChart.on('click', function (item) {
                clickSA.roleId = item.data.roleId;
                clickSA.roleName = item.data.roleName;
                window.open(pathname + "servletInvoker.invoke?requestType=dsearch&dtableName=InputStatics");
            });
            sheAn.chart = myChart;
        }
    });
    //串案图
    $.ajax({
        type: 'get',
        url: 'json/sastk2.json',
        data: {
            startTime: st,
            endTime: et
        },
        success: function (data) {
            var link = document.getElementById("link");
            var myChart = echarts.init(link);
            var xAxis = [];
            var series = [];
            var results = data;
            for (var i = 0; i < results.length; i++) {
                if (results[i].ROLENAME == null || results[i].ROLENAME == 'null') {
                    continue;
                }
                results[i].ORGROLENAME = results[i].ROLENAME;
                if (results[i].ROLENAME.indexOf('省') != -1) {
                    results[i].ROLENAME = results[i].ROLENAME.substr(results[i].ROLENAME.indexOf('省') + 1)
                }
                xAxis.push(results[i].ROLENAME.replace("公安局", ""));
                series.push({
                    value: results[i].TREECOUNT,
                    roleId: results[i].ROLEID,
                    roleName: results[i].ORGROLENAME
                });
            }
            cb_option['xAxis'][0].data = xAxis;
            cb_option['series'][0].data = series;
            myChart.setOption(cb_option);
            myChart.on('click', function (item) {
                var roleId = item.data.roleId;
                clickCA.roleId = roleId;
                clickCA.roleName = item.data.roleName;
                window.open(pathname + "servletInvoker.invoke?requestType=dsearch&dtableName=deptCBAnalysis");
            });
            link.chart = myChart;
            link.options = cb_option;
        }
    });


    var link = document.getElementById("link");
    myChart = echarts.init(link);
    myChart.setOption(cb_option);
    link.chart = myChart;
}
function initEvent() {
    if (userInfo) {
        var str = userInfo.userName + '，欢迎您！';
        $('#user').html(str).parent().addClass('logined');
        $('#userInfo').click(openUserInfo);
        $('#register-btn').hide();
    } else {
        $('#login-btn').click(showLoginBox);
        $('#register-btn').click(registerUser);//账户申请
    }

    $('#menuList').children().click(function () {
        if (userInfo) {
            var menuId = this.getAttribute('menuid');
            if (top && top.menuObj) {
                if (menuId == '6000101020') {
                    top.$('#menuId_6000').trigger('click');
                    top.$('#menuId_6000101020').trigger('click');
                } else {
                    top.menuObj.click(menuId);
                }
            }
        } else {
            showLoginBox();
        }
    });
    $('#ptcj').html('2018.01.30');
}
/**
 * 用户信息
 */
function openUserInfo() {
    var user = top.userInfo || {};
    var newheight = 479;
    if (user.isSuperAdmin == 1) {
        newheight = 415;
    }
    var opt = {
        title: '用户信息',
        modal: true,
        width: 350,
        height: newheight,
        url: 'view/userInfo/userInfo.html',
        buttons: [
            {
                iconCls: 'icon-ok',
                text: '确定',
                handler: editInfo
            },
            {
                iconCls: 'icon-close',
                text: '取消',
                handler: closeInfoDialog
            }
        ],
        id: 'userInfo_win'
    };
    openDialog(opt);
}

function seeMore() {
    var e = event;
    if (!userInfo) {
        showLoginBox();
    } else {
        var ele = e.target || e.srcElement;
        var type = ele.getAttribute('type');
        var moreUrls = {
            tzgg: '/appSystem/servletInvoker.invoke?requestType=dsearch&dtableName=bulletinManage',
            mbbr: pathname + 'servletInvoker.invoke?requestType=dsearch&dtableName=caseIndetify&infoType=&title=%25E7%259B%25AE%25E6%25A0%2587%25E8%25BE%25A8%25E8%25AE%25A4',
            zxaj: pathname + 'liveyc/caseKu/jsp/scroll.html?url=servletInvoker.invoke%3FrequestType=dsearch%26dtableName=myVideoCase%26title=%25E6%259C%2580%25E6%2596%25B0%25E6%25A1%2588%25E4%25BB%25B6',
            zxcb: pathname + 'servletInvoker.invoke?requestType=dsearch&dtableName=SerialParallelList&share_show=-1',
            tszs: pathname + 'servletInvoker.invoke?requestType=dsearch&dtableName=systemInfo',
            ajxc: pathname + 'servletInvoker.invoke?requestType=dsearch&dtableName=bulletinList'
        };
        window.open(moreUrls[type]);
    }
}
function showLoginBox() {
    var t$ = top.$;
    var $box = t$('#loginWin');
    if ($box && $box.length) {
        $box.show();
    }
}


function initTabs() {
    $('#tabs').children().click(function () {
        var $this = $(this);
        if ($this.hasClass('active')) {
            return;
        }
        var $panels = $('#tabPanelBox').children().removeClass('active');
        $this.addClass('active').siblings().removeClass('active');
        var $panel = $panels.eq($this.index());
        $panel.addClass('active');
        if ($panel.children().first().css('width') == '0px') {
            $panel.html('');
            var ele = $panel[0];
            var myChart = echarts.init(ele);
            myChart.setOption(ele.options);
            myChart.on('click', function (item) {
                var roleId = item.data.roleId;
                clickCA.roleId = roleId;
                clickCA.roleName = item.data.roleName;
                window.open(pathname + "servletInvoker.invoke?requestType=dsearch&dtableName=deptCBAnalysis");
            });
        }
    });
    $('#tabs2').children().click(function () {
        var $this = $(this);
        if ($this.hasClass('active') || $this.hasClass('box-more')) {
            return;
        }
        var index = $this.index();
        var $panels = $('#panelBox2').children().removeClass('active');
        var $panel = $panels.eq(index);
        var methods = [];
        if ($panel.children().length == 0) {
            var url, title, field;
            if ($this.html() == '典型案例') {
                title = 'CASENAME';
                field = 'ATTACHFILE';
                url = 'json/getTypicalCaseInfoList.json';
            } else {
                title = 'TITLE';
                field = 'ID';
                url = 'json/getSystemInfoByParams.json';
            }
            $.ajax({
                type: 'post',
                url: url,
                data: {
                    type: index ? index : 1,
                    start: 0,
                    limit: 10
                },
                success: function (data) {
                    var fields = {
                        title: title,
                        time: 'CREATETIME',
                        src: 'DEFAULTIMG',
                        id: field
                    };
                    var rows = data.rows || data.results;
                    if (index > 2) {
                        updateLine($panel, rows, fields);
                    } else {
                        updateHtml($panel, rows, fields, 4);
                    }

                },
                error: function (e) {
                    updateHtml($panel, [], {}, 4);
                }
            });
        }
        $this.addClass('active').siblings().removeClass('active');
        $panel.addClass('active');
    }).eq(0).trigger('click');
}

function doLoginTemp(type) {

}

//通知公告
function updateNotice() {
    var now = new Date();
    var et = now.toFormatString();
    now.setDate(now.getDate() - 30);
    var st = now.toFormatString();
    var param = {
        start: 0,
        limit: 10,
        startTime: st,
        endTime: et
    };
    $.ajax({
        type: 'post',
        data: param,
        url: 'json/notice.json',
        success: function (data) {
            if (data && data.results && data.results.length) {
                var str = data.results.reduce(function (prev, next, index) {
                    var content = next['HEADLINE'];
                    var timeArr = next['PUBLISHTIME'].split(' ')[0].split('-');
                    var time = timeArr[1] + '-' + timeArr[2];
                    var newContent = content;
//			        if(content&&content.length>18)
//			        	newContent=content.substr(0,18)+"...";
                    var str = '<div class="notice-item"><span class="fr notice-time">' + time + '</span><i class="notice-icon"></i><span title="' + content + '" class="notice-content" onclick="clickEvents.tzgg(' + next.ID + ')">' + newContent + '</span></div>';
                    return prev + str;
                }, '');
                $('#notice').html(str);
            }
        }
    });
}

function addZero(str, len) {
    var length = str.length;
    for (var i = length; i < len; i++) {
        str = '0' + str;
    }
    return str;
}

//公告模版
function updateLine($ele, rows, fields) {
    var str = '', row;
    for (var i = 0; i < rows.length; i++) {
        row = rows[i];
        str += '<div class="notice-item"><span class="fr notice-time">' + row[fields.time].split(' ')[0] + '</span><i class="notice-icon"></i><span class="notice-content" onclick="clickEvents.domain(\'tszs\',' + row[fields.id] + ')">' + row[fields.title] + '</span></div>';
    }
    $ele.html(str);
}

//更新页面
function updateHtml($ele, rows, fields, len) {
    if (!rows) {
        return;
    }
    var str = '';
    var src, click, title, time, infoType;
    var errorSrc = '../../../../img/1.jpg';
    for (var i = 0; i < len; i++) {
        var row = rows[i];
        if (row) {
            src = row[fields.src] || '';
            src = src.split('$$')[0];
            click = 'clickEvents.domain(\'' + ($ele.attr('id') || 'tszs') + '\',\'' + row[fields.id || 'CASEID'] + '\',\'' + row[fields.id2] + '\')';
            title = row[fields.title];
            time = row[fields.time];
            infoType = row[fields.infoType];
            if (infoType && (infoType === '1' || infoType === 1)) {
                str += '<div class="box-item"><div class="item-img-box" onclick="' + click + '"><span class="bonus">有奖 </span><img src="' + src + '" onerror="this.src = \'' + errorSrc + '\';"></div><p class="item-text"><span class="item-text-title" title="' + title + '" onclick="' + click + '">' + title + '</span></p><p class="item-text item-text-time">' + time + '</p></div>';
            } else {
                str += '<div class="box-item"><div class="item-img-box" onclick="' + click + '"><img src="' + src + '" onerror="this.src = \'' + errorSrc + '\';"></div><p class="item-text"><span class="item-text-title" title="' + title + '" onclick="' + click + '">' + title + '</span></p><p class="item-text item-text-time">' + time + '</p></div>';
            }
        } else {
//			src = errorSrc;
//			click = '';
//			title = '&nbsp;';
//			time = '&nbsp;'
            str += '';
        }

    }
    $ele.html(str);
}

//退出
function logOut() {
    var id = 'logOut' + new Date().getTime();
    $.dlg.dialog('确定退出系统吗？', function () {
        quitSubproject(window.location.pathname.split('/')[1]);
        quitSubproject('appSystem');
        $.ajax({
            url: 'logOut.do',
            dataType: "json",
            data: null
        }).always(function () {
            top.location.reload();
        })
    }, $.noop(), {id: id});
    $('#' + id).parent().next().next().append('<iframe  scrolling="no" frameborder="0" style="width:100%;height:100%;border:none;position:absolute;z-index:-1;top:0;left:0;filter:Alpha(opacity=0);" src="about:blank"></iframe>');
}
function quitSubproject(name) {
    $.ajax({
        url: '/' + name + '/logOut.do',
        success: function (da) {
        }
    });
}

//进入我的平台
function toPlatform() {
    if (top && top.menuObj) {
        top.menuObj.click(6000);
    }
}


function openDialog(opt) {
    var id = opt.id || 'dialogId_' + (+new Date());
    var t$ = top.$;
    var $target = t$('#' + id);
    if ($target.length) {
        $target.dialog('open');
    } else {
        $target = t$('<div id="' + id + '"><iframe scrolling="no" frameborder="0" allowtransparency="true" src="" style="height: 100%;width: 100%;border: none;position:relative;"></iframe></div>');
        t$('body').append($target);
        $target.dialog(opt).children().attr('src', opt.url);
    }
}
/**
 * 修改用户信息
 */
function editInfo() {
    var iframe = top.$('#userInfo_win').find('iframe')[0];
    var win = iframe.window || iframe.contentWindow;
    var data = win.getInfo();

    var oldPW = $.trim(data.oldPW);
    if (oldPW == "") {
        $.dlg.alertError("请输入原密码！");
        return;
    }
    data.oldPW = md5(oldPW);

    var userPW = $.trim(data.userPW);
    var checkUserPW = $.trim(data.checkUserPW);
    if (userPW != checkUserPW) {
        $.dlg.alertError("二次输入的密码不一致，请重新输入！");
        return;
    }
    if (userPW != null && userPW != "") {
        data.userPW = md5(userPW);
        data.checkUserPW = md5(checkUserPW);
    }

    var policeNumber = $.trim(data.policeNumber);
    if (data.userType == "1" && policeNumber == "") {
        $.dlg.alertError("请输入警号！");
        return;
    }

    $.dlg.dialog("确定要保存修改的信息吗？", function () {
        $.ajax({
            type: 'post',
            data: data,
            url: '/appSystem/userAction!updateGeUserDomViid.do',
            success: function (result) {
                if (result && result.success) {
                    if (!data.userPW) {//不修改pw
                        data.userPW = data.oldPW;
                    }
                    $.extend(top.userInfo, data);
                    refreshGeUser(top.userInfo.userPW);
                    top.$('#userInfo_win').dialog('destroy');
                    $.dlg.alertInfo("保存成功！");
                } else {
                    $.dlg.alertInfo(result.msg || "保存失败！");
                }
            }, error: function () {
                $.dlg.alertInfo("操作失败！");
            }
        });
    });
}
/**
 * 刷新后台geUser
 */
function refreshGeUser(pw) {
    $.ajax({
        type: 'post',
        url: 'refreshGeUser.do',
        data: {pw: pw},
        success: function () {

        }
    });
}

function closeInfoDialog() {
    var iframe = top.$('#userInfo_win').find('iframe')[0];
    var win = iframe.window || iframe.contentWindow;
    win.setInfo(win.info);//关闭前重置用户信息
    closeDialog.call(this);
}

function closeDialog() {
    var t$ = top.$;
    var $target = t$(this).parent().prev();
    $target.dialog('close'); //只是close，不是destroy
}

function loginChildComp(compName) {

}

function downloadPlayer() {
    window.open(pathname + 'nViewCtrl_setup.exe');
}
function downloadOp() {
    window.open('/ReadMe.pdf');
}
//2018培训视频
function downloadVideo() {
    window.open('/20180208.rar');
}

//申请账户
function registerUser() {
    var url = location.protocol + '//' + location.host + '/' + "appSystem/servletInvoker.invoke?requestType=dsearch&dtableName=userRegisterList";
    window.open(url, "registerUserList");
}

function initFriendLink() {
    $.ajax({
        url: 'json/getMainPageLinkList.json',
        data: {
            start: 0,
            limit: 10,
            isShow: 1
        },
        success: function (result) {
            if (result && result.rows && result.rows.length) {
                var rows = result.rows;
                var str = '';
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var url = row.URL.indexOf('http://') == -1 ? 'http://' + row.URL : row.URL;
                    str += ' <span class="home-textbox"><a title="' + row.NAME + '" target="_blank" href="' + url + '" class="home-text">' + row.NAME + '</a></span>';
                }
                $('#yqlj').append(str);
            }
        },
        error: function () {
            $.dlg.alertInfo('友情链接获取失败');
        }
    });
}