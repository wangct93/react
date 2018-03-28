/**
 * Created by Administrator on 2018/3/20.
 */


export const getPaging = (data) => {
    let {params,total} = data;
    let {num,size} = params;
    return {
        pageNum:num,
        pageSize:size,
        total
    }
};