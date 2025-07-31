<template>
    <BModal ref="elDlg" :no-footer="lock" >
        <template #default>            
            <BForm @submit.prevent="" class="mt-1">
                <BRow class="mt-3">
                    <BCol sm="2" class="d-flex"><label>Url</label></BCol>
                    <BCol sm="10">
                        <BFormInput v-model="m1.url" placeholder="Please text the url string" :state="urlState"/>
                        <BFormInvalidFeedback :state="urlState" v-html="m1.err || 'must enter valid URL'" />
                    </BCol>
                </BRow>
                <div class="alert alert-danger" role="alert" v-if="m1.err" v-html="m1.err"></div>
                <div class="d-flex justify-content-end my-3" >
                    <BButton class="mx-2" variant="secondary" @click="submitForm($event,'cancel')">Cancel</BButton>
                    <BButton class="mx-2" variant="primary" @click="submitForm($event, 'ok')" :disabled="isOk">OK</BButton>
                </div>
            </BForm>
        </template>
    </BModal>
</template>
<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { BForm } from 'bootstrap-vue-next';
const props = defineProps({
    ops: {
        type: Object,
        default: {
            ok:()=>{},
            cancel:()=>{},
        },
    },
    value: {
        type: Object,
        default: {},
    },
})
const elDlg = ref(null);
const lock = ref(true);
const isOk = ref(true);
const urlState = computed(()=>{
    const tmp = m1.url ? true : false;
    isOk.value = tmp ? false : true;
    if (tmp) m1.err = '';
    return tmp;
});
const m1 = reactive({
    url: '',
    err: '',
})
function submitForm(evt, type) {
    m1.err = '';
    if (type == 'ok') {
        if (isOk.value) return;
        try {
            const tmp = new URL(m1.url);
            console.log(tmp);
            props.ops.ok(m1.url);
            elDlg.value.hide();
        } catch(err) {
            m1.err = err;
            console.log(err);
        }
    } else {
        props.ops.cancel(m1);
        elDlg.value.hide();
    }
}
</script>
<style lang="scss">
</style>

