#!/usr/bin/env node
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _execSh = require('exec-sh');

var _execSh2 = _interopRequireDefault(_execSh);

var argv = (0, _minimist2['default'])(process.argv.slice(2));

if (argv._.length === 0) {
  console.error('Usage: watch.js <command> <directory> [--interval=<milliseconds>]');
  process.exit();
}

var command = argv._[0];
var dir = null;
if (argv._.length > 1) {
  dir = _path2['default'].join(process.cwd(), argv._[1]);
} else {
  dir = process.cwd();
}

var interval = Number(argv.interval || argv.i || 500);

var getHash = function getHash(_dir, callback) {
  var md5sum = _crypto2['default'].createHash('md5');
  var commandArgs = ['-t', '-r', _dir];
  var fileList = [];
  child_process.execFile('md5deep', commandArgs, function (err, stdout, stderr) {
    if (err) {
      console.log(err);
    }

    if (stderr) {
      console.log(stderr);
    }

    fileList = stdout.split('\n').sort(function (a, b) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }
      return 0;
    }).join();

    md5sum.update(fileList);
    callback(md5sum.digest('hex'));
  });
};

var previousHash = null;
var p = setInterval(function () {
  getHash(dir, function (hash) {
    if (previousHash !== null && previousHash !== hash) {
      (0, _execSh2['default'])(command);
    }
    previousHash = hash;
  });
}, interval);
