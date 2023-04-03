<template>
    <div class="login">
        <form ref="refForm" class="login-form" @submit.prevent="submitform">
            <h3 class="text-center">管理系统</h3>
            <div class="mb-3 row">
                <label for="loginName" class="col-sm-3 col-form-label text-end">用户名</label>
                <div class="col-sm-8">
                <input type="text" class="form-control" v-model="form.loginname" id="loginName" aria-describedby="email" required>
                </div>
            </div>
            <div class="mb-3 row">
                <label for="loginPassword" class="col-sm-3 col-form-label text-end">密码</label>
                <div class="col-sm-8">
                <input type="password" class="form-control" v-model="form.password" id="loginPassword" aria-describedby="password" required>
                </div>
            </div>      
            <div class="mb-3 row">
                <div class="col-sm-8 offset-sm-3">
                <button type="submit" class="w-100 btn btn-primary">登录</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
const store = useStore()
const router = useRouter()

const refForm = ref(null)
const form = reactive({
  loginname: '',
  password: '',
})
function btnClickLogin(event) {
  store
    .dispatch('user/login', form)
    .then(() => {
      router.push({ path: '/' })
    })
    .catch(err => {
      if (refForm.value) {
        refForm.value.classList.remove('was-validated')
      }
    })
}
function submitform(event) {
  if (!refForm.value.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
  }
  refForm.value.classList.add('was-validated')
  btnClickLogin()
}
onMounted(() => {
})
</script>