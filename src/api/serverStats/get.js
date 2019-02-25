const shell = require('shelljs');
require('dotenv').config();

let res = shell.exec(`df '${process.env.CONTENT_PATH}' -m --output=used,pcent,size`);
res = res
    .split('\n')
    .map(el => {
        let data = el.split(' ');
        data = data.filter(el => el !== '');
        return data;
    })
    .filter(el => el.length !== 0);

console.log(res);
