/**
 * Created by Administrator on 2018/3/7.
 */

import Alert from '../../component/alert';
export let close = (id) => {
    return {
        type:'closeDialog',
        id
    }
};

export let addDialog = (option) => {
    return {
        type:'addDialog',
        option
    }
};

export const alert = (msg) => {
    return {
        type:'addDialog',
        option:{
            component:Alert,
            data:{
                message:msg
            }
        }
    }
}
