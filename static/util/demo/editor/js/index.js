/**
 * Created by Administrator on 2018/1/11.
 */

var editor;
wt.DOMReady(function(){
    editor = new wangEditor('#box');
    editor.customConfig.lang = {
        '设置标题': 'title',
        '正文': 'p',
        '链接文字': 'link text',
        '链接': 'link',
        '上传图片': 'upload image',
        '上传': 'upload',
        '创建': 'init'
        // 还可自定添加更多
    };
    editor.create();
});