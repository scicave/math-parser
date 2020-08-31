let pkg = require('./package.json');
let version = pkg.version;
let fs = require('fs');

let code =`
// this file is auto generated

module.exports = ${version};
`; 

fs.writeFileSync('../src/version.js' , code);