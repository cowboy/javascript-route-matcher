/*!
 * JavaScript Basic Route Matcher - v0.1pre - 9/15/2011
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function(global) {
  // Characters to be escaped with \.
  var reEscape = /[-[\]{}()+?.,\\^$|#\s]/g;
  // Match :xxx or *xxx param placeholders.
  var reParam = /([:*])(\w+)/g;

  global.getRoute = function(route, url) {
    // Param names, in order
    var names = [];
    // The route parsing function to be returned (or invoked if a url was
    // passed).
    var fn;

    if (typeof route === "string") {
      // Build route RegExp from passed string, replacing any :param or *splat
      // with an appropriate capture group.
      route = route.replace(reEscape, "\\$&");
      route = route.replace(reParam, function(_, mode, name) {
        names.push(name);
        // :param captures until the next /, while *splat captures until the
        // next :param, *splat, or EOL.
        return mode === ":" ? "([^/]*)" : "(.*)";
      });

      // Add ^/$ anchors and escape as-necessary. RegExp borrowed from the
      // Backbone.js router.
      route = new RegExp("^" + route + "$");

      fn = function(url) {
        var i = 0;
        var params = {};
        var matches = url.match(route);
        // If no matches, return null.
        if (!matches) { return null; }
        // Add all :params / * wildcards values into the params object.
        while(i < names.length) {
          params[names[i++]] = matches[i];
        }
        return params;
      };
    } else {
      // RegExp route was passed. This is super-simple.
      fn = function(url) {
        return url.match(route);
      };
    }
    // If a url was passed, return params or matches, otherwise return the
    // route-matching function.
    return url == null ? fn : fn(url);  };

}(this.exports || this));
