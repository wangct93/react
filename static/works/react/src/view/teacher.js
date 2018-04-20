/**
 * Created by Administrator on 2018/3/8.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import Table from '../component/table';
import * as createActions from '../store/teacher/action';
import {addDialog,alert} from '../store/dialog/action';
import {TeacherForm} from './dialogForm';
import {getTeacherList} from '../compute/compute';

class Teacher extends Component{
    constructor(){
        super();
        this.state = {
            tableOption:{
                columns:[
                    {
                        title:'教师姓名',
                        field:'name',
                        width:100,
                        fixed:true,
                        align:'center'
                    },
                    {
                        title:'主教科目',
                        align:'center',
                        width:100,
                        fixed:true,
                        field:'subjectName'
                    },
                    {
                        title:'所在班级',
                        align:'center',
                        width:100,
                        fixed:true,
                        field:'classNames',
                        formatter:(value,index,row) => {
                            return value || '无';
                        }
                    },
                    {
                        title:'操作',
                        width:100,
                        fixed:true,
                        elemList:[
                            {
                                iconCls:'text-btn mgr5',
                                text:'修改',
                                handler:this.edit.bind(this)
                            },
                            {
                                iconCls:'text-btn',
                                text:'详情',
                                handler:this.detail.bind(this)
                            }
                        ]
                    }
                ]

            }
        }
    }
    render(){
        return <div className="class-view-box fit">
            <div className="title-box">教师列表</div>
            <div className="cv-content">
                <div className="list-action-box">
                    <div className="list-btn-box">
                        <a className="w-btn w-btn-noicon" onClick={this.add.bind(this)}>新增</a>
                    </div>
                </div>
                <div className="panel-list-box">
                    <Table data={this.props.list} option={this.state.tableOption}/>
                </div>
            </div>
        </div>
    }
    add(){
        let {list} = this.props;
        this.edit({
            id:list[list.length - 1].id + 1
        },true);
    }
    edit(data,isAdd){
        data.subjectList = this.props.subjectList;
        this.props.addDialog({
            title:isAdd ? '新增教师' : '修改教师信息',
            width:300,
            height:170,
            content:TeacherForm,
            data:data,
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        let data = dialog.refs.content.getData();
                        let {alert} = this.props;
                        if(!data.name){
                            alert('教师姓名不能为空！');
                        }else if(!data.subjectId){
                            alert('主教科目不能为空！');
                        }else{
                            this.props.editTeacher(data);
                            dialog.close();
                        }
                    }
                },
                {
                    iconCls:'icon-cha2',
                    text:'取消',
                    handler:(dialog) => {
                        dialog.close();
                    }
                }
            ]
        });
    }
    detail(data){
    }
}

export default connect((state) => {
    let {classData,teacherData,subjectData,linkData} = state;
    return {
        list:getTeacherList(teacherData.list,linkData.classLink,classData.list,subjectData.list),
        subjectList:subjectData.list
    }
},wt.extend(createActions,{
    addDialog,
    alert
}))(Teacher)