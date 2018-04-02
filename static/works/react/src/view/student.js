/**
 * Created by Administrator on 2018/3/8.
 */
import React from 'react';
import Component from '../lib/component';
import {Provider, connect} from 'react-redux';
import Table from '../component/table';
import {addDialog,alert} from '../store/dialog/action';
import * as createActions from '../store/student/action';
import {StudentForm} from './dialogForm';

import {getStudentList} from '../compute/compute';

class Student extends Component{
    constructor(){
        super();
        this.state = {
            tableOption:{
                columns:[
                    {
                        title:'学生姓名',
                        field:'name',
                        width:100,
                        fixed:true
                    },
                    {
                        title:'班级',
                        width:100,
                        fixed:true,
                        field:'className',
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
            <div className="title-box">学生列表</div>
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
    getList(){

    }
    add(){
        let {list} = this.props;
        this.edit({
            id:list[list.length - 1].id + 1
        },true);
    }
    edit(data,isAdd){
        this.props.addDialog({
            title:isAdd ? '新增学生' : '修改学生信息',
            width:300,
            height:140,
            content:StudentForm,
            data:data,
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        let data = dialog.refs.content.getData();
                        if(data.name){
                            this.props.editStudent(data);
                            dialog.close();
                        }else{
                            this.props.alert('学生姓名不能为空！');
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
    let {classData,studentData,linkData} = state;
    return {
        list:getStudentList(studentData.list,linkData.classLink,classData.list)
    }
},wt.extend(createActions,{
    addDialog,
    alert
}))(Student)