<template>
    <div class="page-index login">
        <div class="login-tip-info" >
            <div class="">
                <div class="d-flex w-100 text-center" v-for="(item,i) in ud.tipList" :key="i">                    
                    <div class="m-auto w-100 text-center">
                        <h3 class="text-primary" v-if="i==0">Tip</h3>
                        <strong class="" v-if="item.show" v-html="item.msg" :class="item.type"></strong>
                    </div>
                </div>
            </div>
        </div>
        <form ref="refForm" class="login-form" @submit.prevent="btnClickLogin">
            <h3 class="text-center" v-html="'AI Algorithm Test'"></h3>
            <div class="mb-3 row">
                <label for="loginName" class="col-sm-3 col-form-label text-end" v-html="'User'"></label>
                <div class="col-sm-8">
                <input type="text" class="form-control" v-model="form.loginname" id="loginName" aria-describedby="email" required>
                </div>
            </div>
            <div class="mb-3 row">
                <label for="loginPassword" class="col-sm-3 col-form-label text-end" v-html="'Password'"></label>
                <div class="col-sm-8">
                <input type="password" class="form-control" v-model="form.password" id="loginPassword" aria-describedby="password" required>
                </div>
            </div>      
            <div class="mb-3 row">
                <div class="col-sm-8 offset-sm-3">
                <button type="submit" class="w-100 btn btn-primary" v-html="'Sign In'"></button>
                </div>
            </div>
            <ResMessage :msg="msg" />
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import ResMessage from '../third/snippet/ResMessage.vue';
import { inTwoDate } from '../utils/helpDateTime';
import { vTipInfo } from '../../config';
const store = useStore()
const router = useRouter()
const msg = ref('');
const ud = reactive({
    tipList: [],
})
const refForm = ref(null)
const form = reactive({
    loginname: '',
    password: '',
})
function btnClickLogin(event) {
    msg.value = '';
    store
        .dispatch('user/login', form)
        .then(() => {
            router.push({ path: '/' })
        }, (err) =>{
            msg.value = err;
            console.log(err)
        }).catch(err => {
            msg.value = err;
            console.log(err);
        })
}
onMounted(() => {
    ud.tipList = [];
    vTipInfo.forEach(one=>{
        one.show = inTwoDate(one.begin, one.end);
        if (one.show) {
            ud.tipList.push(one);
        }
    })
})
</script>
