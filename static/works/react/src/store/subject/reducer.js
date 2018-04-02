/**
 * Created by Administrator on 2018/3/7.
 */
import React,{Component} from 'react';
let defaultState = {
    list:[
        {
            id:1,
            name:'数学'
        },
        {
            id:2,
            name:'科学'
        },
        {
            id:3,
            name:'语文'
        },
        {
            id:4,
            name:'英语'
        },
        {
            id:5,
            name:'物理'
        },
        {
            id:6,
            name:'化学'
        },
        {
            id:7,
            name:'体育'
        },
        {
            id:8,
            name:'音乐'
        }
    ]
};
export let subjectData = (state = defaultState,action = {}) => {
    switch(action.type){

    }
    return state;
}