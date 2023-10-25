<template>
    <div class="viewer-ct-container">
        <div id="id3DContainer" class="content-view"></div>
        <div class="content-toolbar d-flex flex-column"><slot></slot></div>
    </div>
</template>
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { mqThree } from '../third/threejs/mjthree';
import { mesh2stl } from '../third/threejs/mjExporter';
import { saveBinaryFile } from '../third/snippet/toolkit';
const app3 = new mqThree();
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
    });
    app3.setLoadConfig({
        msg: 'Loading',
        url: '/web/images/loading.svg',
    });
    app3.eventLoop();
    app3.resize();
    app3.updateFrame();
});
onBeforeUnmount(() => {
    console.log('unmount')
    app3.empty();
    app3.dispose();
});
function donwloadByName(name, options = {}) {
    console.log(name)
    const prefix = options.prefix || '';
    const mesh = app3.getByName(name);
    console.log(mesh);
    mesh2stl(mesh.clone(), {isBinary:true}).then(buffer=>{
        saveBinaryFile(buffer, `${prefix?prefix+'-':''}${Date.now()}.stl`);
    })
}
defineExpose({
    app3,
    donwloadByName,
});
</script>