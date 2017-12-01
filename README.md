# ENGG Week Movie Archive
The following repository defines the ENGG Week Movie Archive (EWMA) web application.

## Structure
The static directory contains resources that should not change very often. When requested, they will not be modified unlike cgi scripts. Files in static/css are written in the SASS language, and are transpiled into CSS via the build script (See building). Files in static/js are written in the JS language, and are free to use ES6 features since they
are transpiled to ES5 via the build script.

## Building
```bash
npm run build
```
Will build and install everything according to conf.json. After it has been built once, further updates can be
propogated with
```bash
npm run install
```
