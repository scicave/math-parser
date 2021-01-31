// TODO: don't throw in case of "]1,2]", because it may be half opened interval

module.exports = function preParse(input, peg$computeLocation, error) {

  let _;
  if (/^\s*$/.test(input)) error("no expression found", null);
  
  // the same as the pegjs rule "_" in ./tex.pegjs
  var ignore = /^\s+/;
  
  // code is opimized as all openings and closings are single-char 
  // make sure when using multi-char block opening or closings to
  // String.prototype.slice is used rather than using direct chars, string[index].
  var blocks = [
    { opening: '{', closing: '}', health: 0 }, // health is how much of this block is still opened
    { opening: '(', closing: ')', health: 0 },
    { opening: '[', closing: ']', health: 0 },
    { opening: '|', closing: '|', health: 0 },
  ];

  // to store the brackets stack, the nested brackets, similar to call stack in programming
  var stack = [],
      pos = {},
      skipConsuming = {};

  function openBlock(b) {
    stack.push({
      b, posValue: pos.value
    });
    pos.value += b.opening.length; // consume the closing char
    b.health++;
    skipConsuming = true;
  }

  function closeBlock(b) {
    stack.pop();
    pos.value += b.closing.length; // consume the closing char
    b.health--;
    skipConsuming = true;
  }

  Object.defineProperty(pos, 'value', {
    get () {
      return this.__value;
    },
    set (v) {
      input.slice(v, -1).replace(ignore, m => {
        v += m.length; // consume ignored letters, such as white spaces
      });
      this.__value = v;
    }
  });
  pos.value = 0;

  for (; pos.value < input.length;) {
    // loop through the input, open and close blocks using hereinabove functions
    for (const b of blocks) {
      let last;
      if (stack.length) last = stack[stack.length - 1];
      if (b.opening === b.closing && input[pos.value] === b.opening) {
        if (last && last.b === b) { closeBlock(b) } else { openBlock(b) }
        break; // stop loop over the remaining blocks
      } else if (input[pos.value] === b.opening) {
        openBlock(b); break; // stop loop over the remaining blocks
      } else if (input[pos.value] === b.closing) {
        // may be maths interval: (1,2]
        if (
          last &&
          (last.b.opening === "[" && b.closing === ")" ||
          last.b.opening === "(" && b.closing === "]")
        ) {
          // it is a math interval
          closeBlock(b);
          // we chould decrease health when closing
          b.health++;
          // we have to decrease the opened opened
          last.b.health--;
          break; // stop loop over the remaining blocks
        } else if (b.health && last.b !== b) {
          const location = peg$computeLocation(pos.value, pos.value);
          error(`"${last.b.opening}" opened bot not closed`, location);
        } else if (!b.health) {
          const location = peg$computeLocation(pos.value, pos.value);
          // closing with out opening
          error(`trying to close with "${b.closing}", but "${b.opening}" is not found before`, location);
        }
        // may be maths interval: [1,2]
        // interval (1,2) is not mateched, as it may be function call expression
        // it has to be validated there
        closeBlock(b);
        break; // stop loop over the remaining blocks
      }
    }

    if(!skipConsuming) pos.value++;
    skipConsuming = false;
  }

  if (stack.length > 0) {
    let last = stack.pop();
    // this will throw reference error if the module used standalone
    const location = peg$computeLocation(pos.value, pos.value);
    // this will throw syntax error in the built commonjs module
    error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
  }
  
} 
