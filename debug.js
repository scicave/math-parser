const parser = require("./lib/");
const prepareInput = require("./src/prepareInput.js");
const { program } = require("commander");
const { peg$computeLocation, error, input } = require("./tests/pegjsPolyFill");

// -----------------------------------
//     pretty verpose logging
// -----------------------------------

function log(fn, tex, ...args) {
  console.log("start >>>>>>>>>>>>>>");
  console.log("===============");
  console.log(tex);
  console.log("===============");
  console.time(fn.name + " is done after");
  try {
    console.log(fn(tex, ...args));
  } catch (e) {
    if (e instanceof parser.SyntaxError) {
      console.log("SyntaxError:", e.message);
      printErrorLocation(e, tex);
    } else {
      throw e;
    }
  }
  console.log("===============");
  console.timeEnd(fn.name + " is done after");
}

function printErrorLocation(e, tex) {
  const errorLine = e.location.start.line - 1;
  const lines = tex.split("\n");

  if (errorLine - 2 >= 0) console.log(lines[errorLine - 2]);
  if (errorLine - 1 >= 0) console.log(lines[errorLine - 1]);

  console.log();
  console.log(lines[errorLine]);
  console.log(new Array(e.location.start.column - 1).fill("_").join("") + "^");
  console.log();

  if (errorLine + 1 < lines.length) console.log(lines[errorLine + 1]);
  if (errorLine + 2 < lines.length) console.log(lines[errorLine + 2]);
}

// -----------------------------------
//   finnally excute the desire
//   function with the desired args
// -----------------------------------

program
  .argument("<tex>", "The TeX expression to debug the operation using it")
  .option("--prepare", "Debug `prepareInput` function rather than `parse`")
  .action((tex, options) => {
    input.value = tex;
    if (options.prepare) log(prepareInput, tex, peg$computeLocation, error);
    else log(parser.parse, tex);
  })
  .parse();
