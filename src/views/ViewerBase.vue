<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view"></div>
        <div class="content-toolbar d-flex flex-column"><slot></slot></div>
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { MqMultiViewEditor, Scene, mesh2stl, Color } from '../third/mq-render/viewer.es';
import { saveBinaryFile } from '../third/snippet/toolkit';
const gScene = new Scene();
const viewState = [
    {
        left: 0,
        bottom: 0,
        width: 1,
        height: 1,
        clearColor: new Color().setRGB(1, 1, 1),     
        background: new Color().setStyle('#cccccc'),
        scene: gScene,
    },
];
const app3 = new MqMultiViewEditor();
onMounted(() => {
    let el = document.getElementById('id3DContainer');
    let rect = el.getBoundingClientRect();
    if (import.meta.env.DEV) {        
        window.mj3 = app3;
    }
    app3.init({
        width: rect.width,
        height: rect.height,
        container: el,
        useControl: true,
        pointIntensity: 0.5,
        ambientIntensity: 0.1,
        pointDistance: 1500,
        viewStateList: viewState,
    });
    app3.callAnimate();
    app3.updateFrame();
});
onBeforeUnmount(() => {
    app3.dispose();
});
function donwloadByName(name, options = {}) {
    const prefix = options.prefix || '';
    const mesh = app3.getByName(name);
    mesh2stl(mesh.clone(), {isBinary:true}).then(buffer=>{
        const fName = name.substring(0, name.lastIndexOf('.'));
        saveBinaryFile(buffer, `${prefix?prefix+'-':''}${fName}-${Date.now()}.stl`);
    })
}
defineExpose({
    app3,
    gScene,
    donwloadByName,
});
</script>