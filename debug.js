#! node

const mp = require('./lib/');

let mathexpr = process.argv[2]; // relative 1st from the cli node program

console.log(JSON.stringify(mp.parse(mathexpr), null, 2));

