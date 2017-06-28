"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var helpers_1 = require("../util/helpers");
var logger_1 = require("../logger/logger");
/* This loader is purely for caching stuff */
function optimizationLoader(source, map, webpackContex) {
    var context = helpers_1.getContext();
    var callback = webpackContex.async();
    var absolutePath = path_1.resolve(path_1.normalize(webpackContex.resourcePath));
    if (path_1.extname(absolutePath) === '.ts') {
        var jsFilePath = helpers_1.changeExtension(absolutePath, '.js');
        var jsFile = context.fileCache.get(jsFilePath);
        source = jsFile.content;
    }
    logger_1.Logger.debug("[Webpack] optimization: processing the following file: " + absolutePath);
    if (helpers_1.isSrcOrIonicOrIonicDeps(absolutePath)) {
        logger_1.Logger.debug("[Webpack] optimization: Caching the following file: " + absolutePath);
        context.fileCache.set(webpackContex.resourcePath, { path: webpackContex.resourcePath, content: source });
    }
    return callback(null, source, map);
}
exports.optimizationLoader = optimizationLoader;
