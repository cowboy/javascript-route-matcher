/*
 * JavaScript Route Matcher
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function(exports) {
  // Characters to be escaped with \. RegExp borrowed from the Backbone router
  // but escaped (note: unnecessarily) to keep JSHint from complaining.
  var reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
  // Match named :param or *splat placeholders.
  var reParam = /([:*])(\w+)/g;

  // Test to see if a value matches the corresponding rule.
  function validateRule(rule, value) {
    // For a given rule, get the first letter of the string name of its
    // constructor function. "R" -> RegExp, "F" -> Function (these shouldn't
    // conflict with any other types one might specify). Note: instead of
    // getting .toString from a new object {} or Object.prototype, I'm assuming
    // that exports will always be an object, and using its .toString method.
    // Bad idea? Let me know by filing an issue
    var type = exports.toString.call(rule).charAt(8);
    // If regexp, match. If function, invoke. Otherwise, compare. Note that ==
    // is used because type coercion is needed, as `value` will always be a
    // string, but `rule` might not.
    return type === "R" ? rule.test(value) : type === "F" ? rule(value) : rule == value;
  }

  // Pass in a route string (or RegExp) plus an optional map of rules, and get
  // back an object with .parse and .stringify methods.
  exports.routeMatcher = function(route, rules) {
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
      self.parse = function(url) {
        var i = 0;
        var param, value;
        var params = {};
        var matches = url.match(re);
        // If no matches, return null.
        if (!matches) { return null; }
        // Add all matched :param / *splat values into the params object.
        while (i < names.length) {
          param = names[i++];
          value = matches[i];
          // If a rule exists for thie param and it doesn't validate, return null.
          if (rules && param in rules && !validateRule(rules[param], value)) { return null; }
          params[param] = value;
        }
        return params;
      };

      // Build path by inserting the given params into the route.
      self.stringify = function(params) {
        var param, re;
        var result = route;
        // Insert each passed param into the route string. Note that this loop
        // doesn't check .hasOwnProperty because this script doesn't support
        // modifications to Object.prototype.
        for (param in params) {
          re = new RegExp("[:*]" + param + "\\b");
          result = result.replace(re, params[param]);
        }
        // Missing params should be replaced with empty string.
        return result.replace(reParam, "");
      };
    } else {
      // RegExp route was passed. This is super-simple.
      self.parse = function(url) {
        var matches = url.match(re);
        return matches && {captures: matches.slice(1)};
      };
      // There's no meaningful way to stringify based on a RegExp route, so
      // return empty string.
      self.stringify = function() { return ""; };
    }
    return self;
  };

}(typeof exports === "object" && exports || this));
