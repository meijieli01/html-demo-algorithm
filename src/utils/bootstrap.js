import { useModalController, useToastController } from 'bootstrap-vue-next';
import { t } from '@/lang';

export function useModalConfirm() {
    const { create, show, hide } = useModalController();
    
    const showConfirm = async(options = {})=>{        
        let body = 'Warning';
        let title = 'Tips';
        if (options.title) title = options.title;
        const argConfirm = {
            okText: options.okText,
            props: {
                title,
                'dialog-class': 'modal-dialog-centered',
                body,                
                okText: options.okText,
                ...options.props,
            }
        }
        if (options.component) argConfirm.component = options.component;
        return new Promise((resolve, reject) => {
            create(argConfirm).then((value,extra)=>{
                resolve({value,extra})
            }).catch((err)=>{
                reject(err)
            });
        })
    }
    const updateConfirmState = (options = {})=>{
        if (options.hide) hide(); 
    }
    return {
        showConfirm,
        updateConfirmState,
    }
}

export function useToast() {
    const { remove, create } = useToastController()
    let retToast;
    const showToast = (msg, options = {})=>{
        let variant = 'danger';
        if (options.code == 1) variant = 'warning';
        if (options.code == 2) variant = 'success';
        retToast = create?.({
            props: {
                title: 'Tips', 
                body: msg, 
                value:true, 
                pos: 'top-center',
                variant,
            }
        });
        setTimeout(()=>{
            remove?.(retToast);
        }, options.delay || 3000);
    }
    return {
        showToast,
    }
}

