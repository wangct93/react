(function($,window,und){

    var showUserAccount = 1;//顶层菜单栏是否显示用户账号
    var topMenus = {}; //顶层菜单
    var firstMenus = {};//第一层菜单
    var secondMenus = {};//第二层菜单
    var thirdMenus = {};//第三层菜单
    var fourMenus={};
    var urls={};
    var width=180;
    var clickArr={};		//快捷方式点击对象数组
    var isQuick=false;		//判断是否为快捷方式
    var selectIndex=0;

    var iframeMenuCache = [];//iframe菜单缓存
    var layoutCache = [];

    var iframeMenus={};	//单独iframe菜单

    var $iframeBox;//iframes

    var homeMap; //是否是防控圈

    var isIE8 = false;

    function menu(topMenuId,leftMenuId,centerMenuId){
        this.topMenuId = topMenuId || "topMenu_"+new Date().getTime(); //顶层菜单id
        this.leftMenuId = leftMenuId|| "leftMenu_"+new Date().getTime();//左边栏菜单id即第一层子菜单
        this.centerMenuId = centerMenuId|| "centerMenu_"+new Date().getTime();//右边内容id
    }


    menu.prototype.getRoleType = function(){
        if(!this.menus){
            return "";
        }

        if(typeof this.roleType == "undefined"){
            var menus = this.menus;
            var defaultmenu,len=menus.length;;
            for ( var i = 0; i < len; i++) {
                var m = menus[i];
                if(m.menuName == '我的平台'){
                    defaultmenu = m.defaultMenu;
//					break;
                }
                if(m.menuName == '电子地图'){
                    map_url = m.extUrl;
//					break;
                }
            }

            var hasRole = false;
            if(defaultmenu && defaultmenu.menuItemList){
                //根据菜单判断角色(采录员、审核员、研判员)
                var roletype = getRoleType(defaultmenu.menuItemList,"6000101020"); //审核员
                if(roletype != null){
                    this.roleType = "审核员";
                    hasRole = true;
                }else{
                    roletype = getRoleType(defaultmenu.menuItemList,"6000101010");//采录员
                    if(roletype != null){
                        this.roleType = "采录员";
                        hasRole = true;
                    }else{
                        roletype = getRoleType(defaultmenu.menuItemList,"6000101030");//研判员
                        if(roletype != null){
                            this.roleType = "研判员";
                            hasRole = true;
                        }
                    }
                }
            }

            if(!hasRole){
                this.roleType = "";
            }
        }

        return this.roleType;
    };

    /**
     * 修改菜单地址
     * */

    menu.prototype.changeSearchUrl = function(value){

    };

    /**
     * 生成顶层菜单。
     * @param menus 顶层菜单，包含所有子菜单
     */
    menu.prototype.createMenu = function(menus){
        this.menus = menus;
        var _this = this;
        $iframeBox = $("#frameBox");
        var centerId =  this.centerMenuId;
        if(!menus || menus.length == 0){
            showOrhideWestPanel(false);
            $.dlg.alertError("对不起，尚无任何菜单！");
            return;
        }
        var html = [];
        for ( var i = 0; i < menus.length; i++) {
            if(menus[i].display=='true'){
                var menu = menus[i];
                html[html.length] = createTopMenu(menu);
                var childs = menu.menuItemList||[];
                var menuId = menu.menuId;
                topMenus[menuId] = menu;
                if(childs.length==0){
                    iframeMenus[menuId]=1;
                }
                if(menu.selected=='true'){
                    selectIndex=i;
                }
                if(menu.menuName == '我的平台'){
                    if(menu.menuItemList[0].menuId == '600010'){
                        menu.defaultMenu = menu.menuItemList.shift();
                    }
                }
            }
        }
        var $topMenu=$('#'+this.topMenuId);
        this.initWest();		//初始化左边菜单
        var leftMenuId = this.leftMenuId;
        var $rightNav = $('#' + this.centerMenuId);
        setTimeout(function(){
            $topMenu.children()[selectIndex].click();
        },0);

        $topMenu.prepend(html.join(" ")).bind("click",function(e){//一级菜单事件
            var $target = $(e.target||event.srcElement);
            $target = $target.closest(".header-item");
            if($target.length){

                if($target.hasClass('active') && $target[0].deMenu){	//仅刷新iframe，不刷新左边菜单
                    $('#'+ leftMenuId).find('.active').removeClass('active');
                    createthirdMenu($target[0].deMenu,centerId);
                    return;
                }
                var menuId = $target.attr("id").substring(7);
                var menu=topMenus[menuId];
                $target.addClass('active').siblings('.active').removeClass('active');
                $rightNav.children().hide();

                if(menuId == 1000){
                    $('#pnameBox').css('visibility','hidden');
                }else{
                    $('#pnameBox').css('visibility','visible');
                }

                if(iframeMenus[menuId]){ //如果是顶层菜单
                    showFrame(menuId);
                    target = null;
                    li = null;
                    return;
                }
                emptyWestMenu(leftMenuId);
                var $box = $(this).next();

                //初始化左边菜单展开状态
                if($box.hasClass('box-collapsed')){
                    $box.removeClass('box-collapsed');
                }
                createChildMenu(menu,"first",leftMenuId,$rightNav); //创建子菜单
            }
        });



        //二级菜单事件，不需要重复进行绑定
        $('#'+leftMenuId).click(function(e){
            var target = $(e.target||event.srcElement);
            var li = target.closest("li",$(this)); //找到li
            if(li.length == 1){
                if(li.hasClass('active')&&!isQuick){
                    target = null;
                    li = null;
                    return;
                }
                clearFrameCache();
                var id = li.attr("id");
                var menuId = id.substring(7);
                var menu = secondMenus[menuId];
                if(menu.opstatus=='true'){
                    window.open(menu.extUrl,'alarmCenter');
                    target = null;
                    li = null;
                    return;
                }

                $('.menu-navTwo',$(this)).children().removeClass('active');
                li.addClass('active');
                var $nav = $('#' + _this.centerMenuId).children().first();
                if($nav.css('display') != 'none'){
                    $nav.find('.selected').removeClass('selected');
                }
                if($('#west').children().hasClass('west-collapse')){ //menubox
                    expandWest($(this));
                }
                createthirdMenu(menu,centerId,li);
            }
            target = null;
            li = null;
        });

        $rightNav.find('.video-nav').click(function(e){
            var $target = $(e.target||event.srcElement);
            if($target.hasClass('video-nav-item') && !$target.hasClass('selected')){
                var menuId = $target.attr("id").substring(7);
                var menu = thirdMenus[menuId];
                $target.addClass('selected').siblings().removeClass('selected');
                $('#' + leftMenuId).find('.active').removeClass('active');
                clearFrameCache();
                loadIframe(menu.extUrl,menuId);
//				var iframe = $('#frameBox').children('iframe:visible')[0];
//				var win = iframe.contentWindow || iframe.window;
//				if(win && win.$){
//					win.$('iframe').each(function(index,item){
//						var win = item.contentWindow || item.window;
//						if(win && win.doSearch){
//							win.doSearch();
//						}
//					});
//				}
            }
        });

        //三级导航菜单事件，不需要重复进行绑定
        $rightNav.find('.center-first-nav').click(function(e){
            var target = $(e.target||event.srcElement);
            if(target.hasClass('selected')){
                target = null;
                return;
            }
            if(target.hasClass("center-first-nav-item")){
                target.addClass('selected').siblings().removeClass('selected');
                var id = target.attr("id");
                var menuId = id.substring(7);
                var menu=thirdMenus[menuId];
                var childs=menu.menuItemList||[];
                var $secondNav=target.parent().next();
                if(childs.length>0){
                    $secondNav.show();
                    createFourMenu($secondNav,menu);
                }else{
                    $secondNav.hide();
                    loadIframe(menu.extUrl,menuId);
                }
                $secondNav = null;
            }
            target = null;
        });

        //四级导航菜单事件，不需要重复进行绑定
        $rightNav.find('.center-second-nav').click(function(e){
            var target = $(e.target||event.srcElement);
            if(target.hasClass('selected')){
                target = null;
                return;
            }
            if(target.hasClass("center-second-nav-item")){
                target.addClass('selected').siblings().removeClass('selected');
                var id = target.attr("id");
                var menuId = id.substring(7);
                var menu=fourMenus[menuId];
                loadIframe(menu.extUrl,menuId);
            }
            target = null;
        });
    };

    /**
     * 单独iframe菜单点击事件
     * */
    function showFrame(menuId){
        var $html=iframeMenus[menuId];
//		$iframeBox.prev().hide();
        showOrhideWestPanel(false);
        if(typeof $html !='object'){
            var menu=topMenus[menuId];
            var id = 'top_frame_'+menuId;
            $html=$('<iframe id="'+id+'"  frameborder="0" allowtransparency="false" src="" style="height: 100%;width: 100%;border: none;position:relative;"></iframe>');
            $iframeBox.append($html);
            iframeMenus[menuId]=$html;
            var url = menu.extUrl || menu.url;
            loadIframe(url,menuId,id);
            homeMap = false;
        }else{
            resizeIframeBox();
            $html.show().siblings().hide();
        }
        $html = null;
    }

    /**
     * iframe加载url
     * */
    function loadIframe(url,menuId,id){

        var $frame;
        if(id){
            $frame = $("#"+id);
        }else{
            $frame = getMenuFrame(menuId);
        }
        $("#frameBox").children("iframe").hide();
        resizeIframeBox();
        if(menuId){
            if($.inArray(menuId,iframeMenuCache)>-1){
                $frame.show();
                var layout = layoutCache;
                if(isIE8&&$.inArray(menuId,layout)==-1){ //布局过就不需要再布局了
                    setTimeout(function(){
                        var iframe = $frame[0];
                        var win = iframe.window||iframe.contentWindow;
                        if(win && win.doLayout ){
                            win.doLayout();
                            layout[layout.length] = menuId;
                        }
                        iframe = null;
                        win = null;
                    },25);
                }
                return ;
            }
        }

        if(isSearch && menuId == '60003030'){
            var text = encodeURIComponent($('#searchInput').val());
            url += (url.indexOf('?') == -1 ? '?' : '&') + 'keyWord=' + text;
            isSearch = false;
        }
        iframeMenuCache[iframeMenuCache.length] = menuId;
        $frame.show().attr('src',url);
        $frame = null;
    }

    /*
     * 获取地址配置
     * */
    function getUrlQueryString(name,str){
        if(!str){
            return null;
        }
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var search  = str.substr(str.indexOf("?")+1);
        var r = search.match(reg);
        if (r){
            return decodeURIComponent(r[2]);
        }
        return null;
    }

    /**
     * iframe加载成功
     * */
    function loadIframeSuccess(){
        $iframe.siblings('div').hide();
    }

    /**
     * 清空缓存，删除iframe
     */
    function clearFrameCache(){
        for(var i=0,count =iframeMenuCache.length;i<count;i++){
            var id = "menu_frame_"+iframeMenuCache[i];
            var iframe = $("#"+id)[0];
            if(iframe){
                try{
                    var fw = iframe.contentWindow||iframe.window;
                    if(fw&&fw.jQuery){
                        fw.jQuery("img").attr("src","").remove();
                        delete fw.jQuery.cache;
                        fw.document.write("");
                        fw.close();
                    }
                    fw = null;
                }catch(e){}
                iframe.src = '';
            }
            iframe = null;
            $("#"+id).remove();
        }
        iframeMenuCache.length=0;
        layoutCache.length=0;
        var t = top;
        if(t.rubbish){//top页面弹窗的垃圾收集器
            for(var i=0,count = t.rubbish.length;i<count;i++){
                $(rubbish[i]).dialog("destroy");
            }
        }
    }

    /*
     * 隐藏右边导航菜单
     * */

    /**
     *首页菜单快捷链接点击事件
     **/
    menu.prototype.click=function(id){
        var menus=this.menus;
        if(!getIndex(menus,id,0)){
            $.dlg.alertInfo('尚无权限使用此模块！');
            return;
        }
        isQuick=true;
        triggerClick(0);
    };

    /*逐个触发点击事件*/
    function triggerClick(num){
        if(num!=1 || !$('#menuId_'+clickArr[1]).hasClass('accordion-header-selected')){
            $('#menuId_'+clickArr[num]).trigger('click');
        }
        var l=parseInt(clickArr.level);
        if(num<l){
            setTimeout(function(){
                triggerClick(num+1);
            },0);
        }
    }
    /*获取需要点击的id数组对象*/
    function getIndex(menu,id,count){
        var childArr;
        for(var i=0;i<menu.length;i++){
            clickArr[count]=menu[i].menuId;
            if(menu[i].menuId==id){
                clickArr.level=count;
                clickArr.menu=menu[i];
                return true;
            }
            childArr=menu[i].menuItemList||[];
            if(childArr.length>0){
                if(getIndex(childArr,id,count+1)){
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 初始化左边菜单收缩事件
     * */
    menu.prototype.initWest=function(){

        $('#'+this.leftMenuId).accordion({
            width:180,
            height:'100%',
            onSelect:function(title,index){
                var $panel = $(this).eq(index).children().last();
            }
        });
    };


    /**
     * 设置为防控圈地图
     */
    menu.prototype.setHomeMap=function(flag){
        homeMap = flag;
    };


    /**
     * 初始化右边菜单
     * */
    function initRightMenu(opt,id){
        var url=opt.extUrl;
        //var $center=$('#center');
        if(url){
            loadIframe(url,opt.menuId);
        }else{
            setTimeout(function(){
                var $westMenu=$('#'+id);
                var childMenusEles=$westMenu.find('.menu-navTwo').children();
                var $secondEle=$westMenu.find('.accordion-header').eq(0);
                if(!$secondEle.hasClass('accordion-header-selected')){
                    $secondEle.trigger('click');
                }
                var list=opt.menuItemList[0].menuItemList||[];
                for(var i=0;i<list.length;i++){
                    if(list[i].opstatus!='true'){
                        childMenusEles.eq(i).trigger('click');
                        break;
                    }
                }
                childMenusEles = null;
                $secondEle = null;
                $westMenu = null;
            },0);
        }
    }


    /**
     * 重置iframe高度
     * */
    function resizeIframeBox(){
        $iframeBox.css('paddingBottom',$iframeBox.prev()[0].offsetHeight + 'px');
    }
    /**
     * 创建顶层菜单
     */
    function createTopMenu(menu){
        var hasIcon= menu.iconCls!= und && menu.iconCls!=null;
        var isHide = menu.show == 'false';
        var className = (menu.iconCls || 'header-item-noicon') + (menu.show == 'false' ? ' hide' : '') + (menu.right == 'true' ? ' fr' : '');

        return '<a id="menuId_' + menu.menuId + '" class="header-item ' + className + '">'+ menu.menuName +'</a>'
    }
    /**
     * 创建子菜单
     */
    function createChildMenu(pMenu,type,id,$rightNav){
        var menus = pMenu.menuItemList;
        if("first" == type){ //第一层子菜单
            var westMenu=$('#'+id);
            if($.isArray(menus) && menus.length > 0){ // 暂不考虑type，默认菜单在左边栏
                showOrhideWestPanel(true);
                var parent = document.getElementById('menuId_' + pMenu.menuId);
                for(var i = 0;i < menus.length;i++){
                    if(menus[i].display == 'true'){
                        var menu = menus[i];
                        var html = [];
                        var childs = menu.menuItemList||[];
                        var menuId = menu.menuId;
                        firstMenus[menuId] = menu;
                        html[html.length]='<ul class="menu-navTwo">';
                        for(var j = 0;j < childs.length;j++){
                            if(childs[j].display == 'true'){
                                secondMenus[childs[j].menuId] = childs[j];
                                html[html.length] = getSecondMenuHTML(childs[j]);
                            }
                        }
                        html[html.length]='</ul>';
                        var obj = {
                            title:menu.menuName,
                            iconCls:'icon-triangle',
                            selected:false,
                            content:html.join(''),
                            panelHeightAuto:true
                        };
                        westMenu.accordion('add',obj);
                        westMenu.find('.panel').last().children().first().attr('id','menuId_'+menu.menuId);

                    }
                }
                var $nav = $rightNav.find('.video-nav');
                if(pMenu.defaultMenu){
                    createDefaultMenu($nav,pMenu.defaultMenu);
                }else{
                    westMenu.find('.accordion-header').first().trigger('click');
                    westMenu.find('.menu-navTwo').first().children().first().trigger('click');
                }
                westMenu.find('.panel-header').hover(leftBoxEnter,leftBoxLeave);
            }else{//隐藏左边栏，改变中间布局的地址
                showOrhideWestPanel(false);
            }
            westMenu = null;
        }

    }

    function createDefaultMenu(box,menu){

        var menus = menu.menuItemList || [];
        var str = '';
        for(var i = 0;i < menus.length;i++){
            var menu = menus[i];
            var menuId = menu.menuId;
            thirdMenus[menuId] = menu;
            str += '<span  id="menuId_' + menuId + '" class="video-nav-item ' + (menu.iconCls || '') + '">'+menu.menuName+'</span>';
        }
        box.show().children('.vnav-box').html(str).children().first().trigger('click');
    }

    //清空左边菜单
    function emptyWestMenu(id){
        var $left=$('#'+id);
        var i = $left.children().length;
        while(i){
            $left.accordion('remove',0);
            i--;
        }
        $left = null;
    }

    //清空右边选项卡
    function emptyCenterTabs($ele){
        var i = $ele.children().eq(1).children().length;
        while(i){
            $ele.tabs('close',0);
            i--;
        }
    }

    //左边菜单文字移入移出事件
    function leftBoxEnter(){
        var $box = $(this).closest('.box-collapsed');
        if($box.length){
            var $ele = $('<div class="tips" style="top:' + this.offsetTop + 'px;">' + this.children[0].innerHTML + '</div>');
            $box.children().first().append($ele);
            this.tipEle = $ele;
        }
    }
    function leftBoxLeave(){
        var $ele = this.tipEle;
        if($ele){
            $ele.remove();
        }
    }
    //显示或隐藏左边菜单
    function showOrhideWestPanel(isShow){
        var $box = $('.container');
        if(isShow){
            $box.removeClass('no-left');
        }else{
            $box.addClass('no-left');
        }
    }

    //重置layout左边跟中间宽度
    function layoutResize(w){
        $('#west').panel('resize',{
            width:w
        });
        $('#mainLayout').layout("resize");
    }

    //获得二级菜单html
    function getSecondMenuHTML(menu){
        var html = [];
        var hasIcon=menu.iconCls!=und && menu.iconCls!=null;
        html[html.length]  = '<li id="menuId_'+menu.menuId+'">';
        html[html.length]  = '	<div class="menu-navTwo-item panel-header">';
        html[html.length]  = ' <span class="menu-navTwo-text">'+menu.menuName+'</span>';
        html[html.length]  = ' <span class="icon '+(hasIcon?menu.iconCls:'')+'"></span>';
        html[html.length]  = '	</div>';
        html[html.length]  = '</li>';
        return html.join(" ");
    }

    /**
     * 创建三级菜单页面*/
    function createthirdMenu(menuObj,id,target) {
        var menus=menuObj.menuItemList||[];
        var centerMenu=$('#'+id);
        if( menus.length==0){
//			centerMenu.hide();
            var url=menus.length==0?menuObj.extUrl:menus[0].extUrl;
            var menuId = menus.length==0?menuObj.menuId:menus[0].menuId;
            loadIframe(url,menuId); //显示页面
        }else{
//			centerMenu.show();
            var $firstNav=centerMenu.find('.center-first-nav');
            var htmlStr=[];
            for(var i=0;i<menus.length;i++){
                var menu=menus[i];
                if(menu.display=='true'){
                    var menuId=menu.menuId;
                    htmlStr[htmlStr.length]='<span  id="menuId_'+menuId+'" class="center-first-nav-item ' + (menu.iconCls || '') + '">'+menu.menuName+'</span>';
                    var childs=menu.menuItemList||[];
                    thirdMenus[menuId]=menu;
                }
            }
            $firstNav.html(htmlStr.join('')).show();
            setTimeout(function(){
                $firstNav.children().first().trigger('click');
            },0);
        }
        centerMenu = null;
    }

    /**
     * 创建4级菜单导航
     * */
    function createFourMenu($nav,menuObj){
        $nav.empty();
        var menus = menuObj.menuItemList||[];
        var htmlStr=[];
        for(var i=0;i<menus.length;i++){
            var menu=menus[i];
            if(menu.display=='true'){
                var menuId=menu.menuId;
                htmlStr[htmlStr.length]='<span id="menuId_'+menuId+'" class="center-second-nav-item">'+menu.menuName+'</span>';
                fourMenus[menuId] = menu;
            }

        }
        $nav.append(htmlStr.join(''));
        (function(menu){
            setTimeout(function(){
                menu.trigger('click');
            },1);
        })($nav.children().first());
        $nav = null;
    }

    /***
     * 创建iframe
     */
    function getMenuFrame(menuId,src){
        var id = "menu_frame_"+menuId;
        if($("#"+id).length==0){
            var html = [];
            html[html.length] = '<iframe frameborder="0" allowtransparency="false"  style="position:relative;height: 100%;width: 100%;border: none"';
            if(menuId){
                html[html.length] = ' id="'+id+'" ';
            }
            if(src){
                html[html.length] = ' src="'+src+'" ';
            }
            html[html.length] = ' ></iframe>';
            $("#frameBox").append(html.join(""));
        }
        return $("#"+id);
    }


    function getRoleType(menus,id){
        var len = menus.length;
        for(var i=0;i<len;i++){
            var menu = menus[i];
            if(menu.menuId == id){
                return menu.menuName;
            }
        }
        return null;
    }


    window.menu=menu;

})(jQuery,window);