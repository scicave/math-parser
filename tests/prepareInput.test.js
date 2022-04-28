const oldPrepare = require("../src/prepareInput");
const pegjsPolyFill = require("./pegjsPolyFill");
const SyntaxError = pegjsPolyFill.SyntaxError;

const prepare = (tex) => {
  pegjsPolyFill.input.value = tex;
  return oldPrepare(
    tex,
    pegjsPolyFill.peg$computeLocation,
    pegjsPolyFill.error
  );
};

it("should throw when an empty input is provided", () => {
  expect(() => prepare("")).toThrow(SyntaxError);
  expect(() => prepare("\t")).toThrow(SyntaxError);
  expect(() => prepare("\t  \n ")).toThrow(SyntaxError);
});

it("should fail when a bracket opened but not closed", () => {
  let tex;
  tex = "(1";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "([1";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "([1]";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "([1{}]";
  expect(() => prepare(tex)).toThrow(SyntaxError);
});

it("should fail when a bracket closed without opening", () => {
  let tex;
  tex = "1)";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "1]";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "1}";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "[1])";
  expect(() => prepare(tex)).toThrow(SyntaxError);
});

it("should pass when a valid brackets are correctly provided", () => {
  let tex;
  tex = "(1)";
  expect(prepare(tex)).toEqual(tex);
  tex = "[1]";
  expect(prepare(tex)).toEqual(tex);
  tex = "[1]()";
  expect(prepare(tex)).toEqual(tex);
  tex = "((1)[sin(x)]){4,sqrt(2)}";
  expect(prepare(tex)).toEqual(tex);
});

it("should pass when a math interval is provided", () => {
  let tex;
  tex = "(1,2]";
  expect(prepare(tex)).toEqual(tex);
  tex = "[1,2)";
  expect(prepare(tex)).toEqual(tex);
  tex = "[1,2]";
  expect(prepare(tex)).toEqual(tex);
  tex = "(1,2)";
  expect(prepare(tex)).toEqual(tex);
});

it('should fail when it matches a math interval brackets but without a comma ","', () => {
  let tex;
  tex = "(1]";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "[1)";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "]1]";
  expect(() => prepare(tex)).toThrow(SyntaxError);
  tex = "[1[";
  expect(() => prepare(tex)).toThrow(SyntaxError);

  tex = "[1]";
  expect(prepare(tex)).toEqual(tex);
  tex = "(1)";
  expect(prepare(tex)).toEqual(tex);
});

// Abandoned because it causes issues with something like: ||1+2| + |-3||
// TODO: find a way to fix this
// it('should fail brackets are empty', () => {
//   let tex;
//   tex = "(]";
//   expect(() => prepare(tex)).toThrow(SyntaxError);
//   tex = "[1)";
//   expect(() => prepare(tex)).toThrow(SyntaxError);
//   tex = "]1,]";
//   expect(() => prepare(tex)).toThrow(SyntaxError);
//   tex = "[,[";
//   expect(() => prepare(tex)).toThrow(SyntaxError);
//   tex = "[,1]";
//   expect(() => prepare(tex)).toThrow(SyntaxError);
// });

it('should pass when () are empty, it may be a funtion call', () => {
  let tex = "()";
  expect(prepare(tex)).toEqual(tex);
});

it('should pass when closing is not valid but can still open new block', () => {
  let tex = "[[1,2]]";
  expect(prepare(tex)).toEqual(tex);
  tex = "|||1|||";
  expect(prepare(tex)).toEqual(tex);
  tex = "||x-y|-|y-z||";
  expect(prepare(tex)).toEqual(tex);
});
