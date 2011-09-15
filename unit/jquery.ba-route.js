
test("called with url", function() {
  same(getRoute("/users", "/foo"), null, "shouldn't match");
  same(getRoute("/users", "/users"), {}, "should match");
});

test("called without url", function() {
  var r = getRoute("/users");
  same(typeof r, "function", "should return a function");
  same(r("/foo"), null, "shouldn't match");
  same(r("/users"), {}, "should match");
});

test("regex route", function() {
  var r = getRoute(/^\/users?(?:\/(\d+)(?:\.\.(\d+))?)?/);
  same(r("/foo"), null, "shouldn't match");
  same(r("/user"), ["/user", undefined, undefined], "should match");
  same(r("/user/123"), ["/user/123", "123", undefined], "should match");
  same(r("/user/123..456"), ["/user/123..456", "123", "456"], "should match");
});

test("string route, basic", function() {
  var r = getRoute("/users");
  same(r("/fail"), null, "shouldn't match");
  same(r("/users/"), null, "shouldn't match");
  same(r("/users/foo"), null, "shouldn't match");
  same(r("/users"), {}, "Should match");
});

test("string route, one variable", function() {
  var r = getRoute("/users/:id");
  same(r("/users"), null, "shouldn't match");
  same(r("/users/"), null, "shouldn't match");
  same(r("/users/123/456"), null, "shouldn't match");
  same(r("/users/123"), {id: "123"}, "should match");
});

test("string route, multiple variables", function() {
  var r = getRoute("/users/:id/:other");
  same(r("/users"), null, "shouldn't match");
  same(r("/users/123"), null, "shouldn't match");
  same(r("/users/123/456"), {id: "123", other: "456"}, "should match");
});

test("string route, one wildcard", function() {
  var r = getRoute("/users/*");
  same(r("/users"), null, "shouldn't match");
  same(r("/users/"), {length: 1, 0: ""}, "should match");
  same(r("/users/123"), {length: 1, 0: "123"}, "should match");
  same(r("/users/123/456"), {length: 1, 0: "123/456"}, "should match");
});

test("string route, multiple wildcards", function() {
  var r = getRoute("/users/*/*");
  same(r("/users"), null, "shouldn't match");
  same(r("/users/123"), null, "shouldn't match");
  same(r("/users//"), {length: 2, 0: "", 1: ""}, "should match");
  same(r("/users//123"), {length: 2, 0: "", 1: "123"}, "should match");
  same(r("/users///123"), {length: 2, 0: "/", 1: "123"}, "should match");
  same(r("/users/123/456"), {length: 2, 0: "123", 1: "456"}, "should match");
  same(r("/users/123/456/789"), {length: 2, 0: "123/456", 1: "789"}, "capturing should be greedy");
});

test("string route, variables and wildcards", function() {
  var r = getRoute("/users/:id/*/:other/*");
  same(r("/users/123/aaa/456/bbb"), {id: "123", other: "456", length: 2, 0: "aaa", 1: "bbb"}, "this is pushing it");

  r = getRoute("/users/:id/:other/*/*");
  same(r("/users/123/456/aaa/bbb/ccc"), {id: "123", other: "456", length: 2, 0: "aaa/bbb", 1: "ccc"}, "this is a little more reasonable");
});
