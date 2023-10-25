<template>
    <div class="btn-group border rounded">
        <button class="btn btn-default dropdown-toggle w-100" type="button" :id="id" data-bs-toggle="dropdown" aria-expanded="false">
            <input type="text" class="form-control position-absolute h-100 top-0 start-0 border-0 mj-input-multi" readonly :disabled="disable" :required="must" v-model="text">
        </button>
        <ul ref="elUl" class="dropdown-menu w-100" :aria-labelledby="id" v-show="!disable"></ul>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import bootstrapDropdown from 'bootstrap/js/src/dropdown'
const props = defineProps({
    id: {
        type: String,
        require: true,
    },
    value: {
        type: Array,
        default: true,
    },
    must: {
        type: Boolean,
        default: true,
    },
    col: {
        type: String,
        default: 'w-25',
    },
    key: {
        type: String,
        default: 'id',
    },
    list: {
        type:Array,
        default: [],
    },
    disable: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['update']);
const elUl = ref(null);
const text = ref('');
const elDropdown = ref(null);
const ud = reactive({
    src: [], 
});
onMounted(() => {
    elDropdown.value = new bootstrapDropdown(document.getElementById(props.id), {}); 
    initial();
})
function initial() {
    if (elUl.value) elUl.value.replaceChildren();
    const {value, key, col, list} = props;
    value.forEach((item) => {
        let elLi = document.createElement('li');
        elLi.classList.add('float-start', col);
        let elLabel = document.createElement('label');
        elLabel.classList.add('dropdown-item');
        elLabel.textContent = item.name;
        let elInput = document.createElement('input');
        elInput.type = 'checkbox';
        elInput.setAttribute('code', item[key]);
        elInput.addEventListener('change', inputCheckboxChange);
        elInput.checked = list.includes(item[key]);
        elLabel.appendChild(elInput);
        elLi.appendChild(elLabel);
        elUl.value.appendChild(elLi);
    })
    text.value = list.join(',');
}
function inputCheckboxChange(event) {
    const elCheckboxList = elUl.value.querySelectorAll('input[type="checkbox"]');
    const codeList = [];
    for (let elCheckbox of elCheckboxList) {
        if (elCheckbox.checked) codeList.push(parseInt(elCheckbox.getAttribute('code'), 10));
    }
    text.value = codeList.join(',')
    emit('update', codeList);
}
defineExpose({
    initial,
});
</script>