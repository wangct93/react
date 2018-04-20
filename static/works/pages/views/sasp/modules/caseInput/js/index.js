/**
 * Created by Administrator on 2018/4/16.
 */

$(() => {
    view.init();
});
let view = {
    init(){
        this.setParams();
        this.addEvent();
        this.initData();
    },
    initData(){},
    setParams(){
        this.list = [];
    },
    addEvent(){
        this.addDragEvent();
        $('#navList').click(e => {
            let $li = wt.$(e.target).closest('li');
            if($li.length){
                this.tabNav($li.index());
            }
        }).children().eq(0).click();

        $('#footer').click(e => {
            let $btn = $(e.target).closest('.w-btn');
            if($btn.length){
                let toIndex = $btn.attr('toIndex');
                if(toIndex){
                    this.tabNav(toIndex);
                }else{
                    let sep = +$btn.attr('sep');
                    if(sep){
                        this.tabNav($('#navList').children('.active').index() + sep);
                    }
                }
            }
        });
        $('#uploadFjList').click(e => {
            let $btn = $(e.target).closest('.remove-btn');
            if($btn.length){
                this.removeFj($btn.closest('li').index());
            }
        });
        $('#uploadBtn').click(e => {
            $('#uploadInput').click();
        });
        $('#uploadInput').change(e => {
            let {files = []} = e.target;
            for(let i = 0,len = files.length;i < len;i++){
                let reader = new FileReader();
                let file = files[i];
                reader.onload = e => {
                    let data = e.target.result;
                    this.addFj({
                        fileId:this.newFileId(),
                        fileName:file.name,
                        url:data
                    })
                };
                reader.readAsDataURL(file);
            }
        });
        $('#classIfyPanel').click(e => {
            let $i = wt.$(e.target);
            if($i.getNodeName() === 'I' && $i.closest('.fj-type-box').length){
                this.removeType($i.closest('li'),$i.attr('type'));
            }
        });
        $('.config-item').click(e => {
            wt.addActive(e.target);
        });
        $('#fmFjList').click(e => {
            let $li = $(e.target).closest('li');
            if($li.length){
                wt.addActive($li);
            }
        });
    },
    tabNav(index){
        let $lis = $('#navList').children();
        wt.addActive($lis.eq(index));

        let $panel = $('#panelBox').children().eq(index);
        wt.addActive($panel);
        if(!$panel.data('loaded')){
            $panel.data('loaded',1);
            let func = $panel.attr('func');
            if(typeof this[func] === 'function'){
                this[func]($panel);
            }
        }
        let ary = [];
        if(index === 0){
            ary = [1];
        }else if(index === $lis.length - 2){
            ary = [0,2];
        }else if(index === $lis.length - 1){

        }else{
            ary = [0,1];
        }
        let $btns = $('#footer').children().hide();
        ary.forEach(item => {
            $btns.eq(item).css('display','inline-block');
        });
    },
    addDragEvent(){
        let $ = wt.$;
        let $box = $('#classIfyPanel');
        $box.mousedown(e => {
            let $img = $(e.target);
            if ($img.getNodeName() !== 'IMG') {
                return;
            }
            let isMove = false;
            let $li = $img.closest('li');
            let $selectLis = $li.siblings('.active').add($li);
            let $drag = $('<div class="drag-container"><div class="drag-bg"><img class="drag-img"></div><div class="drag-num"></div><div class="drag-letter"></div></div>');
            $drag.find('img').attr('src',$selectLis.find('img').first().attr('src'));
            $drag.find('.drag-num').html($selectLis.length);

            let ox = e.clientX; // 鼠标初始位置
            let oy = e.clientY;
            let move = e => {
                let cx = e.clientX;
                let cy = e.clientY;
                let x = cx - 60;
                let y = cy - 55;
                if(isMove){
                    $drag.css({
                        top : y + 'px',
                        left : x + 'px'
                    });
                    $('#dropList').children().forEach(item => {
                        let $item = wt.$(item);
                        let rect = $item.getRect();
                        if(cx > rect.left && cx < rect.right && cy > rect.top && cy < rect.bottom){
                            $item.addClass('active');
                        }else{
                            $item.removeClass('active');
                        }
                    });
                }else if(Math.abs(cx - ox) > 10 || Math.abs(cy - oy) > 10){
                    isMove = true;
                    let $clones = null;
                    $selectLis.find('img').forEach(item => {
                        let $item = wt.$(item);
                        let $clone = $item.clone(true);
                        let {width,height,left,top} = $item.getRect();
                        $clone.css({
                            position:'absolute',
                            width:width + 'px',
                            height:height + 'px',
                            left:left + 'px',
                            top:top + 'px',
                            zIndex:100
                        });
                        if($clones){
                            $clones.add($clone);
                        }else{
                            $clones = $clone;
                        }
                    });
                    $('body').append($clones).append($drag);
                    $clones.animate({
                        top : y + 'px',
                        left : x + 'px',
                        opacity : 0
                    },100,elem => {
                        $(elem).remove();
                    });
                }
            };

            let up = e => {
                if(isMove){
                    let $drop = $('#dropList').find('.active');
                    if($drop.length){
                        this.addType($selectLis,$drop);
                        $drop.removeClass('active');
                    }
                    $drag.remove();
                    $li.removeClass('active').siblings('.active').removeClass('active');
                }else{
                    $li.toggleClass('active');
                }
                $('body').unbind('mousemove',move).unbind('mouseup',up);
            };
            $('body').bind('mousemove',move).bind('mouseup',up);
        });
        document.body.ondragstart = () => {
            return false;
        };
    },
    newFileId(){
        let {list} = this;
        return list.length ? +list[list.length - 1].fileId + 1 : 1;
    },
    addFj(data){
        if(!wt.isArray(data)){
            data = [data];
        }
        this.list.push(...data);
        this.addFjToUpload(data);
        this.addFjToClassify(data);
        this.addFjToFm(data);
    },
    removeFj(data){
        let index;
        let {list = []} = this;
        if(wt.isNumber(data)){
            index = data;
            data = list[index];
        }else{
            index = list.indexOfFunc(item => item.fileId === data.fileId);
        }
        if(index > -1 && index < list.length){
            let config = {
                uploadFjList:'index',
                imgFjList:'sd'
            };
            for(let itemId in config){
                this.removeFjFromList(config[itemId] === 'index' ? index : data,$('#' + itemId));
            }
        }
    },
    addFjToUpload(data){
        let html = '';
        data.forEach(item => {
            let {fileName,url = '../../../../img/1.jpg'} = item;
            html += `<li><div class="img-box"><img src="${url}"></div><p class="fj-text" title="${fileName}">${fileName}</p><span class="remove-btn"><i class="iconfont icon-cha"></i></span></li>`;
        });
        $('#uploadFjList').append(html);
    },
    addFjToFm(data){
        let html = '';
        data.forEach(item => {
            let {fileName,url = '../../../../img/1.jpg'} = item;
            html += `<li><div class="img-box"><img src="${url}"><i class="fm-icon"></i></div><p class="fj-text" title="${fileName}">${fileName}</p></li>`;
        });
        $('#fmFjList').append(html);
    },
    typeIconCls:{
        1:'icon-wo',
        2:'icon-qiche',
        3:'icon-shipin',
        4:'icon-zuobiaofill'
    },
    addFjToClassify(data){
        let boxIdConfig = {
            img:'imgFjList',
            video:'videoFjList'
        };
        let config = {};
        let {typeIconCls = {}} = this;
        let typeConfig = {};
        data.forEach(item => {
            let {fileName,url = '../../../../img/1.jpg',fileType = 'img',fileId,types = []} = item;
            let typeHtml = `<div class="fj-type-box ${types.length ? 'active' : ''}">`;
            for(let type in typeIconCls){
                let hasActive = types.indexOf(type) !== -1;
                if(hasActive){
                    typeConfig[type] = (typeConfig[type] || 0) + 1;
                }
                typeHtml += `<i type="${type}" class="iconfont ${typeIconCls[type]} ${hasActive ? 'active' : ''}"></i>`;
            }
            typeHtml += '</div>';
            let html = `<li fid="${fileId}"><div class="img-box"><img src="${url}">${typeHtml}</div><p class="fj-text" title="${fileName}">${fileName}</p></li>`;
            config[fileType] = (config[fileType] || '') + html;
        });
        for(let type in boxIdConfig){
            if(config[type]){
                $('#' + boxIdConfig[type]).append(config[type]);
            }
        }
        let $drops = $('#dropList').children();
        for(let type in typeConfig){
            this.diffDropNum($drops.filter(`[type=${type}]`),typeConfig[type]);
        }
    },
    removeFjFromList(data,$list){
        let $li = wt.isNumber(data) ? $list.children().eq(data) : $list.children(`[fid=${data.fileId}]`);
        let $typeIcons = $li.find('.active.iconfont');
        if($typeIcons.length){
            $typeIcons.click();
        }
        $li.remove();
    },
    addType($elems,$drop){
        $elems.forEach(elem => {
            let $elem = $(elem);
            let data = this.getDataByFid($elem.attr('fid'));
            let type = $drop.attr('type');
            let {types = []} = data;
            if(types.indexOf(type) === -1){
                types.push(type);
                this.diffDropNum($drop,1);
                $elem.find('.fj-type-box').addClass('active').find(`.${this.typeIconCls[type]}`).addClass('active');
                data.types = types;
            }
        });
    },
    removeType($elems,type){
        let $drop = $('#dropList').children(`[type=${type}]`);
        $elems.forEach(elem => {
            let $elem = $(elem);
            let data = this.getDataByFid($elem.attr('fid'));
            let {types = []} = data;
            let index = types.indexOf(type);
            types.splice(index,1);
            this.diffDropNum($drop,-1);
            let $typeBox = $elem.find('.fj-type-box');
            if(types.length === 0){
                $typeBox.removeClass('active');
            }
            $typeBox.find(`.${this.typeIconCls[type]}`).removeClass('active');
        });
    },
    diffDropNum($drop,dn){
        let $num = $drop.find('.drop-num');
        let num = $num.text().toNum() + dn;
        $num.text(num);
        if(num === 0){
            $num.hide();
        }else{
            $num.show();
        }
    },
    getDataByFid(fid){
        return this.list.filter(item => item.fileId.toString() === fid)[0];
    }
};