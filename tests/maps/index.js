const basic = require("./basic");
const singleChar__memExpr = require("./singleChar__memExpr");
const singleChar__functions = require("./singleChar__functions");
const singleChar__autoMult = require("./singleChar__autoMult");
const singleChar__BID = require("./singleChar__BID");
const multiChar__memExpr = require("./multiChar__memExpr");
const multiChar__functions = require("./multiChar__functions");
const multiChar__autoMult = require("./multiChar__autoMult");
const multiChar__BID = require("./multiChar__BID");
const options = require("./options");
const extra = require("./extra");

module.exports = {
  basic,
  options,
  extra,

  "singleCharName=true": {
    "member expression": singleChar__memExpr,
    "function": singleChar__functions,
    "auto multiplication": singleChar__autoMult,
    "builtInVariables": singleChar__BID,
  },

  "singleCharName=false": {
    "member expression": multiChar__memExpr,
    "functions": multiChar__functions,
    "auto multiplication": multiChar__autoMult,
    "builtInVariables": multiChar__BID,
  }
};

//#region TODO: next release

// test('tests: 2 ax   sin3y', () => {
//   expect(parse('2 ax   sin3y', parserOptions)).toHaveStructure({
//     type: 'automult',
//     args: [
//       {
//         type: 'automult',
//         args: [
//           { value: 2, type: 'number', },
//           { name: 'ax', type: 'id', },
//         ]
//       },
//       {
//         type: 'function',
//         isBuiltIn: true,
//         name: 'sin',
//         args: [
//           {
//             type: 'automult',
//             args: [
//               { value: 3, type: 'number', },
//               { name: 'y', type: 'id', },
//             ]
//           }
//         ]
//       }
//     ]
//   });
// });

// test('tests: xsin2z', () => {
//   expect(parse('xsin2z', parserOptions)).toHaveStructure({
//     type: 'automult',
//     args: [
//       { type: 'id', name: 'x' },
//       {
//         type: 'function',
//         isBuiltIn: true,
//         name: 'sin',
//         args: [
//           {
//             type: 'automult',
//             args: [
//               { type: 'number', value: 2 },
//               { type: 'id', name: 'z' },
//             ]
//           }
//         ]
//       }
//     ]
//   });
// });


// test('tests: 2axsin3y', () => {
//   expect(parse('2axsin3y', parserOptions)).toHaveStructure({
//     type: 'automult',
//     args: [
//       {
//         type: 'automult',
//         args: [
//           { value: 2, type: 'number', },
//           { name: 'ax', type: 'id', },
//         ]
//       }, {
//         type: 'function',
//         isBuiltIn: true,
//         name: 'sin',
//         args: [
//           {
//             type: 'automult',
//             args: [
//               { value: 3, type: 'number', },
//               { name: 'y', type: 'id', },
//             ]
//           }
//         ]
//       }
//     ]
//   });
// });

// test('tests: sin 2 xa sd cos3x', () => {
//   expect(()=>parse('sin 2 xa sd cos3x', parserOptions)).toThrow(parser.SyntaxError);
// });

// test('tests: sin 2 xasdcos3x + 1', () => {
//   expect(()=>parse('sin 2 xasdcos3x + 1', parserOptions)).toThrow(parser.SyntaxError);
// });

//#endregion
