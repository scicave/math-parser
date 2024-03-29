// ---------------------------------
//         PEGjs polyfill
// ---------------------------------

const parser = require("../lib");
const input = { value: "" };
const peg$posDetailsCache = [{ line: 1, column: 1 }];

function peg$computePosDetails(pos) {
  var details = peg$posDetailsCache[pos],
    p;

  if (details) {
    return details;
  } else {
    p = pos - 1;
    while (!peg$posDetailsCache[p]) {
      p--;
    }

    details = peg$posDetailsCache[p];
    details = {
      line: details.line,
      column: details.column,
    };

    while (p < pos) {
      if (input.value.charCodeAt(p) === 10) {
        details.line++;
        details.column = 1;
      } else {
        details.column++;
      }

      p++;
    }

    peg$posDetailsCache[pos] = details;
    return details;
  }
}

function peg$computeLocation(startPos, endPos) {
  var startPosDetails = peg$computePosDetails(startPos),
    endPosDetails = peg$computePosDetails(endPos);

  return {
    start: {
      offset: startPos,
      line: startPosDetails.line,
      column: startPosDetails.column,
    },
    end: {
      offset: endPos,
      line: endPosDetails.line,
      column: endPosDetails.column,
    },
  };
}

function error(message, location) {
  throw new parser.SyntaxError(message, null, null, location);
}

module.exports = {
  peg$computeLocation,
  SyntaxError: parser.SyntaxError,
  error,
  input,
};
