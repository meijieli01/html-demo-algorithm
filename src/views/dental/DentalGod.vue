<template>
    <div class="dental-god-root">
        <div class="tool-area">
            <button class="btn btn-primary" @click="handleEvt($event,'reset')" width="150px" height="32px" title="reset the content">Reset</button>
            <select class="form-select" v-model="imgSize" @change="handleEvt($event, 'changeImageSize')">
                <option v-for="(sub,i) in [512, 1000]" :key="i" :value="sub" v-html="sub"></option>
            </select>
        </div>
        <div class="main-area message-list">
            <div class="message" v-for="(item,i) in frames" :key="i" :class="item.role">
                <!--<img class="message-avatar" src="item.avatar" alt="AI" /> -->
                <div class="message-avatar" v-html="item.role=='send'?'You':'AI'"></div>
                <div class="message-content">
                    <div class="message-bubble" >
                        <p v-for="(txt,j) in item.labelList" :key="j" v-html="txt"></p>
                        <img class="message-image" v-if="item.url" :src="item.url" />
                        <button v-for="(act,j) in item.actions" :key="j" class="btn btn-primary btn-sm" @click="handleEvt($event, 'btnAction', act.act)" :disabled="item.lock" v-html="act.label"></button>
                        <div v-if="item.status=='waiting'" class="spinner-grow text-warning" role="status">
  <span class="visually-hidden">Loading...</span>
</div>
                    </div>
                    <div class="message-meta" v-html="item.timestamp"></div>
                </div>
            </div>
        </div>
        <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFiles" />
    </div>
</template>
  
<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue';
import { Observable } from 'rxjs';
import { useModalConfirm } from '../../utils/bootstrap.js';
import { dentalStep1, dentalStep2, } from '../../api/dental.js';
import { truncationImage, imageToBase64 } from '../../third/snippet/toolImage.js';
import img1 from '../../assets/scanbody_1.png?url';
const frames = ref([]);
const imgSize = ref(512);
const fileInput = ref(null);
const ud = reactive({
    isReady: false,
    activeChild: false,
    curx: 0,
    cury: 0,
    act: '',
    lock: false,
    key: 'wk-ydD6QMRR9Dq96IB57XzZZc',
    secret: 'ws-sbXSZWTLkamyhdKrQETYAJ',
})

const { showConfirm } = useModalConfirm();

onMounted(()=>{
    initFrame();
    console.log(typeof(testJsonData));
});
function disposeFrames() {
    for (const frame of frames.value) {
        if (frame.url) {
            URL.revokeObjectURL(frame.url);
        }
    }
}
function initFrame() {
    disposeFrames();
    const now = new Date();
    frames.value = [{
        id: now.getTime() + Math.random(),
        role: 'received',
        labelList: [
            "You can upload an panormaic dental X-ray iamge, I'll give any issues",
        ],
        actions: [
            { label: 'Pick Image', act: 'pickImage' },
        ],
        lock: false,
        timestamp: now.toLocaleTimeString(),
    }];
}
function handleEvt(evt, type, act) {
    if (type == 'reset') {
        initFrame();
    } else if (type == 'btnAction') {
        ud.act = act;
        if (act == 'pickImage') {
            fileInput.value.click();
        }
    } else if (type == 'changeImageSize') {
        initFrame();
    }
}

async function handleFiles(event) {
    const input = event.target;
    if (!input.files) return;
    const file = input.files[0];
    console.log(file, imgSize.value);
    const data = await truncationImage(file, {maxSize:imgSize.value});
    //const type = /\.(stl|ply|obj)$/i.test(file.name) ? 'mesh' : 'image';
    const now = new Date();
    frames.value[frames.value.length - 1].lock = true;
    frames.value.push({
        id: now.getTime() + Math.random(),
        role: 'send',
        url: URL.createObjectURL(data.blob),
        labelList: [
            `image origin size ${data.owidth}X${data.oheight}`,
            `truncation size ${Math.round(data.width)}X${Math.round(data.height)}`,
        ],
        status: 'waiting',
        timestamp: now.toLocaleTimeString(),
    });
    data.blob.arrayBuffer().then(buffer=>{
        dentalStep1({'image_url':imageToBase64(buffer, data.filename)}).then((res)=>{
            dentalStep2(JSON.stringify(res), {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Modal-Key': ud.key,
                    'X-Modal-Secret': ud.secret,
                },
                credentials: 'same-origin',
            }).then(res=>res.json()).then(res2=>{                
                console.log(res2);
                //console.log(mdToHtml(res2[0].treatment));
                frames.value[frames.value.length - 1].status = ''; 
                const now2 = new Date();
                frames.value.push({
                    id: now.getTime() + Math.random(),
                    role: 'received',
                    labelList: res2[0].treatment.split('\n').filter(e=>e),
                    timestamp: now.toLocaleTimeString(),
                });
            });
        });
    });
    input.value = '';
}

function fileExtension(name) {
    const match = name.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : '';
}
</script>

<style scoped>
.dental-god-root {
    --padSize: 20px;
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bs-secondary-bg);
    user-select: none;
    .tool-area {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        flex-direction: row-reverse;
    }
    .main-area {
        height: calc(100% - var(--padSize));
        width: calc(100% - var(--padSize));
        margin: auto;
        padding: 10px;
        border: 1px solid var(--bs-body-bg);
    }
    .message-list {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .message {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            max-width: 100%;
            .message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
                margin-top: 4px;
            }
            .message-content {
                max-width: calc(100% - 40px);
                position: relative;
                .message-bubble {
                    padding: 12px 16px;
                    min-height: 60px;
                    min-width: 80px;
                    border-radius: 18px;
                    box-shadow: 0 1px 3px var(--bs-tertiary-color), 0 1px 2px var(--bs-tertiary-bg);
                    transition: all 0.3s ease;
                    &:hover {
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06);
                        //transform: translateY(-2px);
                    }
                    .message-text {
                        font-size: 14px;
                        line-height: 1.5;
                    }
                    .message-image {
                        border-radius: 12px;
                        max-height: 150px;
                        object-fit: cover;
                        cursor: pointer;
                        transition: opacity 0.2s ease;
                    }
                    .message-text + .message-text {
                        margin-top: 8px;
                    }
                    .message-action {
                    }
                }
            }
            .message-meta {
                margin-top: 6px;
                font-size: 12px;
                color: #6B7280;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            &.received {
                justify-content: flex-start;
                .message-bubble {
                    background-color: rgba(79,70, 229, 0.9);
                    color: #ffffff;
                    border-top-left-radius: 4px;
                    &::before {
                        content: '';
                        position: absolute;
                        top: 12px;
                        left: -10px;
                        border-top: 10px solid transparent;
                        border-bottom: 10px solid transparent;
                        border-right: 10px solid rgba(79, 70, 229, 0.9);
                    }
                }
                .message-meta {
                    justify-content: flex-start;
                }
            }
            &.send {
                //justify-content: flex-end;
                flex-direction: row-reverse;
                .message-bubble {
                    background-color: rgba(16, 185, 129, 0.9);
                    color: #ffffff;
                    border-top-right-radius: 4px;
                    &::after {
                        content: '';
                        position: absolute;
                        top: 12px;
                        right: -10px;
                        border-top: 10px solid transparent;
                        border-bottom: 10px solid transparent;
                        border-left: 10px solid rgba(16, 185, 129, 0.9);
                    }
                }
                .message-meta {
                    justify-content: flex-end;
                }
            }
        }
    }
}
</style>

