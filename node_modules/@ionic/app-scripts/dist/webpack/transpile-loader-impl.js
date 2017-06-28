"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var logger_1 = require("../logger/logger");
var transpile_1 = require("../transpile");
var Constants = require("../util/constants");
var helpers_1 = require("../util/helpers");
function transpileLoader(source, map, webpackContex) {
    var callback = webpackContex.async();
    webpackContex.cacheable();
    try {
        var context = helpers_1.getContext();
        var absolutePath = path_1.resolve(path_1.normalize(webpackContex.resourcePath));
        logger_1.Logger.debug("[Webpack] transpileLoader: processing the following file: " + absolutePath);
        // we only really care about transpiling stuff that is not ionic-angular, angular, rxjs, or the users app
        // so third party deps that may be es2015 or something
        if (!helpers_1.isSrcOrIonicOrIonicDeps(absolutePath) && context.isProd && helpers_1.getBooleanPropertyValue(Constants.ENV_BUILD_TO_ES5)) {
            var transpiledOutput = transpile_1.transpileTsString(context, absolutePath, source);
            var sourceMapObject = JSON.parse(transpiledOutput.sourceMapText);
            return callback(null, transpiledOutput.outputText, sourceMapObject);
        }
        return callback(null, source, map);
    }
    catch (ex) {
        callback(ex);
    }
}
exports.transpileLoader = transpileLoader;
