import axios from 'axios';
import fs from 'fs';
/**
 * 处理API的代码逻辑
 */
const ud = {
    page: 1, 
    limit: 300,
    projectId: 0,
    uniqueToken: '',
    baseUrl: '',
    filePrefixPath: '',
    requestPath: '',
}

export function setConfig(baseUrl, uniqueToken, projectId, prefixPath, requestPath, options={page:1,limit:300}) {
    ud.baseUrl = baseUrl;
    ud.uniqueToken = uniqueToken;
    ud.projectId = projectId;
    ud.page = options.page;
    ud.limit = options.limit;
    ud.filePrefixPath = prefixPath;
    ud.requestPath = requestPath;
}

// 获取所有API
export async function getAllApiList() {
    let resData = '';
    await axios.get(ud.baseUrl + 'list', {
        params: {
            token: ud.uniqueToken,
            page: ud.page,
            limit: ud.limit,
            project_id: ud.projectId,
        },
    }).then(res => {
        const {status, data} = res;
        if (status == 200) {
            resData = data.data.list;
            console.log(`api count ${data.data.count}`);    
        }
    });
    return resData;
}

// 按模块分类并获取每个接口的参数，返回用于生成文件的对象
export async function getEachApiDetails(list) {
    const resData = {};
    for (let i = 0; i < list.length; i++) {
        const typeName = list[i].path.slice(1, list[i].path.lastIndexOf('/'));
        if (!resData[typeName]) resData[typeName] = [];
        await axios.get(ud.baseUrl + 'get', {
            params: {
                token: ud.uniqueToken,
                id: list[i]._id,
            },
        }).then((res) => {
            const {status, data} = res;
            if (status == 200) {
                resData[typeName].push(data.data);
            }
        });
    }
    return resData;
}

// 生成文件
export function createApiFile(data, templateFun) {
    for (const key in data) {
        const pathFile = `${ud.filePrefixPath}${key}.js`;
        if (fs.existsSync(pathFile)) fs.rmSync(pathFile);
        fs.writeFile(pathFile, 
            templateFun(data[key]).replace(/\n/g, '\r\n'),
            (err) => {
                if (err) console.log(err);
            }
        );
    }
}
  
// 生成文件的模板
export function fileTemplate(apiList) {
    let res = `import request from '${ud.requestPath}';
`;
    for (let i = 0; i < apiList.length; i++) {
        // 函数名称
        const apiPath = apiList[i].path;
        let apiName = apiPath.split('/');
        apiName.forEach((item, index, array) => {
            if (index > 1) array[index] = item.replace(item[0], item[0].toUpperCase());
        });
        apiName = apiName.join('');
        // 参数注释
        let label = '';
        if (apiList[i].req_body_other) {
            const objList = JSON.parse(apiList[i].req_body_other).properties;
            for (const key in objList) {
            label = `${label}
 * @param {${objList[key].type}} ${key} ${objList[key].description}`
            }
        }
        // 模板
        res = `${res}
/**
 * @description ${apiList[i].title}${label ? `${label}` : ''}
 */
export function ${apiName}(data) {
    return request({
        url: '${apiPath}',${apiList[i].tag.includes('file')?"\n    responseType: 'arraybuffer',":''}    
        method: '${apiList[i].method}',
        ${apiList[i].method === 'GET' ? 'params' : 'data'}: data,
    });
}
`;
    }
    return res;
}
  