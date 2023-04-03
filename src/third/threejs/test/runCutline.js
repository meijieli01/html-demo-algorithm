import { parseMasteralign, parseEbrace } from '../cutlineLoader.js'

export const clickMasteralignParse = (event) => {
    fetch('./cutline.txt')
        .then((res) => res.text())
        .then((res) => parseMasteralign(res))
        .then((data) => {
            console.log('masteralign cutline', data)
        }, (err) => {
            console.error(err)
        })
}

export const clickEbraceParse = (event) => {
    fetch('./cutlineEbrace.cls')
        .then((res) => res.text())
        .then((res) => parseEbrace(res))
        .then((data) => {
            console.log('ebrace cutline', data)
        }, (err) => {
            console.error(err)
        })
}

const initial = () => {
    const elMasteralign = document.getElementById('btnMasteralign')
    elMasteralign.addEventListener('click', clickMasteralignParse, false)

    const elEbrace = document.getElementById('btnEbrace')
    elEbrace.addEventListener('click', clickEbraceParse, false)
}

window.onload = initial()
