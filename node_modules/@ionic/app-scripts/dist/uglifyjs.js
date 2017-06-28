"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uglify = require("uglify-js");
var logger_1 = require("./logger/logger");
var config_1 = require("./util/config");
var errors_1 = require("./util/errors");
var helpers_1 = require("./util/helpers");
var worker_client_1 = require("./worker-client");
function uglifyjs(context, configFile) {
    configFile = config_1.getUserConfigFile(context, exports.taskInfo, configFile);
    var logger = new logger_1.Logger('uglifyjs');
    return worker_client_1.runWorker('uglifyjs', 'uglifyjsWorker', context, configFile)
        .then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(new errors_1.BuildError(err));
    });
}
exports.uglifyjs = uglifyjs;
function uglifyjsWorker(context, configFile) {
    var uglifyJsConfig = config_1.fillConfigDefaults(configFile, exports.taskInfo.defaultConfigFile);
    if (!context) {
        context = config_1.generateContext(context);
    }
    return uglifyjsWorkerImpl(context, uglifyJsConfig);
}
exports.uglifyjsWorker = uglifyjsWorker;
function uglifyjsWorkerImpl(context, uglifyJsConfig) {
    return Promise.resolve().then(function () {
        var jsFilePaths = context.bundledFilePaths.filter(function (bundledFilePath) { return bundledFilePath.endsWith('.js'); });
        var promises = [];
        jsFilePaths.forEach(function (bundleFilePath) {
            uglifyJsConfig.sourceFile = bundleFilePath;
            uglifyJsConfig.inSourceMap = bundleFilePath + '.map';
            uglifyJsConfig.destFileName = bundleFilePath;
            uglifyJsConfig.outSourceMap = bundleFilePath + '.map';
            var minifyOutput = runUglifyInternal(uglifyJsConfig);
            promises.push(helpers_1.writeFileAsync(uglifyJsConfig.destFileName, minifyOutput.code.toString()));
            if (minifyOutput.map) {
                promises.push(helpers_1.writeFileAsync(uglifyJsConfig.outSourceMap, minifyOutput.map.toString()));
            }
        });
        return Promise.all(promises);
    }).catch(function (err) {
        // uglify has it's own strange error format
        var errorString = err.message + " in " + err.filename + " at line " + err.line + ", col " + err.col + ", pos " + err.pos;
        throw new errors_1.BuildError(new Error(errorString));
    });
}
exports.uglifyjsWorkerImpl = uglifyjsWorkerImpl;
function runUglifyInternal(uglifyJsConfig) {
    return uglify.minify(uglifyJsConfig.sourceFile, {
        compress: uglifyJsConfig.compress,
        mangle: uglifyJsConfig.mangle,
        inSourceMap: uglifyJsConfig.inSourceMap,
        outSourceMap: uglifyJsConfig.outSourceMap
    });
}
exports.taskInfo = {
    fullArg: '--uglifyjs',
    shortArg: '-u',
    envVar: 'IONIC_UGLIFYJS',
    packageConfig: 'ionic_uglifyjs',
    defaultConfigFile: 'uglifyjs.config'
};
