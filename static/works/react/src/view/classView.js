/**
 * Created by Administrator on 2018/3/8.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import Table from '../component/table';
import * as createActions from '../store/classView/action';
import {addDialog,alert} from '../store/dialog/action';
import {ClassForm} from './dialogForm';

import {getClassList,getStudentList,getTeacherList} from '../compute/compute';


class ClassView extends Component{
    constructor(){
        super();
        this.state = {
            tableOption:{
                columns:[
                    {
                        title:'名称',
                        field:'name',
                        width:100,
                        fixed:true,
                        align:'center'
                    },
                    {
                        title:'学生人数',
                        align:'center',
                        width:100,
                        fixed:true,
                        field:'studentCount'
                    },
                    {
                        title:'教师人数',
                        align:'center',
                        width:100,
                        fixed:true,
                        field:'teacherCount'
                    },
                    {
                        title:'操作',
                        align:'center',
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
        let list = this.filter();
        return <div className="class-view-box fit">
            <div className="title-box">班级列表</div>
            <div className="cv-content">
                <div className="list-action-box">
                    <div className="list-btn-box">
                        <a className="w-btn w-btn-noicon" onClick={this.add.bind(this)}>新增</a>
                    </div>
                </div>
                <div className="panel-list-box">
                    <Table option={this.state.tableOption} data={list}/>
                </div>
            </div>
        </div>
    }
    filter(){
        let {list} = this.props;
        list.forEach((item,i) => {
            item.studentCount = item.studentList ? item.studentList.length : 0;
            item.teacherCount = item.teacherList ? item.teacherList.length : 0;
        });
        return list;
    }
    add(){
        let {list} = this.props;
        let data = {
            id:list[list.length - 1].id + 1
        }
        this.edit(data,true);
    }
    edit(data,isAdd){
        data.selectData = this.props.selectData;
        this.props.addDialog({
            title:isAdd ? '新增班级' : '修改班级信息',
            width:500,
            height:408,
            content:ClassForm,
            data:data,
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        let data = dialog.refs.content.getData();
                        if(!data.name){
                            this.props.alert('班级名称不能为空！');
                        }else{
                            this.props.editClass(data);
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
    let {classData,linkData,teacherData,studentData,subjectData} = state;
    let {classLink} = linkData;
    let classList = classData.list;
    let allStudent = getStudentList(studentData.list,classLink,classList);
    let allTeacher = getTeacherList(teacherData.list,classLink,classList,subjectData.list);
    classList = getClassList(classList,classLink,allTeacher,allStudent);
    return {
        list:classList,
        selectData:{
            teacher:allTeacher,
            student:allStudent
        }
    }
},wt.extend(createActions,{
    alert,
    addDialog
}))(ClassView)