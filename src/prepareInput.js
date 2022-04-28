// just a layer ro predict some issues and SyntaxError's before the parser hit them
// here we provide more informative error messages
module.exports = function prepareInput(input, peg$computeLocation, error) {
  if (/^\s*$/.test(input)) error("no expression found", null);

  let inputClone = input;
  // the same as the pegjs rule "_" in ./tex.pegjs
  const ignorePattern = /^\s+/;

  // code is optimized as all openings and closings are single-char
  // make sure when using multi-char block opening or closings to
  // use String.prototype.slice rather than using direct chars, string[index].
  // you can NOT repeat an opening or closing char twice
  const blocksOpenings = {
    // level is how much of this block is still opened
    "|": { closings: new Set(["|"]), level: 0 },
    "{": { closings: new Set(["}"]), level: 0 },
    "(": { closings: new Set([")", "]"]), level: 0 },
    "[": { closings: new Set(["]", ")", "["]), level: 0 },
    "]": { closings: new Set(["]", "["]), level: 0 },
  };

  const blocksClosings = {};

  for (const key in blocksOpenings) {
    for (const closingChar of blocksOpenings[key].closings) {
      const closing = (blocksClosings[closingChar] ??= {});
      closing.openings ??= new Set();
      closing.openings.add(key);
    }
  }

  // when new block is opened push to the stack, if it is closed pop from it
  const openedBlocksStack = [];
  // the current position in the input to consume from
  const cursor = { __value: 0 };
  let cloneCursorShift = 0;

  Object.defineProperty(cursor, "position", {
    get() {
      return this.__value;
    },
    set(v) {
      input.slice(v, -1).replace(ignorePattern, (m) => {
        v += m.length; // consume ignored letters, such as white spaces
      });
      this.__value = v;
    },
  });

  function consumeBlocks() {
    let last;
    if (openedBlocksStack.length) last = openedBlocksStack[openedBlocksStack.length - 1];

    const char = input[cursor.position]; // seek the next char
    const opening = blocksOpenings[char];
    const closing = blocksClosings[char];

    if (
      // and it is the closing char of the last opened block
      last &&
      last.opening.closings.has(char)
    ) {
      try {
        validateClosing();
        const blockReplacement = "%BLOCK%";
        cursor.position++; // consume the closing char
        last.opening.level--;
        openedBlocksStack.pop();
        inputClone = // replace the block with blockReplacement
          inputClone.slice(0, last.cursorPosition + cloneCursorShift) +
          blockReplacement +
          inputClone.slice(cursor.position + cloneCursorShift);
        cloneCursorShift += blockReplacement.length - (cursor.position - last.cursorPosition);
        return true;
      } catch (e) {
        if (!opening) throw e;
      }
    }

    if (opening) {
      openedBlocksStack.push({ opening, cursorPosition: cursor.position });
      cursor.position++; // consume the opening char
      opening.level++;
      return true;
    }

    if (closing) {
      const location = peg$computeLocation(cursor.position, cursor.position);
      error(
        `trying to close with "${char}" but no corresponding opening is found, hint: add "${[
          ...closing.openings,
        ].join(", ")}"`,
        location
      );
    }
  }

  function validateClosing() {
    const last = openedBlocksStack[openedBlocksStack.length - 1];
    const closingChar = input[cursor.position];
    // + 1 to skip the opening char
    const blockContent = inputClone.slice(last.cursorPosition + 1, cursor.position);

    // if (blockContent === "" && input[last.cursorPosition] + closingChar !== "()") {
    //   const location = peg$computeLocation(last.cursorPosition, cursor.position);
    //   error("block is empty, you should put some expression in it", location);
    // }

    if (mustBeMathInterval(input[last.cursorPosition] + closingChar)) {
      const boundings = blockContent.split(",");
      if (boundings.length !== 2 || boundings.some((b) => b === "")) {
        const location = peg$computeLocation(last.cursorPosition, cursor.position);
        error("math intervals should consist of two elements", location);
      }
    }

    if (/^\s*,|,\s*$|,\s*,/.test(blockContent)) {
      const location = peg$computeLocation(last.cursorPosition, cursor.position);
      error("can't have empty item in a block", location);
    }
  }

  function mustBeMathInterval(chars) {
    const onlyIntervals = ["[)", "(]", "[[", "][", "]]"];
    return onlyIntervals.includes(chars);
  }

  while (cursor.position < input.length) {
    const isBlockConsumed = consumeBlocks();
    if (!isBlockConsumed) cursor.position++;
  }

  if (openedBlocksStack.length > 0) {
    let last = openedBlocksStack.pop();
    const openingChar = input[last.cursorPosition];
    const location = peg$computeLocation(last.cursorPosition, cursor.position);
    error(
      `"${openingChar}" found but the block is not closed, hint: add "${[
        ...last.opening.closings,
      ].join(", ")}"`,
      location
    );
  }

  return input;
};
