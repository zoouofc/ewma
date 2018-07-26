/**
 * File for managing templates
 * @file template.js
 * @namespace template
 * @author Mitchell Sawatzky
 */

const fs = require('fs');
const ejs = require('ejs');
const cacheBuster = require(`${__rootname}/util/cacheBuster`);
const conf = require(`${__rootname}/conf.json`);

let cache = {};

function load (file, cb) {
    if (file in cache) {
        return cache[file];
    }
    fs.readFile(`templates/${file}`, (err, contents) => {
        if (err) {
            cb(err);
            return;
        }
        cache[file] = contents;
        cb(null, contents);
    });
}

function get (file, data, options, cb) {
    if (typeof data === 'function') {
        cb = data;
        data = null;
    }
    if (typeof options === 'function') {
        cb = options;
        options = null;
    }
    data = data || {};
    options = options || {};

    options.filename = `${__rootname}/templates/${file}`;
    data.cacheBuster = cacheBuster.generateURL;
    data.templateOptions = conf.templateOptions;

    load(file, (err, file) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, ejs.render(file.toString('utf-8'), data, options));
    });
}

module.exports = {
    load: load,
    get: get
};
