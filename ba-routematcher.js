/*!
 * JavaScript Basic Route Matcher - v0.1pre - 9/16/2011
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function(global) {
  // Characters to be escaped with \. RegExp borrowed from the Backbone router
  // but escaped (note: unnecessarily) to keep JSHint from complaining.
  var reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
  // Match named :param or *splat placeholders.
  var reParam = /([:*])(\w+)/g;

  global.routeMatcher = function(route, url) {
    // Object to be returned. The public API.
    var self = {};
    // Matched param or splat names, in order
    var names = [];
    // Route matching RegExp.
    var re = route;

    // Build route RegExp from passed string.
    if (typeof route === "string") {
      // Escape special chars.
      re = re.replace(reEscape, "\\$&");
      // Replace any :param or *splat with the appropriate capture group.
      re = re.replace(reParam, function(_, mode, name) {
        names.push(name);
        // :param should capture until the next / or EOL, while *splat should
        // capture until the next :param, *splat, or EOL.
        return mode === ":" ? "([^/]*)" : "(.*)";
      });
      // Add ^/$ anchors and create the actual RegExp.
      re = new RegExp("^" + re + "$");

      // Match the passed url against the route, returning an object of params
      // and values.
      self.match = function(url) {
        var i = 0;
        var params = {};
        var matches = url.match(re);
        // If no matches, return null.
        if (!matches) { return null; }
        // Add all matched :param / *splat values into the params object.
        while(i < names.length) {
          params[names[i++]] = matches[i];
        }
        return params;
      };

      // Build path by inserting the given params into the route.
      self.build = function(params) {
        var param, re;
        var result = route;
        // Insert each passed param into the route string.
        for (param in params) {
          re = new RegExp("[:*]" + param + "\\b");
          result = result.replace(re, params[param]);
        }
        // Missing params should be replaced with empty string.
        return result.replace(reParam, "");
      };
    } else {
      // RegExp route was passed. This is super-simple.
      self.match = function(url) {
        return url.match(re);
      };
    }
    // If a url was passed, return params or matches, otherwise return the
    // route-matching function.
    return url == null ? self : self.match(url);
  };

}(this.exports || this));
