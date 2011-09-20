// Options (TODO: read from .json file)
var opts = {
  "files": {
    "ba-routematcher.min.js": {
      src: ["ba-routematcher.js"],
      prelint: true,
      postlint: false,
      debug: false,
      "meta": {
        "label": "JavaScript Route Matcher",
        "version": "0.1pre",
        "homeurl": "http://benalman.com/",
        "license": ["MIT", "GPL"],
        "copyright": "Copyright (c) 2011 \"Cowboy\" Ben Alman"
      }
    }
  },
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
};

// Dependencies
var fs = require('fs');
var jshint = require('jshint').JSHINT;
var colors = require('colors');
var uglifyjs = require('uglify-js');
var Buffer = require('buffer').Buffer;
var zlib = require('zlib');
var dateFormat = require('dateformat');

// Now.
var now = new Date;

// Logging stuff.
function header(msg) { writeln(msg.underline); }
function write(msg) { process.stdout.write(msg || ''); }
function writeln(msg) { console.log(msg || ''); }
function ok(msg) { writeln(msg ? '>> '.green + msg : 'OK'.green); }
function error(msg) { writeln(msg ? '>> '.red + msg : 'ERROR'.red); }

// Ghetto fabulous template system for replacing values in strings. If {{.foo}}
// or {{.bar[0].baz}} is encountered (leading . or ( or [ char), attempt to
// access properties of data object like `data.foo` or `data.bar[0].baz`.
// Alternately, if {{foo}} or {{bar("baz")}} is encountered (no leading dot),
// simply evaluate `foo` or `bar("baz")`. If an error occurs, return empty
// string. Oh yeah, you have to pass the result of ghettoTmpl to eval. :)
// https://gist.github.com/1020250
var ghettoTmpl = function(data, str) {
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
  // if ( opts.nowrite ) {
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
};

// Lint some source code.
function lint(src) {
  write('Validating with JSHint...');
  if (jshint(src, opts.jshint)) {
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
    ast = pro.ast_mangle(ast, opts.uglify.mangle || {});
    ast = pro.ast_squeeze(ast, opts.uglify.squeeze || {});
    src = pro.gen_code(ast, opts.uglify.codegen || {});
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
// TASKS
// ============================================================================

desc('Perform "lint" and "minify" tasks.');
task({default: ['lint', 'min']}, function() {/*nothing*/});

desc('Validate with JSHint.');
task('lint', function() {
  header('Validating with JSHint');
  Object.keys(opts.files).forEach(function(min) {
    var o = opts.files[min];
    var concat = o.src.map(function(path) {
      var src = readFile(path);
      opts.jshint.devel = opts.jshint.debug = o.debug;
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
  Object.keys(opts.files).forEach(function(minpath) {
    var o = opts.files[minpath];
    var concat = o.src.map(function(path) {
      return readFile(path);
    }).join('\n');

    var banner = eval(ghettoTmpl(o.meta, typeof opts.banner == 'string' ? opts.banner : ''));
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
