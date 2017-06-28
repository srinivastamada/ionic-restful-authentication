"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var MagicString = require("magic-string");
var logger_1 = require("./logger/logger");
var config_1 = require("./util/config");
var Constants = require("./util/constants");
var errors_1 = require("./util/errors");
var helpers_1 = require("./util/helpers");
var webpack_1 = require("./webpack");
var decorators_1 = require("./optimization/decorators");
var treeshake_1 = require("./optimization/treeshake");
function optimization(context, configFile) {
    var logger = new logger_1.Logger("optimization");
    return optimizationWorker(context, configFile).then(function () {
        logger.finish();
    })
        .catch(function (err) {
        var error = new errors_1.BuildError(err.message);
        error.isFatal = true;
        throw logger.fail(error);
    });
}
exports.optimization = optimization;
function optimizationWorker(context, configFile) {
    var webpackConfig = getConfig(context, configFile);
    var dependencyMap = null;
    if (optimizationEnabled()) {
        return webpack_1.runWebpackFullBuild(webpackConfig).then(function (stats) {
            dependencyMap = helpers_1.webpackStatsToDependencyMap(context, stats);
            if (helpers_1.getBooleanPropertyValue(Constants.ENV_PRINT_ORIGINAL_DEPENDENCY_TREE)) {
                logger_1.Logger.debug('Original Dependency Map Start');
                helpers_1.printDependencyMap(dependencyMap);
                logger_1.Logger.debug('Original Dependency Map End');
            }
            purgeGeneratedFiles(context, webpackConfig.output.filename);
        }).then(function () {
            return doOptimizations(context, dependencyMap);
        });
    }
    else {
        return Promise.resolve();
    }
}
function purgeGeneratedFiles(context, fileNameSuffix) {
    var buildFiles = context.fileCache.getAll().filter(function (file) { return file.path.indexOf(context.buildDir) >= 0 && file.path.indexOf(fileNameSuffix) >= 0; });
    buildFiles.forEach(function (buildFile) { return context.fileCache.remove(buildFile.path); });
}
exports.purgeGeneratedFiles = purgeGeneratedFiles;
function doOptimizations(context, dependencyMap) {
    // remove decorators
    var modifiedMap = new Map(dependencyMap);
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_PURGE_DECORATORS)) {
        removeDecorators(context);
    }
    // remove unused component imports
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_MANUAL_TREESHAKING)) {
        // TODO remove this in a couple versions
        // only run manual tree shaking if the module file is found
        // since there is a breaking change here
        var ionicModulePath = treeshake_1.getIonicModuleFilePath();
        if (context.fileCache.get(ionicModulePath)) {
            // due to how the angular compiler works in angular 4, we need to check if
            modifiedMap = treeshake_1.checkIfProviderIsUsedInSrc(context, modifiedMap);
            var results = treeshake_1.calculateUnusedComponents(modifiedMap);
            purgeUnusedImports(context, results.purgedModules);
        }
    }
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_PRINT_MODIFIED_DEPENDENCY_TREE)) {
        logger_1.Logger.debug('Modified Dependency Map Start');
        helpers_1.printDependencyMap(modifiedMap);
        logger_1.Logger.debug('Modified Dependency Map End');
    }
    return modifiedMap;
}
exports.doOptimizations = doOptimizations;
function optimizationEnabled() {
    var purgeDecorators = helpers_1.getBooleanPropertyValue(Constants.ENV_PURGE_DECORATORS);
    var manualTreeshaking = helpers_1.getBooleanPropertyValue(Constants.ENV_MANUAL_TREESHAKING);
    return purgeDecorators || manualTreeshaking;
}
function removeDecorators(context) {
    var jsFiles = context.fileCache.getAll().filter(function (file) { return path_1.extname(file.path) === '.js'; });
    jsFiles.forEach(function (jsFile) {
        var magicString = new MagicString(jsFile.content);
        magicString = decorators_1.purgeStaticFieldDecorators(jsFile.path, jsFile.content, magicString);
        magicString = decorators_1.purgeStaticCtorFields(jsFile.path, jsFile.content, magicString);
        magicString = decorators_1.purgeTranspiledDecorators(jsFile.path, jsFile.content, magicString);
        magicString = decorators_1.addPureAnnotation(jsFile.path, jsFile.content, magicString);
        jsFile.content = magicString.toString();
        var sourceMap = magicString.generateMap({
            source: path_1.basename(jsFile.path),
            file: path_1.basename(jsFile.path),
            includeContent: true
        });
        var sourceMapPath = jsFile.path + '.map';
        context.fileCache.set(sourceMapPath, { path: sourceMapPath, content: sourceMap.toString() });
    });
}
function purgeUnusedImports(context, purgeDependencyMap) {
    // for now, restrict this to components in the ionic-angular/index.js file
    var indexFilePath = helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT);
    var moduleFilePath = treeshake_1.getIonicModuleFilePath();
    var file = context.fileCache.get(indexFilePath);
    if (!file) {
        throw new Error("Could not find ionic-angular index file " + indexFilePath);
    }
    var moduleFile = context.fileCache.get(moduleFilePath);
    if (!moduleFile) {
        throw new Error("Could not find ionic-angular module file " + moduleFilePath);
    }
    var modulesToPurge = [];
    purgeDependencyMap.forEach(function (set, moduleToPurge) {
        modulesToPurge.push(moduleToPurge);
    });
    var updatedFileContent = treeshake_1.purgeUnusedImportsAndExportsFromModuleFile(moduleFilePath, moduleFile.content, modulesToPurge);
    context.fileCache.set(moduleFilePath, { path: moduleFilePath, content: updatedFileContent });
    var updatedIndexContent = treeshake_1.purgeUnusedExportsFromIndexFile(file.path, file.content, modulesToPurge);
    context.fileCache.set(file.path, { path: file.path, content: updatedIndexContent });
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ALERT_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ALERT_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_LOADING_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_LOADING_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_MODAL_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_MODAL_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_PICKER_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_PICKER_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedProvider(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_TOAST_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_TOAST_CONTROLLER_CLASSNAME));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ALERT_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ALERT_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_LOADING_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_LOADING_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_MODAL_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_MODAL_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_PICKER_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_PICKER_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_TOAST_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_TOAST_COMPONENT_FACTORY_PATH));
    attemptToPurgeUnusedEntryComponents(context, purgeDependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_SELECT_POPOVER_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_SELECT_POPOVER_COMPONENT_FACTORY_PATH));
}
function attemptToPurgeUnusedProvider(context, dependencyMap, providerPath, providerClassName) {
    if (dependencyMap.has(providerPath)) {
        var ngModuleFactoryFiles = context.fileCache.getAll().filter(function (file) { return file.path.endsWith(helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX), '.ngfactory.js')); });
        ngModuleFactoryFiles.forEach(function (ngModuleFactoryFile) {
            var newContent = treeshake_1.purgeProviderControllerImportAndUsage(ngModuleFactoryFile.path, ngModuleFactoryFile.content, providerPath);
            context.fileCache.set(ngModuleFactoryFile.path, { path: ngModuleFactoryFile.path, content: newContent });
        });
        var moduleFilePath = treeshake_1.getIonicModuleFilePath();
        var ionicModuleFile = context.fileCache.get(moduleFilePath);
        var newModuleFileContent = treeshake_1.purgeProviderClassNameFromIonicModuleForRoot(ionicModuleFile.content, providerClassName);
        // purge the component from the module file
        context.fileCache.set(moduleFilePath, { path: moduleFilePath, content: newModuleFileContent });
    }
}
function attemptToPurgeUnusedEntryComponents(context, dependencyMap, entryComponentPath, entryComponentFactoryPath) {
    if (dependencyMap.has(entryComponentPath)) {
        var ngModuleFactoryFiles = context.fileCache.getAll().filter(function (file) { return file.path.endsWith(helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX), '.ngfactory.js')); });
        ngModuleFactoryFiles.forEach(function (ngModuleFactoryFile) {
            var updatedContent = treeshake_1.purgeComponentNgFactoryImportAndUsage(ngModuleFactoryFile.path, ngModuleFactoryFile.content, entryComponentFactoryPath);
            context.fileCache.set(ngModuleFactoryFile.path, { path: ngModuleFactoryFile.path, content: updatedContent });
        });
    }
}
function getConfig(context, configFile) {
    configFile = config_1.getUserConfigFile(context, taskInfo, configFile);
    var webpackConfig = config_1.fillConfigDefaults(configFile, taskInfo.defaultConfigFile);
    webpackConfig.entry = config_1.replacePathVars(context, webpackConfig.entry);
    webpackConfig.output.path = config_1.replacePathVars(context, webpackConfig.output.path);
    return webpackConfig;
}
exports.getConfig = getConfig;
var taskInfo = {
    fullArg: '--optimization',
    shortArg: '-dt',
    envVar: 'IONIC_DEPENDENCY_TREE',
    packageConfig: 'ionic_dependency_tree',
    defaultConfigFile: 'optimization.config'
};
