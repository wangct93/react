/**
 * Created by wangct on 2018/3/9.
 */

import React from 'react';
import Component from '../lib/component';
import {connect} from 'react-redux';
import Dialog from '../component/dialog';
import Btn from '../component/btn';
import Table from '../component/table';
import Combobox from '../component/combobox';

import store,{dispatch} from '../store/store';


export class ClassForm extends Component{
    componentWillMount(){
        let {teacherList,studentList} = this.props.data;
        this.teacherList = teacherList || [];
        this.studentList = studentList || [];
    }
    render(){
        let {teacherList,studentList} = this;
        let {name} = this.props.data;
        return <div className="class-form-box">
            <table className="info-table form-table">
                <tbody>
                <tr>
                    <td className="td-name">名称：</td>
                    <td className="td-value">
                        <input defaultValue={name} ref="name" type="text" className="form-input"/>
                    </td>
                </tr>
                <tr>
                    <td className="td-name">教师列表：</td>
                    <td className="td-value">
                        <Btn text="添加" iconCls="icon--jiahao" click={this.openTeacherList.bind(this)} />
                        <ul className="class-form-list">
                            {
                                teacherList.map((item,i) => {
                                    return <li onClick={this.removeItem.bind(this,'teacherList',i)} key={i}>{item.name}<i className="iconfont icon-cha2"></i></li>
                                })
                            }
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td className="td-name">学生列表：</td>
                    <td className="td-value">
                        <Btn text="添加" iconCls="icon--jiahao" click={this.openStudentList.bind(this)} />
                        <ul className="class-form-list">
                            {
                                studentList.map((item,i) => {
                                    return <li onClick={this.removeItem.bind(this,'studentList',i)} key={i}>{item.name}<i className="iconfont icon-cha2"></i></li>
                                })
                            }
                        </ul>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    }
    openTeacherList(){
        let {teacher} = this.props.data.selectData;
        let option = {
            title:'教师列表',
            width:300,
            height:300,
            content:TeacherList,
            data:teacher,
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        let data = dialog.refs.content.getData();
                        this.addItem('teacherList',data);
                        dialog.close();
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
        };
        this.openDialog(option);
    }
    openStudentList(){
        let {student} = this.props.data.selectData;
        let data = student.filter((stu) => {
            return stu.classId == null;
        });
        let option = {
            title:'学生列表',
            width:300,
            height:300,
            content:StudentList,
            data:data,
            buttons:[
                {
                    iconCls:'icon-duihao',
                    text:'确定',
                    handler:(dialog) => {
                        let data = dialog.refs.content.getData();
                        this.addItem('studentList',data);
                        dialog.close();
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
        };
        this.openDialog(option);
    }
    openDialog(option){
        dispatch({
            type:'addDialog',
            option
        });
    }
    addItem(listField,data){
        let list = this[listField];
        let filterData = list.toFieldObject('id');
        let isChange = false;
        data.forEach((item) => {
            if(!filterData[item.id]){
                list.push(item);
                isChange = true;
            }
        });
        if(isChange){
            this.refreshView();
        }
    }
    removeItem(listField,index){
        this[listField].splice(index,1);
        this.refreshView();
    }
    refreshView(){
        this.setState({
            _date:+new Date()
        });
    }
    getData(){
        return wt.extend(this.props.data,{
            name:this.refs.name.value,
            teacherList:this.teacherList,
            studentList:this.studentList
        });
    }
}


export class StudentForm extends Component{
    render(){
        let data = this.props.data || {};
        return <div className="class-form-box">
            <table className="info-table form-table">
                <tbody>
                <tr>
                    <td className="td-name">姓名：</td>
                    <td className="td-value">
                        <input type="text" defaultValue={data.name} ref="name" className="form-input"/>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    }
    getData(){
        return wt.extend(this.props.data,{
            name:this.refs.name.value
        });
    }
}

export class TeacherForm extends Component{
    render(){
        let data = this.props.data || {};
        let {subjectList} = data;
        subjectList.forEach((item,i) => {
            item.selected = item.id === data.subjectId;
        });
        return <div className="class-form-box">
            <table className="info-table form-table">
                <tbody>
                <tr>
                    <td className="td-name">姓名：</td>
                    <td className="td-value">
                        <input type="text" defaultValue={data.name} ref="name" className="form-input"/>
                    </td>
                </tr>
                <tr>
                    <td className="td-name">科目：</td>
                    <td className="td-value">
                        <Combobox ref="subject" textField="name" data={subjectList} panelHeight="100"/>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    }
    getData(){
        let {id,name} = this.refs.subject.getData()[0] || {};
        return wt.extend(this.props.data,{
            name:this.refs.name.value,
            subjectId:id,
            subjectName:name
        })
    }
}


class TeacherList extends Component{
    constructor(){
        super();
        this.state = {
            tableOption:{
                columns:[
                    {
                        title:'教师姓名',
                        field:'name',
                        width:100,
                        align:'center'
                    },
                    {
                        title:'主教科目',
                        align:'center',
                        width:100,
                        field:'subjectName'
                    }
                ],
                selected:true
            }
        }
    }
    render(){
        return <div className="fit scroll-box">
            <Table ref="listTable" data={this.props.data} option={this.state.tableOption}/>
        </div>
    }
    getData(){
        return this.refs.listTable.getSelected();
    }
}



class StudentList extends Component{
    constructor(){
        super();
        this.state = {
            tableOption:{
                columns:[
                    {
                        title:'学生姓名',
                        field:'name',
                        width:100
                    },
                    {
                        title:'班级',
                        width:100,
                        field:'className'
                    }
                ],
                selected:true
            }
        }
    }
    render(){
        return <div className="fit scroll-box">
            <Table ref="listTable" data={this.props.data} option={this.state.tableOption}/>
        </div>
    }
    getData(){
        return this.refs.listTable.getSelected();
    }
}