let pkg = require('../package.json');
let filePath = '../src/version.js'; 
let version = pkg.version;
let path = require('path');
let fs = require('fs');

let code =`
// this file is auto generated
// the current version is:
module.exports = "${version}";
`;

fs.writeFileSync(path.resolve(__dirname, filePath), code);

