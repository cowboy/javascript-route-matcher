# JavaScript Basic Route Matcher
A simple route matching / url building utility. Intended to be included as part of a larger routing library.

## Sample Usage
```javascript
// Use routeMatcher to create a reusable route matching function.
var search = routeMatcher("search/:query/p:page");
search.parse("search/gonna-fail") // null (no match)
search.parse("search/cowboy/p5")  // {query: "cowboy", page: "5"}
search.parse("search/gnarf/p10")  // {query: "gnarf", page: "10"}

// But wait, it goes both ways!
search.stringify({query: "bonus", page: "6"}) // "search/bonus/p6"

// You can also pass in a map of per-param validators after the route, each can
// be a RegExp to test against, function that accepts a value (and returns true
// or false) or value to match against.
var user = routeMatcher("user/:id/:other", {
  id: /^\d+$/,
  other: function(value) { return value === "" || value === "foo"; }
});
user.parse("user/123/abc")  // null (no match)
user.parse("user/foo/")     // null (no match)
user.parse("user/123/")     // {id: "123", other: ""}
user.parse("user/123/foo")  // {id: "123", other: "foo"}

// You can pass in a RegExp route as well, which returns an array of matches or
// null if no match. Note that for RegExp routes, the .stringify method always
// returns empty string, because stringification isn't supported.
r = routeMatcher(/^users?(?:\/(\d+)(?:\.\.(\d+))?)?/);
r("gonna-fail")     // null (no match)
r("user")           // ["user", undefined, undefined]
r("users")          // ["users", undefined, undefined]
r("user/123")       // ["user/123", "123", undefined]
r("user/123..456")  // ["user/123..456", "123", "456"]
```

## Documentation
Look at the unit tests.

## Release History
Nothing official yet...

## License
Copyright (c) 2011 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
<http://benalman.com/about/license/>
