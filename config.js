export function getBaseRoot() {
    return ['development'].includes(process.env.NODE_ENV) ? '/' : '/web/';
} 

export function getFavicon() {
    return ['development'].includes(process.env.NODE_ENV) ? '/beta.png' : '/web/beta.svg';
}

export const vInfo = {
    'IMPLANT': {
        version: '0.5.0',
        changelog: [
            '2023-9-14',
            '1. Optimized implant orientation and guide details.',
            '2023-8-2',
            '1. Optimized guide details including windows, orientation, and edges.',
            '2023-6-5',
            '1. Adding the ability to generate implant guides. (Limited to cases with one missing tooth).',
            '2023-5-10',
            '1. Adding the ability to segment the mandibular nerve.',
            '2023-5-5',
            '1. Adding the ability to predict the position of multiple single tooth implants',
        ],
    },
    'CROWN': {
        version: '0.6.1',
        changelog: [
            '2023-11-15',
            '1. Optimize the occlusion relationship of the dental crown',
            '2. Optimize the gap between the crown and adjacent teeth',
            '3. Optimize the shape of the occlusal surface and buccal side of the crown',
            `4. Enhance AI's capability to detect partial arch data and improve segmentation for prep crowns`,
            '2023-10-23',
            '1. Supports crown generation for tooth 17,27,37,47',
            '2. Optimize crown form by adding tooth feature points',
            '3. Optimize crown margins',
            '4. Fine-tune the occlusion, adjacent tooth relationship, thickness, etc',
            '2023-5-12',
            '1. Optimize the distance between the crown with adjacent teeth, prepared teeth, and opposing teeth',
            '2. Optimize the neck line of the crown',
            '3. Supports crown generation for tooth 14,15,16,24,25,26,34,35,36,44,45,46',
            '2023-4-23',
            '1. Now supports crown generation for tooth 14 and 15 (in FDI)',
            '2. Fix bugs',
        ],
    },
    'AI_NightGuard': {
        version: '2.0.0',
        changelog: [
            '2023-11-28',
            '1. Adjust edge smooth part to improve NG performance.',
            '2. Add NG self-thickness check and self-thickness movement to meet the minimum self-thickness  requirement.',
            '3. Update the segment part algorithm to improve NG shape.',
            '4. Fix some bug to improve the program robustness.',
            '2023-9-7',
            '1. Add Lower NightGuard generate part.',
            '2. Lower NightGuard control in Model Choose.',
            '3. It contains lower smooth and lower occlusion.',
            '4. Add corresponding openbite output view.',
            '2023-7-4',
            '1. add parameter option for test.',
            '2. combine the openbite mode in this part.',
            '3. change showing lowerjaw to openlower, improve the showing result.',
            '4. improve the error msg show.',
            '2023-5-19',
            '1. solve the sharp edge problem',
            '2. fix the problem that loose teeth part need extra long time',
            '3. fix the problem that some case has hole in the generation result',
            '2023-4-23',
            '1. Updated with loose teeth problem Improvement.',
        ],
    },
    'AI_BracketRemove': {
        version: '0.3.0',
        changelog: [
            '2023-4-23',
            '1. New orientor and segmentor (trained from 10000 teeth) are deployed now.',
        ],
    },
    'AI_Clean': {
        version: '0.1.0',
        changelog: [
            '2024-03-20',
            `1. Support clean the dental model's unnecessary base.`,
            `2. Support to slice the model on the simplified or on the origianl model.`,
        ],
    },
    // AI_OcclusionRecovery
    'AI_Oc_Re': {
        version: '0.1.0',
        changelog: [
            '2024-04-12',
            `1. This Occlusion Recovery used for Recovery the not correct occlusion relation (such us model bite through).`,
            `2. It needs the models(upperjaw and lowerjaw) have basic occlusion relation (if not, it will return no relation).`,
            `3. We will continuous develop no occlusion relation recovery.`,
            `4. For now, it only support Angle's malocclusion class I. We will develop other class next. (other class will return not class I).`,
        ],
    },
    'pmp_retainer': {
        version: '',
        changelog: [
        ],
    },
    'AI_Retainer': {
        version: '',
        changelog: [
        ],
    },
}

export const configRetainer = {
    isShell: false, // 生成数据默认是实体的，配置成非实体，中空
}
