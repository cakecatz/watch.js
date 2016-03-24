import minimist from 'minimist';
import crypto from 'crypto';
import path from 'path';
import execshell from 'exec-sh';
import childProcess from 'child_process';

const argv = minimist(process.argv.slice(2));

if (argv._.length === 0) {
  console.error('Usage: watch.js <command> <directory> [--interval=<milliseconds>]');
  process.exit();
}

const command = argv._[0];
let dir = null;
if (argv._.length > 1) {
  dir = path.join(process.cwd(), argv._[1]);
} else {
  dir = process.cwd();
}

const interval = Number(argv.interval || argv.i || 500);

const getHash = (_dir, callback) => {
  const md5sum = crypto.createHash('md5');
  const commandArgs = ['-t', '-r', _dir];
  let fileList = [];
  childProcess.execFile('md5deep', commandArgs, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
    }

    if (stderr) {
      console.log(stderr);
    }

    fileList = stdout.split('\n').sort((a, b) => {
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

let previousHash = null;
const p = setInterval(() => {
  getHash(dir, (hash) => {
    if (previousHash !== null && previousHash !== hash) {
      execshell(command);
    }
    previousHash = hash;
  });
}, interval);
