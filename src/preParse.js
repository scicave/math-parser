module.exports = function preParse(input, peg$computeLocation, error) {
  // check for brackets matching
  var
    // the same as the pegjs rule "_" in ./tex.pegjs
    ignore = /^(?:\s|\\ )+/;
    // when we remove the {...} block after one of these,
    // the parsing expression will result in wrong tree
  
  var blocks = [
    { opening: '{', closing: '}' },
    { opening: '(', closing: ')' },
    { opening: '[', closing: ']' },
    { opening: '|', closing: '|' },
  ];

  // to store the brackets stack, the nested brackets, parent till the current bracket block that we are in
  var stats = [],
      pos = {},
      skipConsuming = {};
  
  function openBlock(b) {
    stats.push({
      b, pos: pos.value
    });
    pos.value += b.opening.length; // consume the closing char
    skipConsuming = true;
  }

  function closeBlock(b) {
    stats.pop();
    pos.value += b.closing.length; // consume the closing char
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
      if (stats.length) last = stats[stats.length - 1];

      if (b.opening === b.closing) {
        // this is true for opening and closing the block
        if (input.slice(pos.value, pos.value + b.opening.length) === b.opening /* || b.closing */) {
          if (last && last.b === b) { closeBlock(b); } else { openBlock(b); }
          break; // stop the blocks for loop
        }
      } else if (input.slice(pos.value, pos.value + b.opening.length) === b.opening) {
        openBlock(b); break; // stop blocks the for loop
      } else if (input.slice(pos.value, pos.value + b.closing.length) === b.closing) {
        if (last && last.b !== b) {
          const location = peg$computeLocation(pos.value, pos.value);
          error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
        } else if (!last || stats.filter(_=>_.b === b).length === 0) {
          const location = peg$computeLocation(pos.value, pos.value);
          // closing with out opening
          error(`block "${b.opening}" is not found before!`, location);
        }
        closeBlock(b);
        break; // stop the blocks for loop
      }
    }

    if(!skipConsuming) pos.value++;
    skipConsuming = false;
  }

  if (stats.length > 0) {
    let last = stats.pop();
    // this will throw reference error if the module used standalone
    const location = peg$computeLocation(pos.value, pos.value);
    // this will throw syntax error in the built commonjs module
    error(`"${last.b.opening}" found but the block is not closed, hint: add "${last.b.closing}"`, location);
  }
  
} 
