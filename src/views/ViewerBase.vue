<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view"></div>
        <div class="content-toolbar d-flex flex-column"><slot></slot></div>
        <div class="implant-crown-tip-image" v-if="entry=='implantCrown'">
            <img :src="scanbody1">
            <img :src="scanbody2">
            <img :src="scanbody3">
        </div>
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { 
    MqMultiViewEditor, mesh2stl, eEntryCode, alias3,
    updateMaterialColor, updateMaterialOpacity, 
} from '../third/mq-webui/viewer.es';
import { saveBinaryFile } from '../third/snippet/toolkit';
import { toYYMMDDHHmmss } from '../utils/util';
import { useRoute } from 'vue-router'
import scanbody1 from '../assets/scanbody_1.png?url';
import scanbody2 from '../assets/scanbody_2.png?url';
import scanbody3 from '../assets/scanbody_3.png?url';
const props = defineProps({
    entry: {
        type:String,
        default: '',
    }
});
const route = useRoute();
const gScene = new alias3.Scene();
const viewState = [
    {
        left: 0,
        bottom: 0,
        width: 1,
        height: 1,
        clearColor: new alias3.Color().setRGB(1, 1, 1),     
        background: new alias3.Color().setStyle('#cccccc'),
        scene: gScene,
    },
];
const app3 = new MqMultiViewEditor(
    ['retainer', 'implantCrown'].includes(props.entry) ? eEntryCode.aiWebUiNoFitViewport : eEntryCode.aiwebUi);
onMounted(() => {
    let el = document.getElementById('id3DContainer');
    let rect = el.getBoundingClientRect();
    if (import.meta.env.DEV) {        
        window.app3 = app3;
    }
    app3.init({
        width: rect.width,
        height: rect.height,
        container: el,
        cameraPositionZ: 90,
        useControl: true,
        viewStateList: viewState,
    });
    app3.callAnimate();
    app3.updateFrame();    
    let title = '';
    if (route.meta && route.meta.label) title = ` - ${route.meta.label}`;
    document.title = `AiDemo${title}`
});
onBeforeUnmount(() => {
    app3.dispose();
});
function resetAxes() {
    app3.setAxes(0.5, 2e-3, {textScaleFactor: 0.1});
}
function donwloadByName(name, options = {}) {
    const prefix = options.prefix || '';
    let hasUnique = options.hasUnique ? true : false;
    const strUnique = hasUnique ? `-${Date.now()}` : '';
    const strPrefix = prefix ? `${prefix}-` : '';
    app3.updateVisitGroup((m)=>{
        if (m.name == name) {
            const mesh = m.clone();
            mesh2stl(mesh, {isBinary:true}).then(buffer=>{
                const fName = name.substring(0, name.lastIndexOf('.'));
                saveBinaryFile(buffer, `${strPrefix}${fName}${strUnique}.stl`);
            });
        }
    });
}
function eventByType(category, event, item, type) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    } 
    if (['AI_NightGuard', 'AI_Retainer', 'AI_BracketRemove', 'pmp_retainer'].includes(category)) {        
        if (type == 'download') {
            return donwloadByName(item.filename, {
                prefix: `${category.split('_')[1]}`,
                hasUnique: ['pmp_retainer'].includes(category) ? false : true,
            });
        }
        return true;
    }
    return false;
}
function colorUpdate(event, item) {
    item.color = event.target.value;
    const children = app3.getScene().children;
    const mesh = children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMaterialColor(mesh.material, item.color);
        app3.updateFrame();
    }
}
function opacityUpdate(event, item) {
    item.opacity = parseFloat(event.target.value);
    const children = app3.getScene().children;
    const mesh = children.filter(e=>e.name==item.filename)[0];
    if (mesh) {
        updateMaterialOpacity(mesh.material, item.opacity);
        app3.updateFrame();
    }
}
function parseTime(tag, timestamp) {
    const ymdhms = toYYMMDDHHmmss(timestamp.tmpDir);
    let id = '';
    if (timestamp.customId) id = timestamp.customId;
    let param = '';
    if (tag == 'AI_NightGuard') {
        if (timestamp.param) {
            const t2 = timestamp.param;
            // param += `${t2.move_distance}-`;
            param += `${t2.mode}-`;
            param += `${t2.openbite}-`;
            param += `${t2.occ_thickness}`;
        }
    } else if (tag == 'IMPLANTCROWN') {
        if (timestamp.param) {
            const t2 = timestamp.param;
            param += `${t2.tooth_id}-`;
            param += `${t2.scanbody_id}`;
        }
    }
    return `${ymdhms}${id ? ' - ' + id : ''}${param?' - ' + param:''}`;
}
defineExpose({
    app3,
    gScene,
    eventByType,
    colorUpdate,
    opacityUpdate,
    parseTime,
    resetAxes,
});
</script>