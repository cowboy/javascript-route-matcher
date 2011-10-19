/*global require:true */
var routeMatcher = require('../lib/routematcher').routeMatcher;

exports.parse = {
  "regex route": function(test) {
    var r = routeMatcher(/^(users?)(?:\/(\d+)(?:\.\.(\d+))?)?/);
    test.strictEqual(r.parse("foo"), null, "shouldn't match");
    test.deepEqual(r.parse("user"), {captures: ["user", undefined, undefined]}, "should match");
    test.deepEqual(r.parse("users"), {captures: ["users", undefined, undefined]}, "should match");
    test.deepEqual(r.parse("user/123"), {captures: ["user", "123", undefined]}, "should match");
    test.deepEqual(r.parse("user/123..456"), {captures: ["user", "123", "456"]}, "should match");
    test.done();
  },
  "string route, basic": function(test) {
    var r = routeMatcher("users");
    test.strictEqual(r.parse("fail"), null, "shouldn't match");
    test.strictEqual(r.parse("users/"), null, "shouldn't match");
    test.strictEqual(r.parse("users/foo"), null, "shouldn't match");
    test.deepEqual(r.parse("users"), {}, "Should match");
    test.done();
  },
  "string route, one variable": function(test) {
    var r = routeMatcher("users/:id");
    test.strictEqual(r.parse("users"), null, "shouldn't match");
    test.strictEqual(r.parse("users/123/456"), null, "shouldn't match");
    test.deepEqual(r.parse("users/"), {id: ""}, "should match");
    test.deepEqual(r.parse("users/123"), {id: "123"}, "should match");
    test.done();
  },
  "string route, multiple variables": function(test) {
    var r = routeMatcher("users/:id/:other");
    test.strictEqual(r.parse("users"), null, "shouldn't match");
    test.strictEqual(r.parse("users/123"), null, "shouldn't match");
    test.deepEqual(r.parse("users/123/456"), {id: "123", other: "456"}, "should match");
    test.done();
  },
  "string route, one splat": function(test) {
    var r = routeMatcher("users/*stuff");
    test.strictEqual(r.parse("users"), null, "shouldn't match");
    test.deepEqual(r.parse("users/"), {stuff: ""}, "should match");
    test.deepEqual(r.parse("users/123"), {stuff: "123"}, "should match");
    test.deepEqual(r.parse("users/123/456"), {stuff: "123/456"}, "should match");
    test.done();
  },
  "string route, multiple splats": function(test) {
    var r = routeMatcher("users/*stuff/*more");
    test.strictEqual(r.parse("users"), null, "shouldn't match");
    test.strictEqual(r.parse("users/123"), null, "shouldn't match");
    test.deepEqual(r.parse("users/123/"), {stuff: "123", more: ""}, "should match");
    test.deepEqual(r.parse("users//123"), {stuff: "", more: "123"}, "should match");
    test.deepEqual(r.parse("users//"), {stuff: "", more: ""}, "should match");
    test.deepEqual(r.parse("users///123"), {stuff: "/", more: "123"}, "should match");
    test.deepEqual(r.parse("users/123/456"), {stuff: "123", more: "456"}, "should match");
    test.deepEqual(r.parse("users/123/456/789"), {stuff: "123/456", more: "789"}, "capturing should be greedy");
    test.done();
  },
  "string route, variables and splats": function(test) {
    var r = routeMatcher("users/:id/*stuff/:other/*more");
    test.deepEqual(r.parse("users/123/aaa/456/bbb"), {id: "123", other: "456", stuff: "aaa", more: "bbb"}, "this is pushing it");

    r = routeMatcher("users/:id/:other/*stuff/*more");
    test.deepEqual(r.parse("users/123/456/aaa/bbb/ccc"), {id: "123", other: "456", stuff: "aaa/bbb", more: "ccc"}, "this is a little more reasonable");
    test.done();
  },
  // These were pulled from the backbone.js unit tests.
  "a few backbone.js test routes": function(test) {
    var r = routeMatcher("search/:query/p:page");
    test.deepEqual(r.parse("search/boston/p20"), {query: "boston", page: "20"}, "should match");

    r = routeMatcher("*first/complex-:part/*rest");
    test.deepEqual(r.parse("one/two/three/complex-part/four/five/six/seven"), {first: "one/two/three", part: "part", rest: "four/five/six/seven"}, "should match");

    r = routeMatcher(":entity?*args");
    test.deepEqual(r.parse("cowboy?a=b&c=d"), {entity: "cowboy", args: "a=b&c=d"}, "should match");

    r = routeMatcher("*anything");
    test.deepEqual(r.parse("doesnt-match-a-route"), {anything: "doesnt-match-a-route"}, "should match");
    test.done();
  },
  "specific matching rules": function(test) {
    var digitsOnlyFn = function(value) { return value.match(/^\d+$/); };
    var digitsOnlyRe = /^\d+$/;

    var r = routeMatcher("users/:id", {id: digitsOnlyRe});
    test.strictEqual(r.parse("users"), null, "shouldn't match");
    test.strictEqual(r.parse("users/"), null, "shouldn't match");
    test.strictEqual(r.parse("users/abc"), null, "shouldn't match");
    test.strictEqual(r.parse("users/123.456"), null, "shouldn't match");
    test.deepEqual(r.parse("users/123"), {id: "123"}, "should match");

    r = routeMatcher("users/:id", {id: digitsOnlyFn});
    test.strictEqual(r.parse("users/abc"), null, "shouldn't match");
    test.strictEqual(r.parse("users/123.456"), null, "shouldn't match");
    test.deepEqual(r.parse("users/123"), {id: "123"}, "should match");

    r = routeMatcher("users/:id", {id: 456});
    test.strictEqual(r.parse("users/123"), null, "shouldn't match");
    test.deepEqual(r.parse("users/456"), {id: "456"}, "should match");

    r = routeMatcher("users/:id", {id: "abc123"});
    test.strictEqual(r.parse("users/abc"), null, "shouldn't match");
    test.deepEqual(r.parse("users/abc123"), {id: "abc123"}, "should match");

    r = routeMatcher("users/:id/:other", {id: digitsOnlyRe, other: digitsOnlyFn});
    test.strictEqual(r.parse("users/abc/def"), null, "shouldn't match");
    test.strictEqual(r.parse("users/abc/123"), null, "shouldn't match");
    test.strictEqual(r.parse("users/123/abc"), null, "shouldn't match");
    test.deepEqual(r.parse("users/123/456"), {id: "123", other: "456"}, "should match");
    test.done();
  }
};

