"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var cross_spawn_1 = require("cross-spawn");
var config_1 = require("./util/config");
var logger_1 = require("./logger/logger");
function babili(context, configFile) {
    configFile = config_1.getUserConfigFile(context, exports.taskInfo, configFile);
    var logger = new logger_1.Logger('babili - experimental');
    return babiliWorker(context, configFile).then(function () {
        logger.finish();
    })
        .catch(function (err) {
        return logger.fail(err);
    });
}
exports.babili = babili;
function babiliWorker(context, configFile) {
    var babiliConfig = config_1.fillConfigDefaults(configFile, exports.taskInfo.defaultConfigFile);
    // TODO - figure out source maps??
    return runBabili(context);
}
exports.babiliWorker = babiliWorker;
function runBabili(context) {
    // TODO - is there a better way to run this?
    return new Promise(function (resolve, reject) {
        if (!context.nodeModulesDir) {
            return reject(new Error('Babili failed because the context passed did not have a rootDir'));
        }
        var babiliPath = path_1.join(context.nodeModulesDir, '.bin', 'babili');
        var command = cross_spawn_1.spawn(babiliPath, [context.buildDir, '--out-dir', context.buildDir]);
        command.on('close', function (code) {
            if (code !== 0) {
                return reject(new Error('Babili failed with a non-zero status code'));
            }
            return resolve();
        });
    });
}
exports.runBabili = runBabili;
exports.taskInfo = {
    fullArg: '--babili',
    shortArg: null,
    envVar: 'IONIC_USE_EXPERIMENTAL_BABILI',
    packageConfig: 'ionic_use_experimental_babili',
    defaultConfigFile: 'babili.config'
};
