"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = require("./util/constants");
var helpers_1 = require("./util/helpers");
var babili_1 = require("./babili");
var cleancss_1 = require("./cleancss");
var closure_1 = require("./closure");
var logger_1 = require("./logger/logger");
var uglifyjs_1 = require("./uglifyjs");
function minify(context) {
    var logger = new logger_1.Logger('minify');
    return minifyWorker(context)
        .then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(err);
    });
}
exports.minify = minify;
function minifyWorker(context) {
    // both css and js minify can run at the same time
    return Promise.all([
        minifyJs(context),
        minifyCss(context)
    ]);
}
function minifyJs(context) {
    return closure_1.isClosureSupported(context).then(function (result) {
        if (result) {
            return closure_1.closure(context);
        }
        if (helpers_1.getBooleanPropertyValue(Constants.ENV_USE_EXPERIMENTAL_BABILI)) {
            return babili_1.babili(context);
        }
        return runUglify(context);
    });
}
exports.minifyJs = minifyJs;
function runUglify(context) {
    // uglify cannot handle ES2015, so convert it to ES5 before minifying (if needed)
    return uglifyjs_1.uglifyjs(context);
}
function minifyCss(context) {
    return cleancss_1.cleancss(context);
}
exports.minifyCss = minifyCss;
