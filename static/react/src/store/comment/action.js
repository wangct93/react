/**
 * Created by Administrator on 2018/3/7.
 */

export let turnPage = (num,size) => {
    return {
        type:'commentTurnPage',
        num,
        size
    }
};
