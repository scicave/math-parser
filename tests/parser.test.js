// TODO: add more tests

const parser = require("parser");
const preParse = require("preParse");
const testsMap = require("./maps");
let quite = 0; // no struct or node logged when a test fails

expect.extend({
  /**
   * @param {parser.Node} node
   * @param {Object} struct
   */
  toHaveStructure(node, struct) {
    function failed(msg) {
      if (quite) {
        return {
          message: () => msg,
          pass: false,
        };
      }

      function simplify(o) {
        JSON.stringify(o);
        if (typeof o !== "object") return o;
        if (!o /** === null */) return o;
        if (o.type === "number") return o.value;
        else if (o.type === "id") return o.name;
        const r = o instanceof Array ? [] : {};
        const ignore = ["match", "operatorType"];
        for (const p in o) {
          if (ignore.indexOf(p) === -1 && o.hasOwnProperty(p)) {
            r[p] = simplify(o[p]);
          }
        }
        return r;
      }

      const simple_node = simplify(node);
      const simple_struct = simplify(struct);
      return {
        message: () =>
          `${msg}\n====================== node ======================\n${JSON.stringify(
            simple_node,
            null,
            2
          )}\n====================== expected ======================\n${JSON.stringify(simple_struct, null, 2)}`,
        pass: false,
      };
    }

    if (!(node instanceof parser.Node)) {
      return failed("Received value has to be instance of parser.Node", node);
    }

    function _check(n, s, nPath, sPath) {

      if (nPath !== sPath) return failed(`AST paths are different: ${nPath},,, ${sPath}`);

      if (!(n && s)) return;
      if (typeof s === 'number') {
        s = { type: "number", value: s };
      } else if (typeof s === "string") {
        s = { type: "id", name: s };
      }

      if (Array.isArray(n) && Array.isArray(s)) {
        if (s.length !== n.length) {
          return failed(`${sPath} in struct and ${nPath} in node args has different lengths`, node);
        }
        for (let i = 0; i < s.length; i++) {
          if (typeof n[i] !== 'object')
            if(n[i] !== s[i]) return failed(`${nPath}[${i}] !== ${sPath}[${i}]`);
            else continue;
          let c = _check(n[i], s[i], nPath + `[${i}]`, sPath + `[${i}]`);
          if (c) return c; // here a problem is found
        }
        return;
      } else if (Array.isArray(n) || Array.isArray(s)) {
        return failed(`one of ${nPath},,, ${sPath},,, is array but the other is not`);
      }

      // now n and s must be objects { type: string, args: Array, ... }
      if (!(s instanceof Object)) {
        return failed(`"struct" is type of ${typeof s}, toHaveStructure checks the match between parser.Node and object.`, node);
      }

      nPath = (nPath ? nPath + "[" : "[") + n.type + "]";
      sPath = (sPath ? sPath + "[" : "[") + s.type + "]";

      if (!n.check(s)) {
        return failed(`properties of ${nPath} in node, don't match these of ${sPath} of struct`, node);
      }

      if (s.args && n.args) {
        return _check(n.args, s.args, nPath + "[args]", sPath + "[args]");
      } else if (s.args || n.args) {
        if (s.args) {
          return failed(`${sPath} in struct has args but ${nPath} in node doesn't`, node);
        } else {
          return failed(`${nPath} in node has args but ${sPath} in struct doesn't`, node);
        }
      }
    }

    return _check(node, struct) || { message: () => "Parse-tree matches the structure object!", pass: true };
  },
});

describe("testing preParse module", () => {
  
  class SyntaxError extends Error {}
  const _preParse = (() => {
    function computeLocation() {}
    function error (msg) { throw new SyntaxError(msg) }
    return (math) => {
      return preParse(math, computeLocation, error);
    }
  })();

  it("should throw: when passing blank or whitespaced string", ()=>{
    expect(()=>_preParse("")).toThrow(SyntaxError);
    expect(()=>_preParse("\t ")).toThrow(SyntaxError);
    expect(()=>_preParse("\n\r \t")).toThrow(SyntaxError);
  });

  it("should throw: unmatched blocks", () => {
    expect(()=>_preParse("[")).toThrow(SyntaxError);
    expect(()=>_preParse("[1}")).toThrow(SyntaxError);
    expect(()=>_preParse("(1}")).toThrow(SyntaxError);
    expect(()=>_preParse("1}")).toThrow(SyntaxError);
  });

  it("should preParse: when unmatched blocks are valid interval", () => {
    expect(()=>_preParse("1+(2,a]")).not.toThrow(SyntaxError);
    expect(()=>_preParse("1+[2,a)")).not.toThrow(SyntaxError);
  });

});

function getTitle(__test) {
  // return math.replace(/\n/g, '\\n');
  let mkt = (m) => `\n\t\t\t${JSON.stringify(m)}`;
  if (__test.title) { 
    let t = mkt(__test.math);
    return __test.title + t;
  }
  return (__test.error ? "should throw: " : "should parse: ") +
    JSON.stringify(__test.math);
}

// our tests js object, stored in `map`
// if the property is array, then this 
// is array of tests to do using `jest.test`
// otherwise this is a group to pack
// inside `jest.describe` 
function doTest(on, title) {
  describe(title, ()=>{

    // awesome, we have some tests here
    if (on instanceof Array)
    {
      on.forEach((__test) => {
        // the test title
        let title = getTitle(__test);
        // the funcction to be passed to jest.test
        let fn = () => {
          debugger;
          // expect it to throw
          if (__test.error) {
            expect(()=>parser.parse(__test.math, __test.parserOptions)).toThrow(
              __test.errorType === "syntax" ? parser.SyntaxError :
              __test.errorType === "options" ? parser.OptionsError :
              __test.errorType
            );
          }
          // or expect it to parse successfully
          else {
            expect(parser.parse(__test.math, __test.parserOptions)).toHaveStructure(__test.struct);
          }
        };
        
        // check some other __test configs
        if (__test.only) 
          test.only(title, fn);
        else if (__test.skip)
          test.skip(title, fn); // finally test as usual
        else
          test(title, fn); // finally test as usual
      });
    }

    // we have another sub-group, `jest.descripe`
    else if (typeof on === 'object')
    {
      for (let p in on) {
        doTest(on[p], p);
      }
    }

    // unexpected thing happened
    else
    { 
      throw new Error('can\'t do tests on ' + typeof on);
    }

  });
}

doTest(testsMap, "test parse function");
