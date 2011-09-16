# JavaScript Basic Route Matcher
A simple route matching utility. Intended to be included as part of a larger routing library.

## Sample Usage
```javascript
// You can use routeMatcher to match just once.
routeMatcher("search/:query/p:page", "search/boston/p20") // {query: "boston", page: "20"}

// Or you can use routeMatcher to create a reusable route matching function.
var matchRoute = routeMatcher("search/:query/p:page");
matchRoute("search/gonna-fail") // null
matchRoute("search/cowboy/p5")  // {query: "cowboy", page: "5"}
matchRoute("search/gnarf/p10")  // {query: "gnarf", page: "10"}

// You can pass in a RegExp route as well.
var matchRoute = routeMatcher(/^users?(?:\/(\d+)(?:\.\.(\d+))?)?/);
matchRoute("gonna-fail")        // null (no match)
matchRoute("user")              // ["user", undefined, undefined]
matchRoute("users")             // ["users", undefined, undefined]
matchRoute("user/123")          // ["user/123", "123", undefined]
matchRoute("user/123..456")     // ["user/123..456", "123", "456"]
```

## Documentation
Look at the unit tests.

## Release History
Nothing official yet...

## License
Copyright (c) 2011 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
<http://benalman.com/about/license/>
