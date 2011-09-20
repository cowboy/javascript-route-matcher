/*!
 * Cowboy's Jakefile- v0.1pre - 9/20/2011
 * http://benalman.com/
 * 
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// ============================================================================
// DEPENDENCIES
// ============================================================================

var fs = require('fs');
var jshint = require('jshint').JSHINT;
var colors = require('colors');
var uglifyjs = require('uglify-js');
var Buffer = require('buffer').Buffer;
var zlib = require('zlib');
var dateFormat = require('dateformat');

// ============================================================================
// HELPERS
// ============================================================================

// Logging stuff.
function header(msg) { writeln(msg.underline); }
function write(msg) { process.stdout.write(msg || ''); }
function writeln(msg) { console.log(msg || ''); }
function ok(msg) { writeln(msg ? '>> '.green + msg : 'OK'.green); }
function error(msg) { writeln(msg ? '>> '.red + msg : 'ERROR'.red); }

// Optionally-recursive merge. Note: not smart enough to ignore non-plain
// objects! Works pretty much like jQuery.extend(), except that any explicitly
// set, null/undefined property value will have its property deleted outright.
function merge() {
  var args = Array.prototype.slice.call(arguments);
  var deep = typeof args[0] == 'boolean' && args.shift();
  var result = args.shift();
  args.forEach(function(obj) {
    obj != null && Object.keys(obj).forEach(function(key) {
      var val = obj[key];
      var empty;
      if (val == null) {
        delete result[key];
      } else if (deep && typeof val == 'object') {
        empty = val instanceof Array ? [] : {};
        result[key] = merge(true, typeof result[key] == 'object' ? result[key] : empty, val);
      } else {
        result[key] = val;
      }
    });
  })
  return result;
}

// Ghetto fabulous template system for replacing values in strings. If {{.foo}}
// or {{.bar[0].baz}} is encountered (leading . or ( or [ char), attempt to
// access properties of data object like `data.foo` or `data.bar[0].baz`.
// Alternately, if {{foo}} or {{bar("baz")}} is encountered (no leading dot),
// simply evaluate `foo` or `bar("baz")`. If an error occurs, return empty
// string. Oh yeah, you have to pass the result of ghettoTmpl to eval. :)
// https://gist.github.com/1020250
function ghettoTmpl(data, str) {
  if ( typeof data === "string" ) {
    str = data;
    data = {};
  }
  GHETTO_TMPL_DATA = data;
  GHETTO_TMPL_STR = str;
  return "["
    + "GHETTO_TMPL_STR.replace(/\\{\\{(([.[(])?.*?)\\}\\}/g, function(_, str, dot) {"
    + "return eval('try{' + (dot ? 'GHETTO_TMPL_DATA' : '') + str + '}catch(e){\"\"}');"
    + "})"
    + ",GHETTO_TMPL_DATA = GHETTO_TMPL_STR = null][0]";
}

// Read a file.
function readFile(filepath) {
  var src;
  write('Reading ' + filepath + '...');
  try {
    src = fs.readFileSync(filepath, 'UTF-8');
    ok();
    return src;
  } catch(e) {
    error();
    fail(e.message);
  }
}

// Write a file.
function writeFile(filepath, contents) {
  // if ( config.nowrite ) {
  //   writeln('Not'.underline + ' writing ' + filepath + ' (dry run).');
  //   return true;
  // }
  write('Writing ' + filepath + '...');
  try {
    fs.writeFileSync(filepath, contents, 'UTF-8');
    ok();
    return true;
  } catch(e) {
    error();
    fail(e);
  }
}

// Read and parse a JSON file.
function readJson(filepath, silent) {
  var result;
  silent || write('Reading ' + filepath + '...');
  try {
    result = JSON.parse(fs.readFileSync(filepath, 'UTF-8'));
    silent || ok();
    return result;
  } catch(e) {
    silent || error();
    fail(e.message);
  }
}


// Lint some source code.
function lint(src) {
  write('Validating with JSHint...');
  if (jshint(src, config.jshint)) {
    ok();
  } else {
    error();
    jshint.errors.forEach(function(e) {
      if ( !e ) { return; }
      var str = e.evidence ? e.evidence.inverse + ' <- ' : '';
      error('[L' + e.line + ':C' + e.character + '] ' + str + e.reason);
    });
    fail('JSHint found errors.');
  }
}

// Minify with UglifyJS.
// From https://github.com/mishoo/UglifyJS
function uglify(src) {
  write('Minifying with UglifyJS...')
  var jsp = uglifyjs.parser;
  var pro = uglifyjs.uglify;
  var ast;

  try {
    ast = jsp.parse(src);
    ast = pro.ast_mangle(ast, config.uglify.mangle || {});
    ast = pro.ast_squeeze(ast, config.uglify.squeeze || {});
    src = pro.gen_code(ast, config.uglify.codegen || {});
    ok();
    return src;
  } catch(e) {
    error();
    error('[L' + e.line + ':C' + e.col + '] ' + e.message + ' (position: ' + e.pos + ')');
    fail(e.message);
  }
}

// Return deflated src input.
function gzip(src) {
  return zlib.deflate(new Buffer(src));
}

// ============================================================================
// CONFIG
// ============================================================================

// Now.
var now = new Date;

// Get options, defaults merged with build.json file.
var config = merge(true, {
  "files": {}, // Override with build.json
  "banner": "// {{.label}} - v{{.version}} - {{dateFormat(now, 'm/d/yyyy')}}\n"
    + "// {{.homeurl}}\n"
    + "// {{.copyright}}; Licensed {{.license.join(', ')}}",
  "jshint": {
    "curly": true,
    "eqnull": true,
    "immed": true,
    "newcap": true,
    "noarg": true,
    "undef": true,
    "browser": true,
    "predef": ["jQuery"]
  },
  "uglify": {
    "mangle": {"except": ["$"]},
    "squeeze": {},
    "codegen": {}
  }
}, readJson('build.json', true));

// ============================================================================
// TASKS
// ============================================================================

desc('Perform "lint" and "minify" tasks.');
task({default: ['lint', 'min']}, function() {/*nothing*/});

desc('Validate with JSHint.');
task('lint', function() {
  header('Validating with JSHint');
  Object.keys(config.files).forEach(function(min) {
    var o = config.files[min];
    var concat = o.src.map(function(path) {
      var src = readFile(path);
      config.jshint.devel = config.jshint.debug = o.debug;
      if (o.prelint) {
        lint(src);
      }
      return src;
    }).join('\n');

    if (o.src.length > 1) {
      write('Concatenating ' + o.src.length + ' scripts...');
      ok();
      if (o.postlint) {
        lint(concat);
      }
    }
  });
});

desc('Minify with Uglify-js.');
task('min', function() {
  header('Minifying with Uglify-js');
  Object.keys(config.files).forEach(function(minpath) {
    var o = config.files[minpath];
    var concat = o.src.map(function(path) {
      return readFile(path);
    }).join('\n');

    var banner = eval(ghettoTmpl(o.meta, typeof config.banner == 'string' ? config.banner : ''));
    if (banner) { banner += '\n'; }

    if (o.src.length > 1) {
      write('Concatenating ' + o.src.length + ' scripts...');
      ok();
    }

    var gzipSize;
    var min = uglify(concat);
    if (min !== false) {
      min = banner + min;
      gzipSize = gzip(min).length + '';
      if (writeFile(minpath, min)) {
        ok('Compressed size: ' + gzipSize.yellow + ' bytes gzipped (' + (min.length + '').yellow + ' bytes minified).');
      }
    }
  });
});
