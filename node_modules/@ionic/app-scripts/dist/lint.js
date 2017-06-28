"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var lint_utils_1 = require("./lint/lint-utils");
var lint_factory_1 = require("./lint/lint-factory");
var config_1 = require("./util/config");
var Constants = require("./util/constants");
var errors_1 = require("./util/errors");
var helpers_1 = require("./util/helpers");
var path_1 = require("path");
var logger_1 = require("./logger/logger");
var worker_client_1 = require("./worker-client");
function lint(context, configFile) {
    var logger = new logger_1.Logger('lint');
    return worker_client_1.runWorker('lint', 'lintWorker', context, configFile)
        .then(function () {
        logger.finish();
    })
        .catch(function (err) {
        if (helpers_1.getBooleanPropertyValue(Constants.ENV_BAIL_ON_LINT_ERROR)) {
            throw logger.fail(new errors_1.BuildError(err));
        }
        logger.finish();
    });
}
exports.lint = lint;
function lintWorker(context, configFile) {
    return getLintConfig(context, configFile).then(function (configFile) {
        // there's a valid tslint config, let's continue
        return lintApp(context, configFile);
    });
}
exports.lintWorker = lintWorker;
function lintUpdate(changedFiles, context) {
    var changedTypescriptFiles = changedFiles.filter(function (changedFile) { return changedFile.ext === '.ts'; });
    return new Promise(function (resolve) {
        // throw this in a promise for async fun, but don't let it hang anything up
        var workerConfig = {
            configFile: config_1.getUserConfigFile(context, taskInfo, null),
            filePaths: changedTypescriptFiles.map(function (changedTypescriptFile) { return changedTypescriptFile.filePath; })
        };
        worker_client_1.runWorker('lint', 'lintUpdateWorker', context, workerConfig);
        resolve();
    });
}
exports.lintUpdate = lintUpdate;
function lintUpdateWorker(context, workerConfig) {
    return getLintConfig(context, workerConfig.configFile).then(function (configFile) {
        // there's a valid tslint config, let's continue (but be quiet about it!)
        var program = lint_factory_1.createProgram(configFile, context.srcDir);
        return lintFiles(context, program, workerConfig.filePaths);
    }).catch(function () {
    });
}
exports.lintUpdateWorker = lintUpdateWorker;
function lintApp(context, configFile) {
    var program = lint_factory_1.createProgram(configFile, context.srcDir);
    var files = lint_factory_1.getFileNames(program);
    return lintFiles(context, program, files);
}
function lintFiles(context, program, filePaths) {
    return Promise.resolve().then(function () {
        var promises = [];
        for (var _i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
            var filePath = filePaths_1[_i];
            promises.push(lint_utils_1.lintFile(context, program, filePath));
        }
        return Promise.all(promises);
    }).then(function (lintResults) {
        return lint_utils_1.processLintResults(context, lintResults);
    });
}
exports.lintFiles = lintFiles;
function getLintConfig(context, configFile) {
    return new Promise(function (resolve, reject) {
        configFile = config_1.getUserConfigFile(context, taskInfo, configFile);
        if (!configFile) {
            configFile = path_1.join(context.rootDir, 'tslint.json');
        }
        logger_1.Logger.debug("tslint config: " + configFile);
        fs_1.access(configFile, function (err) {
            if (err) {
                // if the tslint.json file cannot be found that's fine, the
                // dev may not want to run tslint at all and to do that they
                // just don't have the file
                reject(err);
                return;
            }
            resolve(configFile);
        });
    });
}
var taskInfo = {
    fullArg: '--tslint',
    shortArg: '-i',
    envVar: 'ionic_tslint',
    packageConfig: 'IONIC_TSLINT',
    defaultConfigFile: '../tslint'
};
;
