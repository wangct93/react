/**
 * Created by Administrator on 2018/3/7.
 */
import ClassView from '../../view/classView';
import Student from '../../view/student';
import Teacher from '../../view/teacher';
let defaultState = {
    list:[
        {
            title:'班级列表',
            component:ClassView,
            selected:true
        },
        {
            title:'学生列表',
            component:Student
        },
        {
            title:'教师列表',
            component:Teacher
        }
    ]
};

window.list = defaultState;
export let navData = (state = defaultState,action = {}) => {
    switch(action.type){
        case 'changeNav':
            state.list.forEach((item,i) =>{
                item.loaded = item.loaded || item.selected || i === action.index;
                item.selected = i === action.index;
            });
            break;
    }
    return wt.extend(true,{},state);
}