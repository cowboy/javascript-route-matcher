# JavaScript Basic Route Matcher
A simple route matching / url building utility. Intended to be included as part of a larger routing library.

## Sample Usage
```javascript
// You can use routeMatcher to match just once.
routeMatcher("search/:query/p:page", "search/boston/p20") // {query: "boston", page: "20"}

// Or you can use routeMatcher to create a reusable route matching function.
var r = routeMatcher("search/:query/p:page");
r.match("search/gonna-fail") // null (no match)
r.match("search/cowboy/p5")  // {query: "cowboy", page: "5"}
r.match("search/gnarf/p10")  // {query: "gnarf", page: "10"}

// But wait, it goes both ways! (Note that .build only works for string routes,
// not RegExp routes)
r.build({query: "bonus", page: "6"}) // "search/bonus/p6"

// You can pass in a RegExp route as well.
r = routeMatcher(/^users?(?:\/(\d+)(?:\.\.(\d+))?)?/);
r("gonna-fail")        // null (no match)
r("user")              // ["user", undefined, undefined]
r("users")             // ["users", undefined, undefined]
r("user/123")          // ["user/123", "123", undefined]
r("user/123..456")     // ["user/123..456", "123", "456"]
```

## Documentation
Look at the unit tests.

## Release History
Nothing official yet...

## License
Copyright (c) 2011 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
<http://benalman.com/about/license/>
