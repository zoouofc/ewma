/**
 * Cache busting utilities
 * @file cacheBuster
 * @namespace util.cacheBuster
 * @author Mitchell Sawatzky
 */

const hashes = require(`${__rootname}/hashes.json`);

function generateURL (path) {
    if (!(path in hashes)) {
        console.error(`Path hash never calculated for ${path}`);
        return `/static/_00000/${path}`;
    }
    return `/static/_${hashes[path]}/${path}`;
}

module.exports = {
    generateURL: generateURL
};
