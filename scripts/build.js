#!/usr/bin/env node
const conf = require('../conf.json');
const fs = require('fs');
const child_process = require('child_process');
const Event = require('events').EventEmitter;
const babel = require('babel-core');
const sass = require('node-sass');
const microtime = require('microtime');

const start = microtime.now();

if (conf['build-require-sudo'] && process.getuid() !== 0) {
    console.error('Build has been configured to require root.');
    process.exit(1);
} else if (!conf['build-require-sudo'] && process.getuid() === 0) {
    console.error('Refusing to run as root');
    process.exit(1);
}

let BUILD_TYPE;
switch (process.argv[2]) {
    case 'all':
        BUILD_TYPE = 1;
        break;
    case 'install':
        BUILD_TYPE = 2;
        break;
    default:
        console.error(`invalid build type: ${process.argv[2]}`);
        process.exit(1);
        break;
}

let steps = [
    {
        name: `Purging destination: ${conf["build-destination"]}`,
        hook: (cb) => {
            let rm = child_process.spawn('rm', ['-rf', conf['build-destination']], {
                stdio: 'inherit'
            });

            rm.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: `Creating CGI structure: ${conf["build-destination"]}/cgi`,
        hook: (cb) => {
            let mk = child_process.spawn('mkdir', ['-p', `${conf['build-destination']}/cgi`], {
                stdio: 'inherit'
            });

            mk.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: 'Migrating CGI paths',
        install: true,
        hook: (cb) => {
            let cp = child_process.spawn('cp', ['-r', `${__dirname}/../cgi`, `${conf['build-destination']}`], {
                stdio: 'inherit'
            });

            cp.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: `Creating static structure: ${conf["build-destination"]}/static`,
        hook: (cb) => {
            let mk = child_process.spawn('mkdir', ['-p', `${conf['build-destination']}/static`], {
                stdio: 'inherit'
            });

            mk.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: `Creating static structure: ${conf["build-destination"]}/static/css`,
        hook: (cb) => {
            let mk = child_process.spawn('mkdir', ['-p', `${conf['build-destination']}/static/css`], {
                stdio: 'inherit'
            });

            mk.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: `Creating static structure: ${conf["build-destination"]}/static/js`,
        hook: (cb) => {
            let mk = child_process.spawn('mkdir', ['-p', `${conf['build-destination']}/static/js`], {
                stdio: 'inherit'
            });

            mk.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: 'Migrating images',
        install: true,
        hook: (cb) => {
            let cp = child_process.spawn('cp', ['-r', `${__dirname}/../static/images`, `${conf['build-destination']}/static/images`], {
                stdio: 'inherit'
            });

            cp.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    },
    {
        name: 'Transpiling JS (ES6 -> ES5)',
        install: true,
        hook: (cb) => {
            fs.readdir(`${__dirname}/../static/js`, (err, dir) => {
                if (err) {
                    cb(err);
                    return;
                }
                let transpilationCounter = 0;
                let error = false;
                for (let file of dir) {
                    transpilationCounter++;
                    babel.transformFile(`${__dirname}/../static/js/${file}`, {
                        presets: ['env']
                    }, (err, result) => {
                        if (!error) {
                            if (err) {
                                error = true;
                                cb(err);
                                return;
                            }
                            fs.writeFile(`${conf['build-destination']}/static/js/${file}`, result.code, (err) => {
                                if (!error) {
                                    if (err) {
                                        error = true;
                                        cb(err);
                                        return;
                                    }
                                    transpilationCounter--;
                                    console.log(`    [${transpilationCounter} ongoing] Transpiled and wrote js/${file}`);
                                    if (transpilationCounter === 0) {
                                        cb();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    {
        name: 'Transpiling CSS (SASS -> CSS3)',
        install: true,
        hook: (cb) => {
            fs.readdir(`${__dirname}/../static/css`, (err, dir) => {
                if (err) {
                    cb(err);
                    return;
                }
                let transpilationCounter = 0;
                let error = false;
                for (let file of dir) {
                    transpilationCounter++;
                    sass.render({
                        file: `${__dirname}/../static/css/${file}`,
                        includePaths: [`${__dirname}/../static/css`],
                        indentWidth: 4,
                        outputStyle: 'expanded'
                    }, (err, result) => {
                        if (!error) {
                            if (err) {
                                error = true;
                                cb(err);
                                return;
                            }

                            let reg = /^(.*)\..*?/.exec(file);
                            if (reg) {
                                file = `${reg[1]}.css`;
                            } else {
                                file += '.css';
                            }

                            fs.writeFile(`${conf['build-destination']}/static/css/${file}`, result.css, (err) => {
                                if (!error) {
                                    if (err) {
                                        error = true;
                                        cb(err);
                                        return;
                                    }
                                    transpilationCounter--;
                                    console.log(`    [${transpilationCounter} ongoing] Transpiled and wrote css/${file}`);
                                    if (transpilationCounter === 0) {
                                        cb();
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    },
    {
        name: 'Installing node deps',
        hook: (cb) => {
            let npm = child_process.spawn('cp', ['-r', 'node_modules', `${conf['build-destination']}/node_modules`], {
                stdio: 'inherit'
            });

            npm.on('exit', (code) => {
                if (code === 0) {
                    cb();
                } else {
                    cb(new Error(`Non-zero exit code: ${code}`));
                }
            });
        }
    }
]

let prog = new Event();
prog.on('n', function(step) {
    if (step === steps.length) {
        console.log('Build complete.');
        process.exit(0);
        return;
    }

    let skip = BUILD_TYPE === 2 && !steps[step].install;
    let extra = skip ? ' (skipping)' : ''

    console.log(`[${step + 1}/${steps.length}]\x1b[33m ${steps[step].name}\x1b[0m${extra}`);
    if (!skip) {
        steps[step].hook(function(err) {
            if (err) {
                console.error(`\x1b[31m[${step + 1}/${steps.length}] (${steps[step].name}) Encountered an error:\x1b[0m`);
                console.error(err.stack)
                process.exit(1);
                return;
            }
            prog.emit('n', ++step);
        });
    } else {
        prog.emit('n', ++step);
    }
});
prog.emit('n', 0);

process.on('exit', function() {
    let time = (microtime.now() - start) / 1000000;
    let suf = 's';

    if (time > 60) {
        time /= 60;
        suf = 'm';
    }

    time = time.toFixed(5);

    console.log(`\nElapsed time: ${time + suf}`);
});
