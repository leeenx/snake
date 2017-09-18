// es6 随机按顺序数组
export default (list = [], count = list.length, filter) => 
{
    list = [].concat(list); // 切断与参数list 的耦合
    list = typeof filter === "function" ? list.filter( (...args) => filter(...args) ) : list; 
    let res = []; 
    for(let i=0; i<count; ++i) {
        let [len, randomIndex] = [list.length, (Math.random() * list.length)>>0]; 
        res = res.concat(list.splice(randomIndex, 1)); 
    }
    return res.length == 1 ? res[0] : res; 
}