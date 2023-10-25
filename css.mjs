import fs from 'fs';
import { parseFile } from './src/third/snippet/toolCss.mjs';

const cssFolder = './public/css';
if (!fs.existsSync(cssFolder)) {
    fs.mkdirSync(cssFolder)
}
const retainType = process.env.npm_lifecycle_event
console.log('-css build command-', retainType);
parseFile('./style/index.scss', `${cssFolder}/index.css`, {hasMap: true, compress:true});