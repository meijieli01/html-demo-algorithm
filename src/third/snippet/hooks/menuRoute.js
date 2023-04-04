import productLayout from '../layout/Product1.vue';
import frontLayout from '../layout/Front1.vue';
// 空路由
export const emptyRouter = {
    path: '',
    meta: { },
    children: [],
}

const routerRootList = {
    'product': {
        'PRODUCT_ORDER':'/order', // 生产订单列表
        'STORAGE':'/storage', // 仓储系统
        'PROCESS_MANAGE':'/process', // 工序
        'STAFF_MANAGE':'/staff', // 员工
    },
    'front': {
        
    },
}
  
export function getRootRouter(type, name) {
    return {
      path: routerRootList[type][name] || '/any',
      component: type=='product'? productLayout : type=='front' ? frontLayout : {},
      meta: { },
      children: [],
    }
}

/**
 * 提前子节点
 * @param {*} treeList 后台返回得菜单
 * @param {*} cacheList 缓存数据
 * @param {*} empty 空路由模板
 */
function findChildLoop(treeList, cacheList, empty, mapList) {
    treeList.forEach((item, idx) => {              
        const child = Object.assign({}, empty, {meta:{},children:[]});
        child.path = `${item.functionId}`;
        child.meta.label = item.functionName;
        child.meta.code = item.functionCode;
        child.meta.id = item.functionId;
        // 加入缓存
        if (!cacheList[item.functionId]) {
            cacheList[item.functionId] = child;
        }
        const parent = cacheList[item.parentId];
        if (parent) {
            parent.children.push(child);                
        } 
        if (idx==0 && parent.children.length == 1) {
            parent.redirect = `${parent.path}/${child.path}`;
        }
        if (item.childList.length > 0) {
            findChildLoop(item.childList, cacheList, empty, mapList);
        } else {
            child.component = mapList[item.functionCode];
        }
    })
}

/**
 * 根据后台返回得数据构建菜单
 * @param {*} type 
 * @param {*} tree 
 * @param {*} router 
 * @param {*} mapList 
 */
export function parseMenuRoute(type, tree, router, mapList) {
    tree.forEach(item => {
        const cacheList = {};
        let root = Object.assign({}, getRootRouter(type, item.functionCode), {meta:{},children:[]});
        root.meta.label = item.functionName;
        root.meta.code = item.functionCode;
        root.meta.id = item.functionId;
        cacheList[item.functionId] = root;
        if (item.childList.length > 0) {
            findChildLoop(item.childList, cacheList, emptyRouter, mapList);
            root.redirect = `${root.path}/${root.children[0].path}`;
        } 
        router.options.routes.push(root);
        router.addRoute(root);
    })
}  