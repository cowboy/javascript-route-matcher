
test("called with url", function() {
  same(getRoute("users", "foo"), null, "shouldn't match");
  same(getRoute("users", "users"), {}, "should match");
});

test("called without url", function() {
  var r = getRoute("users");
  same(typeof r, "function", "should return a function");
  same(r("foo"), null, "shouldn't match");
  same(r("users"), {}, "should match");
});

test("regex route", function() {
  var r = getRoute(/^users?(?:\/(\d+)(?:\.\.(\d+))?)?/);
  same(r("foo"), null, "shouldn't match");
  same(r("user"), ["user", undefined, undefined], "should match");
  same(r("user/123"), ["user/123", "123", undefined], "should match");
  same(r("user/123..456"), ["user/123..456", "123", "456"], "should match");
});

test("string route, basic", function() {
  var r = getRoute("users");
  same(r("fail"), null, "shouldn't match");
  same(r("users/"), null, "shouldn't match");
  same(r("users/foo"), null, "shouldn't match");
  same(r("users"), {}, "Should match");
});

test("string route, one variable", function() {
  var r = getRoute("users/:id");
  same(r("users"), null, "shouldn't match");
  same(r("users/123/456"), null, "shouldn't match");
  same(r("users/"), {id: ""}, "should match");
  same(r("users/123"), {id: "123"}, "should match");
});

test("string route, multiple variables", function() {
  var r = getRoute("users/:id/:other");
  same(r("users"), null, "shouldn't match");
  same(r("users/123"), null, "shouldn't match");
  same(r("users/123/456"), {id: "123", other: "456"}, "should match");
});

test("string route, one splat", function() {
  var r = getRoute("users/*stuff");
  same(r("users"), null, "shouldn't match");
  same(r("users/"), {stuff: ""}, "should match");
  same(r("users/123"), {stuff: "123"}, "should match");
  same(r("users/123/456"), {stuff: "123/456"}, "should match");
});

test("string route, multiple splats", function() {
  var r = getRoute("users/*stuff/*more");
  same(r("users"), null, "shouldn't match");
  same(r("users/123"), null, "shouldn't match");
  same(r("users/123/"), {stuff: "123", more: ""}, "should match");
  same(r("users//123"), {stuff: "", more: "123"}, "should match");
  same(r("users//"), {stuff: "", more: ""}, "should match");
  same(r("users///123"), {stuff: "/", more: "123"}, "should match");
  same(r("users/123/456"), {stuff: "123", more: "456"}, "should match");
  same(r("users/123/456/789"), {stuff: "123/456", more: "789"}, "capturing should be greedy");
});

test("string route, variables and splats", function() {
  var r = getRoute("users/:id/*stuff/:other/*more");
  same(r("users/123/aaa/456/bbb"), {id: "123", other: "456", stuff: "aaa", more: "bbb"}, "this is pushing it");

  r = getRoute("users/:id/:other/*stuff/*more");
  same(r("users/123/456/aaa/bbb/ccc"), {id: "123", other: "456", stuff: "aaa/bbb", more: "ccc"}, "this is a little more reasonable");
});

// These were pulled from the backbone.js unit tests.
test("a few backbone.js test routes", function() {
  r = getRoute("search/:query/p:page");
  same(r("search/boston/p20"), {query: "boston", page: "20"}, "should match");

  r = getRoute("*first/complex-:part/*rest");
  same(r("one/two/three/complex-part/four/five/six/seven"), {first: "one/two/three", part: "part", rest: "four/five/six/seven"}, "should match");

  r = getRoute(":entity?*args");
  same(r("cowboy?a=b&c=d"), {entity: "cowboy", args: "a=b&c=d"}, "should match");

  r = getRoute("*anything");
  same(r("doesnt-match-a-route"), {anything: "doesnt-match-a-route"}, "should match");
});
