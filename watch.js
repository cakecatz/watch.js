#!/usr/bin/env node
var hashFiles = require('hash-files');
var child_process = require('child_process');
var argv = require('minimist')(process.argv.slice(2));
var crypto = require('crypto');
var path = require('path');
var execshell = require('exec-sh')

if(argv._.length === 0) {
  console.error('Usage: watch <command> <directory> [--interval=<milliseconds>]')
  process.exit()
}

var command = argv._[0]
var dir = null;
if (argv._.length > 1) {
  dir = path.join(process.cwd(), argv._[1]);
} else {
  dir = process.cwd();
}

var interval = Number(argv.interval || argv.i || 500);

var previous_hash = null;
var p = setInterval(function() {
  getHash(dir, function(hash) {
    if (previous_hash !== null && previous_hash !== hash) {
      execshell(command);
    }
    previous_hash = hash;
  });
}, interval);

function getHash(dir, callback) {
  var md5sum = crypto.createHash('md5');
  var commandArgs = ['-t', '-r', dir];
  var fileList = [];
  child_process.execFile('md5deep', commandArgs, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }

    fileList = stdout.split("\n").sort(function(a, b) {
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
}
