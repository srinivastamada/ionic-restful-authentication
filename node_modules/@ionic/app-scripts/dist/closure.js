"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var cross_spawn_1 = require("cross-spawn");
var Constants = require("./util/constants");
var helpers_1 = require("./util/helpers");
var config_1 = require("./util/config");
var logger_1 = require("./logger/logger");
var worker_client_1 = require("./worker-client");
function closure(context, configFile) {
    configFile = config_1.getUserConfigFile(context, taskInfo, configFile);
    var logger = new logger_1.Logger('closure');
    return worker_client_1.runWorker('closure', 'closureWorker', context, configFile)
        .then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(err);
    });
}
exports.closure = closure;
function closureWorker(context, configFile) {
    context = config_1.generateContext(context);
    var tempFileName = helpers_1.generateRandomHexString(10) + '.js';
    var tempFilePath = path_1.join(context.buildDir, tempFileName);
    var closureConfig = getClosureConfig(context, configFile);
    var bundleFilePath = path_1.join(context.buildDir, process.env[Constants.ENV_OUTPUT_JS_FILE_NAME]);
    return runClosure(closureConfig, bundleFilePath, tempFilePath, context.buildDir, closureConfig.debug)
        .then(function () {
        var promises = [];
        promises.push(helpers_1.copyFileAsync(tempFilePath, bundleFilePath));
        promises.push(helpers_1.copyFileAsync(tempFilePath + '.map', bundleFilePath + '.map'));
        return Promise.all(promises);
    }).then(function () {
        // delete the temp bundle either way
        var promises = [];
        promises.push(helpers_1.unlinkAsync(tempFilePath));
        promises.push(helpers_1.unlinkAsync(tempFilePath + '.map'));
        return Promise.all(promises);
    }).catch(function (err) {
        // delete the temp bundle either way
        helpers_1.unlinkAsync(tempFilePath);
        helpers_1.unlinkAsync(tempFilePath + '.map');
        throw err;
    });
}
exports.closureWorker = closureWorker;
function checkIfJavaIsAvailable(closureConfig) {
    return new Promise(function (resolve, reject) {
        var command = cross_spawn_1.spawn("" + closureConfig.pathToJavaExecutable, ['-version']);
        command.stdout.on('data', function (buffer) {
            logger_1.Logger.debug("[Closure]: " + buffer.toString());
        });
        command.stderr.on('data', function (buffer) {
            logger_1.Logger.warn("[Closure]: " + buffer.toString());
        });
        command.on('close', function (code) {
            if (code === 0) {
                return resolve();
            }
            reject();
        });
    });
}
function runClosure(closureConfig, nonMinifiedBundlePath, minifiedBundleFileName, outputDir, isDebug) {
    return new Promise(function (resolve, reject) {
        var closureArgs = ['-jar', "" + closureConfig.pathToClosureJar,
            '--js', "" + nonMinifiedBundlePath,
            '--js_output_file', "" + minifiedBundleFileName,
            "--language_out=" + closureConfig.languageOut,
            '--language_in', "" + closureConfig.languageIn,
            '--compilation_level', "" + closureConfig.optimization,
            "--create_source_map=%outname%.map",
            "--variable_renaming_report=" + outputDir + "/variable_renaming_report",
            "--property_renaming_report=" + outputDir + "/property_renaming_report",
            "--rewrite_polyfills=false",
        ];
        if (isDebug) {
            closureArgs.push('--debug');
        }
        var closureCommand = cross_spawn_1.spawn("" + closureConfig.pathToJavaExecutable, closureArgs);
        closureCommand.stdout.on('data', function (buffer) {
            logger_1.Logger.debug("[Closure] " + buffer.toString());
        });
        closureCommand.stderr.on('data', function (buffer) {
            logger_1.Logger.debug("[Closure] " + buffer.toString());
        });
        closureCommand.on('close', function (code) {
            if (code === 0) {
                return resolve();
            }
            reject(new Error('Closure failed with a non-zero status code'));
        });
    });
}
function isClosureSupported(context) {
    if (!helpers_1.getBooleanPropertyValue(Constants.ENV_USE_EXPERIMENTAL_CLOSURE)) {
        return Promise.resolve(false);
    }
    logger_1.Logger.debug('[Closure] isClosureSupported: Checking if Closure Compiler is available');
    var config = getClosureConfig(context);
    return checkIfJavaIsAvailable(config).then(function () {
        return Promise.resolve(true);
    }).catch(function () {
        logger_1.Logger.warn("Closure Compiler support is enabled but Java cannot be started. Try running the build again with the \"--debug\" argument for more information.");
        return Promise.resolve(false);
    });
}
exports.isClosureSupported = isClosureSupported;
function getClosureConfig(context, configFile) {
    configFile = config_1.getUserConfigFile(context, taskInfo, configFile);
    return config_1.fillConfigDefaults(configFile, taskInfo.defaultConfigFile);
}
var taskInfo = {
    fullArg: '--closure',
    shortArg: '-l',
    envVar: 'IONIC_CLOSURE',
    packageConfig: 'ionic_closure',
    defaultConfigFile: 'closure.config'
};
