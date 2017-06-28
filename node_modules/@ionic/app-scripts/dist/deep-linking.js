"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger/logger");
var Constants = require("./util/constants");
var errors_1 = require("./util/errors");
var helpers_1 = require("./util/helpers");
var interfaces_1 = require("./util/interfaces");
var util_1 = require("./deep-linking/util");
/*
 * We want to cache a local, in-memory copy of the App's main NgModule file content.
 * Each time we do a build, a new DeepLinkConfig is generated and inserted into the
 * app's main NgModule. By keeping a copy of the original and using it to determine
 * if the developer had an existing config, we will get an accurate answer where
 * as the cached version of the App's main NgModule content will basically always
 * have a generated deep likn config in it.
*/
exports.cachedUnmodifiedAppNgModuleFileContent = null;
exports.cachedDeepLinkString = null;
function deepLinking(context) {
    var logger = new logger_1.Logger("deeplinks");
    return deepLinkingWorker(context).then(function (deepLinkConfigEntries) {
        helpers_1.setParsedDeepLinkConfig(deepLinkConfigEntries);
        logger.finish();
    })
        .catch(function (err) {
        var error = new errors_1.BuildError(err.message);
        error.isFatal = true;
        throw logger.fail(error);
    });
}
exports.deepLinking = deepLinking;
function deepLinkingWorker(context) {
    return deepLinkingWorkerImpl(context, []);
}
function deepLinkingWorkerImpl(context, changedFiles) {
    return Promise.resolve().then(function () {
        var appNgModulePath = helpers_1.getStringPropertyValue(Constants.ENV_APP_NG_MODULE_PATH);
        var appNgModuleFile = context.fileCache.get(appNgModulePath);
        if (!appNgModuleFile) {
            throw new Error("The main app NgModule was not found at the following path: " + appNgModulePath);
        }
        if (!exports.cachedUnmodifiedAppNgModuleFileContent || hasAppModuleChanged(changedFiles, appNgModulePath)) {
            exports.cachedUnmodifiedAppNgModuleFileContent = appNgModuleFile.content;
        }
        // is there is an existing (legacy) deep link config, just move on and don't look for decorators
        var hasExisting = util_1.hasExistingDeepLinkConfig(appNgModulePath, exports.cachedUnmodifiedAppNgModuleFileContent);
        if (hasExisting) {
            return [];
        }
        var deepLinkConfigEntries = util_1.getDeepLinkData(appNgModulePath, context.fileCache, context.runAot) || [];
        if (deepLinkConfigEntries.length) {
            var newDeepLinkString = util_1.convertDeepLinkConfigEntriesToString(deepLinkConfigEntries);
            // 1. this is the first time running this, so update the build either way
            // 2. we have an existing deep link string, and we have a new one, and they're different - so go ahead and update the config
            // 3. the app's main ngmodule has changed, so we need to rewrite the config
            if (!exports.cachedDeepLinkString || newDeepLinkString !== exports.cachedDeepLinkString || hasAppModuleChanged(changedFiles, appNgModulePath)) {
                exports.cachedDeepLinkString = newDeepLinkString;
                util_1.updateAppNgModuleAndFactoryWithDeepLinkConfig(context, newDeepLinkString, changedFiles, context.runAot);
            }
        }
        return deepLinkConfigEntries;
    });
}
exports.deepLinkingWorkerImpl = deepLinkingWorkerImpl;
function hasAppModuleChanged(changedFiles, appNgModulePath) {
    if (!changedFiles) {
        changedFiles = [];
    }
    for (var _i = 0, changedFiles_1 = changedFiles; _i < changedFiles_1.length; _i++) {
        var changedFile = changedFiles_1[_i];
        if (changedFile.filePath === appNgModulePath) {
            return true;
        }
    }
    return false;
}
exports.hasAppModuleChanged = hasAppModuleChanged;
function deepLinkingUpdate(changedFiles, context) {
    if (context.deepLinkState === interfaces_1.BuildState.RequiresBuild) {
        return deepLinkingWorkerFullUpdate(context);
    }
    else {
        return deepLinkingUpdateImpl(changedFiles, context);
    }
}
exports.deepLinkingUpdate = deepLinkingUpdate;
function deepLinkingUpdateImpl(changedFiles, context) {
    var tsFiles = changedFiles.filter(function (changedFile) { return changedFile.ext === '.ts'; });
    if (tsFiles.length === 0) {
        return Promise.resolve();
    }
    var logger = new logger_1.Logger('deeplinks update');
    return deepLinkingWorkerImpl(context, changedFiles).then(function (deepLinkConfigEntries) {
        helpers_1.setParsedDeepLinkConfig(deepLinkConfigEntries);
        logger.finish();
    }).catch(function (err) {
        logger_1.Logger.warn(err.message);
        var error = new errors_1.BuildError(err.message);
        throw logger.fail(error);
    });
}
exports.deepLinkingUpdateImpl = deepLinkingUpdateImpl;
function deepLinkingWorkerFullUpdate(context) {
    var logger = new logger_1.Logger("deeplinks update");
    // when a full build is required (when a template fails to update, etc), remove the cached deep link string to force a new one
    // to be inserted
    exports.cachedDeepLinkString = null;
    return deepLinkingWorker(context).then(function (deepLinkConfigEntries) {
        helpers_1.setParsedDeepLinkConfig(deepLinkConfigEntries);
        logger.finish();
    })
        .catch(function (err) {
        logger_1.Logger.warn(err.message);
        var error = new errors_1.BuildError(err.message);
        throw logger.fail(error);
    });
}
exports.deepLinkingWorkerFullUpdate = deepLinkingWorkerFullUpdate;
// these functions are  purely for testing
function reset() {
    exports.cachedUnmodifiedAppNgModuleFileContent = null;
    exports.cachedDeepLinkString = null;
}
exports.reset = reset;
function setCachedDeepLinkString(input) {
    exports.cachedDeepLinkString = input;
}
exports.setCachedDeepLinkString = setCachedDeepLinkString;
