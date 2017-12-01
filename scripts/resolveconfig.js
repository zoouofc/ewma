#!/usr/bin/node
console.log(require(`${__dirname}/../conf.json`)[process.argv[2]]);
