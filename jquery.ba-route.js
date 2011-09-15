/*!
 * jQuery Route - v0.1pre - 9/15/2011
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// JUST SOME STUFF MAYBE FOR BBQ MAYBE NOT
// WORK IN PROGRESS DONT USE YET KTHX
// NOT EVEN USING JQUERY YET MAYBE IT NEVER WILL
// I LOVE COOKIES

function getRoute(route, url) {
  // Param names, in order
  var paramNames = [];
  // The route parsing function to be returned (or invoked if a url is passed).
  var fn;
  
  if (typeof route === "string") {
    // Build route RegExp from passed string.
    route = route.replace(/(\*)|:([^\/]+)/g, function(r, s, param) {
      if (param) {
        // Replace named :param with non-greedy capture group.
        paramNames.push(param);
        return "([^/]+)";
      } else {
        // Replace * wildcard with greedy capture group.
        paramNames.push(false);
        return "(.*)";
      }
    });

    // Create RegExp from parsed route string, adding anchors and escaping
    // as-necessary.
    route = new RegExp("^" + route.replace(/\//g, "\\/") + "$");

    fn = function(url) {
      var i, key;
      var params = {};
      var matches = url.match(route);
      // If no matches, return null.
      if (!matches) { return null; }
      // Loop over all :params / * wildcards.
      for (i = 0; i < paramNames.length; i++) {
        // Set the key var to the stored :param name or `false` if wildcard.
        if (!(key = paramNames[i])) {
          // Wildcard. Get the numeric key.
          key = params.length || 0;
          // Increment the length property.
          params.length = key + 1;
        }
        // Set the new value (:param name or numeric index for wildcard) in the
        // params object.
        params[key] = matches[i + 1];
      }
      return params;
    };
  } else {
    // RegExp route was passed. This is super-simple.
    fn = function(url) {
      return url.match(route);
    };
  }
  // If a url was passed, return matches, otherwise return a matching function.
  return url == null ? fn : fn(url);
}
