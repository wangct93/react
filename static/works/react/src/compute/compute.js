/**
 * Created by Administrator on 2018/3/16.
 */



export const getStudentList = (list,linkData,classList) => {
    let mapData = {};
    for(let classId in linkData){
        let {studentList = []} = linkData[classId] || {};
        studentList.map((item) => {
            mapData[item] = classId;
        });
    }
    let classData = classList.toFieldObject('id');
    return list.map((item) => {
        let classId = mapData[item.id];
        let classObj = classData[classId];
        return wt.extend({},item,{
            classId,
            className:classObj && classObj.name
        });
    });
};
export const getTeacherList = (list,linkData,classList,subjectList) => {
    let mapData = {};
    for(let classId in linkData){
        let {teacherList = []} = linkData[classId] || {};
        teacherList.map((item) => {
            let list = mapData[item];
            if(!list){
                list = [];
                mapData[item] = list;
            }
            list.push(classId);
        });
    }
    let classData = classList.toFieldObject('id');
    let subjectData = subjectList.toFieldObject('id');
    return list.map((item) => {
        let classIdAry = mapData[item.id] || [];
        return wt.extend({},item,{
            classIds:classIdAry.join(','),
            classNames:classIdAry.map((item) => {
                let obj = classData[item];
                return obj ? obj.name : '无';
            }).join(','),
            subjectName:subjectData[item.subjectId].name
        });
    });
};
export const getClassList = (list,linkData,allTeacher,allStudent) => {
    let teacherData = allTeacher.toFieldObject('id');
    let studentData = allStudent.toFieldObject('id');
    return list.map((item) => {
        let {studentList = [],teacherList = []} = linkData[item.id] || {};
        return wt.extend({},item,{
            studentList:studentList.map((item) => studentData[item]),
            teacherList:teacherList.map((item) => teacherData[item])
        });
    });
};