exports.stringify = {
  "regex route": function(test) {
    var r = routeMatcher(/^(users?)(?:\/(\d+)(?:\.\.(\d+))?)?/);
    test.strictEqual(r.stringify("anything"), "", "always returns empty string if RegExp route");
    test.done();
  },
  "one variable": function(test) {
    var r = routeMatcher("users/:id");
    test.strictEqual(r.stringify({id: "123"}), "users/123", "should build");
    test.strictEqual(r.stringify({id: ""}), "users/", "should build");
    test.strictEqual(r.stringify({}), "users/", "omitted params default to empty string");
    test.strictEqual(r.stringify(), "users/", "omitted argument default to behave like empty object passed");
    test.done();
  },
  "multiple variables": function(test) {
    var r = routeMatcher("users/:id/:other");
    test.strictEqual(r.stringify({id: "123", other: "456"}), "users/123/456", "should build");
    test.strictEqual(r.stringify({id: "", other: "456"}), "users//456", "should build");
    test.strictEqual(r.stringify({id: "123", other: ""}), "users/123/", "should build");
    test.strictEqual(r.stringify({id: "", other: ""}), "users//", "should build");
    test.strictEqual(r.stringify({id: "123"}), "users/123/", "omitted params default to empty string");
    test.strictEqual(r.stringify({other: "456"}), "users//456", "omitted params default to empty string");
    test.strictEqual(r.stringify({}), "users//", "omitted params default to empty string");
    test.strictEqual(r.stringify(), "users//", "omitted params default to empty string");
    test.done();
  },
  "one splat": function(test) {
    var r = routeMatcher("users/*stuff");
    test.strictEqual(r.stringify({stuff: ""}), "users/", "should build");
    test.strictEqual(r.stringify({stuff: "123"}), "users/123", "should build");
    test.strictEqual(r.stringify({stuff: "123/456"}), "users/123/456", "should build");
    test.strictEqual(r.stringify({}), "users/", "omitted params default to empty string");
    test.strictEqual(r.stringify(), "users/", "omitted params default to empty string");
    test.done();
  },
  "multiple splats": function(test) {
    var r = routeMatcher("users/*stuff/*more");
    test.strictEqual(r.stringify({stuff: "123", more: "456"}), "users/123/456", "should build");
    test.strictEqual(r.stringify({stuff: "123", more: ""}), "users/123/", "should build");
    test.strictEqual(r.stringify({stuff: "", more: "123"}), "users//123", "should build");
    test.strictEqual(r.stringify({stuff: "", more: ""}), "users//", "should build");
    test.strictEqual(r.stringify({}), "users//", "omitted params default to empty string");
    test.strictEqual(r.stringify(), "users//", "omitted params default to empty string");
    test.done();
  },
  "possibly conflicting param names": function(test) {
    var r = routeMatcher(":a/:aa/*aaa/*aaaa");
    test.strictEqual(r.stringify({a: 1, aa: 2, aaa: 3, aaaa: 4}), "1/2/3/4", "should build");
    test.strictEqual(r.stringify({aaaa: 4, aaa: 3, aa: 2, a: 1}), "1/2/3/4", "should build");
    test.done();
  }
};
