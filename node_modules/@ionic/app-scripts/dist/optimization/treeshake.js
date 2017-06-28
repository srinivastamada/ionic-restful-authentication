"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var logger_1 = require("../logger/logger");
var Constants = require("../util/constants");
var helpers_1 = require("../util/helpers");
var typescript_utils_1 = require("../util/typescript-utils");
var typescript_1 = require("typescript");
function calculateUnusedComponents(dependencyMap) {
    return calculateUnusedComponentsImpl(dependencyMap, getIonicModuleFilePath());
}
exports.calculateUnusedComponents = calculateUnusedComponents;
function calculateUnusedComponentsImpl(dependencyMap, importee) {
    var filteredMap = filterMap(dependencyMap);
    processImportTree(filteredMap, importee);
    calculateUnusedIonicProviders(filteredMap);
    return generateResults(filteredMap);
}
exports.calculateUnusedComponentsImpl = calculateUnusedComponentsImpl;
function generateResults(dependencyMap) {
    var toPurgeMap = new Map();
    var updatedMap = new Map();
    dependencyMap.forEach(function (importeeSet, modulePath) {
        if ((importeeSet && importeeSet.size > 0) || requiredModule(modulePath)) {
            logger_1.Logger.debug("[treeshake] generateResults: " + modulePath + " is not purged");
            updatedMap.set(modulePath, importeeSet);
        }
        else {
            logger_1.Logger.debug("[treeshake] generateResults: " + modulePath + " is purged");
            toPurgeMap.set(modulePath, importeeSet);
        }
    });
    return {
        updatedDependencyMap: updatedMap,
        purgedModules: toPurgeMap
    };
}
function requiredModule(modulePath) {
    var mainJsFile = helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_APP_ENTRY_POINT), '.js');
    var mainTsFile = helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_APP_ENTRY_POINT), '.ts');
    var appModule = helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_APP_NG_MODULE_PATH), '.js');
    var appModuleNgFactory = getAppModuleNgFactoryPath();
    var moduleFile = getIonicModuleFilePath();
    var menuTypes = path_1.join(path_1.dirname(helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT)), 'components', 'menu', 'menu-types.js');
    return modulePath === mainJsFile
        || modulePath === mainTsFile
        || modulePath === appModule
        || modulePath === appModuleNgFactory
        || modulePath === moduleFile
        || modulePath === menuTypes;
}
function filterMap(dependencyMap) {
    var filteredMap = new Map();
    dependencyMap.forEach(function (importeeSet, modulePath) {
        if (isIonicComponentOrAppSource(modulePath) || modulePath === getIonicModuleFilePath()) {
            importeeSet.delete(helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT));
            filteredMap.set(modulePath, importeeSet);
        }
    });
    return filteredMap;
}
function processImportTree(dependencyMap, importee) {
    var importees = [];
    dependencyMap.forEach(function (importeeSet, modulePath) {
        if (importeeSet && importeeSet.has(importee)) {
            importeeSet.delete(importee);
            // if it importer by an `ngfactory` file, we probably aren't going to be able to purge it
            var ngFactoryImportee = false;
            var importeeList = Array.from(importeeSet);
            for (var _i = 0, importeeList_1 = importeeList; _i < importeeList_1.length; _i++) {
                var entry = importeeList_1[_i];
                if (isNgFactory(entry)) {
                    ngFactoryImportee = true;
                    break;
                }
            }
            if (!ngFactoryImportee) {
                importees.push(modulePath);
            }
        }
    });
    importees.forEach(function (importee) { return processImportTree(dependencyMap, importee); });
}
function calculateUnusedIonicProviders(dependencyMap) {
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: beginning to purge providers");
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to purge action sheet controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_CONTROLLER_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to purge alert controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ALERT_CONTROLLER_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to loading controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_LOADING_CONTROLLER_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to modal controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_MODAL_CONTROLLER_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to picker controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_PICKER_CONTROLLER_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to popover controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_CONTROLLER_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to toast controller");
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_TOAST_CONTROLLER_PATH));
    // check if the controllers were deleted, if so, purge the component too
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to action sheet component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_COMPONENT_FACTORY_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to alert component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_ALERT_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ALERT_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_ALERT_COMPONENT_FACTORY_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to loading component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_LOADING_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_LOADING_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_LOADING_COMPONENT_FACTORY_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to modal component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_MODAL_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_MODAL_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_MODAL_COMPONENT_FACTORY_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to picker component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_PICKER_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_PICKER_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_PICKER_COMPONENT_FACTORY_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to popover component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_COMPONENT_FACTORY_PATH));
    logger_1.Logger.debug("[treeshake] calculateUnusedIonicProviders: attempting to toast component");
    processIonicOverlayComponents(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_TOAST_VIEW_CONTROLLER_PATH), helpers_1.getStringPropertyValue(Constants.ENV_TOAST_COMPONENT_PATH), helpers_1.getStringPropertyValue(Constants.ENV_TOAST_COMPONENT_FACTORY_PATH));
    // in this case, it's actually an entry component, not a provider
    processIonicProviders(dependencyMap, helpers_1.getStringPropertyValue(Constants.ENV_SELECT_POPOVER_COMPONENT_FACTORY_PATH));
}
function processIonicOverlayComponents(dependencyMap, viewControllerPath, componentPath, componentFactoryPath) {
    var viewControllerImportees = dependencyMap.get(viewControllerPath);
    var componentImportees = dependencyMap.get(componentPath);
    if (viewControllerImportees && viewControllerImportees.size === 0 && componentImportees && componentImportees.size === 1 && componentImportees.has(componentFactoryPath)) {
        var componentFactoryImportees = dependencyMap.get(componentFactoryPath);
        var onlyNgModuleFactoryImportees = onlyNgModuleFactories(componentFactoryImportees);
        if (onlyNgModuleFactoryImportees) {
            // sweet, we can remove this bad boy
            dependencyMap.set(componentFactoryPath, new Set());
            componentImportees.delete(componentFactoryPath);
        }
    }
}
function getAppModuleNgFactoryPath() {
    var appNgModulePath = helpers_1.getStringPropertyValue(Constants.ENV_APP_NG_MODULE_PATH);
    var jsVersion = helpers_1.changeExtension(appNgModulePath, '.js');
    return helpers_1.convertFilePathToNgFactoryPath(jsVersion);
}
exports.getAppModuleNgFactoryPath = getAppModuleNgFactoryPath;
function processIonicProviders(dependencyMap, providerPath) {
    var importeeSet = dependencyMap.get(providerPath);
    var appModuleNgFactoryPath = getAppModuleNgFactoryPath();
    // we can only purge providers that are only referenced in .module.ngfactory.js files
    var onlyNgModuleFactoryImportees = onlyNgModuleFactories(importeeSet);
    if (onlyNgModuleFactoryImportees && importeeSet && importeeSet.has(appModuleNgFactoryPath)) {
        logger_1.Logger.debug("[treeshake] processIonicProviders: Purging " + providerPath);
        importeeSet.delete(appModuleNgFactoryPath);
        // loop over the dependency map and remove this provider from importee sets
        processImportTreeForProviders(dependencyMap, providerPath);
    }
}
function onlyNgModuleFactories(importeeSet) {
    var moduleNgFactoryTs = helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX), '.ngfactory.ts');
    var moduleNgFactoryJs = helpers_1.changeExtension(helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX), '.ngfactory.js');
    var onlyNgModuleFactories = true;
    if (importeeSet) {
        importeeSet.forEach(function (importee) {
            if (onlyNgModuleFactories && !(importee.endsWith(moduleNgFactoryTs) || importee.endsWith(moduleNgFactoryJs))) {
                onlyNgModuleFactories = false;
            }
        });
    }
    return onlyNgModuleFactories;
}
function processImportTreeForProviders(dependencyMap, importee) {
    var importees = [];
    dependencyMap.forEach(function (importeeSet, modulePath) {
        if (importeeSet.has(importee)) {
            importeeSet.delete(importee);
            importees.push(modulePath);
        }
    });
    importees.forEach(function (importee) { return processImportTreeForProviders(dependencyMap, importee); });
}
function isIonicComponentOrAppSource(modulePath) {
    // for now, just use a simple filter of if a file is in ionic-angular/components
    var ionicAngularComponentDir = path_1.join(helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_DIR), 'components');
    var srcDir = helpers_1.getStringPropertyValue(Constants.ENV_VAR_SRC_DIR);
    return modulePath.indexOf(ionicAngularComponentDir) >= 0 || modulePath.indexOf(srcDir) >= 0;
}
exports.isIonicComponentOrAppSource = isIonicComponentOrAppSource;
function isNgFactory(modulePath) {
    return modulePath.indexOf('.ngfactory.') >= 0;
}
exports.isNgFactory = isNgFactory;
function purgeUnusedExportsFromIndexFile(filePath, fileContent, modulePathsToPurge) {
    logger_1.Logger.debug("[treeshake] purgeUnusedExportsFromIndexFile: Starting to purge exports ... ");
    for (var _i = 0, modulePathsToPurge_1 = modulePathsToPurge; _i < modulePathsToPurge_1.length; _i++) {
        var modulePath = modulePathsToPurge_1[_i];
        // I cannot get the './' prefix to show up when using path api
        logger_1.Logger.debug("[treeshake] purgeUnusedExportsFromIndexFile: Removing " + modulePath + " from " + filePath);
        var extensionless = helpers_1.changeExtension(modulePath, '');
        var relativeImportPath = './' + path_1.relative(path_1.dirname(filePath), extensionless);
        var importPath = helpers_1.toUnixPath(relativeImportPath);
        var exportRegex = generateExportRegex(importPath);
        logger_1.Logger.debug("[treeshake] purgeUnusedExportsFromIndexFile: Removing exports with path " + importPath);
        var results = null;
        while ((results = exportRegex.exec(fileContent)) && results.length) {
            fileContent = fileContent.replace(exportRegex, "/*" + results[0] + "*/");
        }
    }
    logger_1.Logger.debug("[treeshake] purgeUnusedImportsFromIndex: Starting to purge exports ... DONE");
    return fileContent;
}
exports.purgeUnusedExportsFromIndexFile = purgeUnusedExportsFromIndexFile;
function purgeUnusedImportsAndExportsFromModuleFile(moduleFilePath, moduleFileContent, modulePathsToPurge) {
    logger_1.Logger.debug("[treeshake] purgeUnusedImportsAndExportsFromModuleFile: Starting to purge import/exports ... ");
    for (var _i = 0, modulePathsToPurge_2 = modulePathsToPurge; _i < modulePathsToPurge_2.length; _i++) {
        var modulePath = modulePathsToPurge_2[_i];
        // I cannot get the './' prefix to show up when using path api
        logger_1.Logger.debug("[treeshake] purgeUnusedImportsAndExportsFromModuleFile: Removing " + modulePath + " from " + moduleFilePath);
        var extensionless = helpers_1.changeExtension(modulePath, '');
        var relativeImportPath = './' + path_1.relative(path_1.dirname(moduleFilePath), extensionless);
        var importPath = helpers_1.toUnixPath(relativeImportPath);
        logger_1.Logger.debug("[treeshake] purgeUnusedImportsAndExportsFromModuleFile: Removing imports with path " + importPath);
        var importRegex = generateImportRegex(importPath);
        // replace the import if it's found
        var results = null;
        while ((results = importRegex.exec(moduleFileContent)) && results.length) {
            moduleFileContent = moduleFileContent.replace(importRegex, "/*" + results[0] + "*/");
        }
        results = null;
        var exportRegex = generateExportRegex(importPath);
        logger_1.Logger.debug("[treeshake] purgeUnusedImportsAndExportsFromModuleFile: Removing exports with path " + importPath);
        while ((results = exportRegex.exec(moduleFileContent)) && results.length) {
            moduleFileContent = moduleFileContent.replace(exportRegex, "/*" + results[0] + "*/");
        }
    }
    logger_1.Logger.debug("[treeshake] purgeUnusedImportsAndExportsFromModuleFile: Starting to purge import/exports ... DONE");
    return moduleFileContent;
}
exports.purgeUnusedImportsAndExportsFromModuleFile = purgeUnusedImportsAndExportsFromModuleFile;
function generateImportRegex(relativeImportPath) {
    var cleansedString = helpers_1.escapeStringForRegex(relativeImportPath);
    return new RegExp("^import.*?{(.+)}.*?from.*?['\"`]" + cleansedString + "['\"`];", 'gm');
}
function generateExportRegex(relativeExportPath) {
    var cleansedString = helpers_1.escapeStringForRegex(relativeExportPath);
    return new RegExp("^export.*?{(.+)}.*?from.*?'" + cleansedString + "';", 'gm');
}
function purgeComponentNgFactoryImportAndUsage(appModuleNgFactoryPath, appModuleNgFactoryContent, componentFactoryPath) {
    logger_1.Logger.debug("[treeshake] purgeComponentNgFactoryImportAndUsage: Starting to purge component ngFactory import/export ...");
    var extensionlessComponentFactoryPath = helpers_1.changeExtension(componentFactoryPath, '');
    var relativeImportPath = path_1.relative(path_1.dirname(appModuleNgFactoryPath), extensionlessComponentFactoryPath);
    var importPath = helpers_1.toUnixPath(relativeImportPath);
    logger_1.Logger.debug("[treeshake] purgeComponentNgFactoryImportAndUsage: Purging imports from " + importPath);
    var importRegex = generateWildCardImportRegex(importPath);
    var results = importRegex.exec(appModuleNgFactoryContent);
    if (results && results.length >= 2) {
        appModuleNgFactoryContent = appModuleNgFactoryContent.replace(importRegex, "/*" + results[0] + "*/");
        var namedImport = results[1].trim();
        logger_1.Logger.debug("[treeshake] purgeComponentNgFactoryImportAndUsage: Purging code using named import " + namedImport);
        var purgeFromConstructor = generateRemoveComponentFromConstructorRegex(namedImport);
        var purgeFromConstructorResults = purgeFromConstructor.exec(appModuleNgFactoryContent);
        if (purgeFromConstructorResults && purgeFromConstructorResults.length) {
            appModuleNgFactoryContent = appModuleNgFactoryContent.replace(purgeFromConstructor, "/*" + purgeFromConstructorResults[0] + "*/");
        }
    }
    logger_1.Logger.debug("[treeshake] purgeComponentNgFactoryImportAndUsage: Starting to purge component ngFactory import/export ... DONE");
    return appModuleNgFactoryContent;
}
exports.purgeComponentNgFactoryImportAndUsage = purgeComponentNgFactoryImportAndUsage;
function purgeProviderControllerImportAndUsage(moduleNgFactoryPath, moduleNgFactoryContent, providerPath) {
    logger_1.Logger.debug("[treeshake] purgeProviderControllerImportAndUsage: Starting to purge provider controller and usage ...");
    var extensionlessComponentFactoryPath = helpers_1.changeExtension(providerPath, '');
    var relativeImportPath = path_1.relative(path_1.dirname(helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_DIR)), extensionlessComponentFactoryPath);
    var importPath = helpers_1.toUnixPath(relativeImportPath);
    logger_1.Logger.debug("[treeshake] purgeProviderControllerImportAndUsage: Looking for imports from " + importPath);
    var importRegex = generateWildCardImportRegex(importPath);
    var results = importRegex.exec(moduleNgFactoryContent);
    if (results && results.length >= 2) {
        var namedImport = results[1].trim();
        // purge the getter
        var purgeIfRegEx = generateRemoveIfStatementRegex(namedImport);
        var purgeIfResults = purgeIfRegEx.exec(moduleNgFactoryContent);
        if (purgeIfResults) {
            // okay, sweet, find out what is actually returned from this bad boy
            var getNameOfReturnedPropertyRegex = /return this\.(.*?);/g;
            var returnValueResults = getNameOfReturnedPropertyRegex.exec(purgeIfResults[0]);
            if (returnValueResults && returnValueResults.length >= 2) {
                var propertyNameOfProvider = returnValueResults[1];
                var getterRegex = generateRemoveGetterFromImportRegex(namedImport, propertyNameOfProvider);
                var getterRegexResults = getterRegex.exec(moduleNgFactoryContent);
                if (getterRegexResults) {
                    moduleNgFactoryContent = moduleNgFactoryContent.replace(importRegex, "/*" + results[0] + "*/");
                    logger_1.Logger.debug("[treeshake] purgeProviderControllerImportAndUsage: Purging getter logic using " + namedImport);
                    var getterContentToReplace = getterRegexResults[0];
                    var newGetterContent = "/*" + getterContentToReplace + "*/";
                    moduleNgFactoryContent = moduleNgFactoryContent.replace(getterContentToReplace, newGetterContent);
                    logger_1.Logger.debug("[treeshake] purgeProviderControllerImportAndUsage: Purging factory logic using " + namedImport);
                    var purgeIfContentToReplace = purgeIfResults[0];
                    var newPurgeIfContent = "/*" + purgeIfContentToReplace + "*/";
                    moduleNgFactoryContent = moduleNgFactoryContent.replace(purgeIfContentToReplace, newPurgeIfContent);
                }
            }
        }
    }
    logger_1.Logger.debug("[treeshake] purgeProviderControllerImportAndUsage: Starting to purge provider controller and usage ... DONE");
    return moduleNgFactoryContent;
}
exports.purgeProviderControllerImportAndUsage = purgeProviderControllerImportAndUsage;
function purgeProviderClassNameFromIonicModuleForRoot(moduleFileContent, providerClassName) {
    logger_1.Logger.debug("[treeshake] purgeProviderClassNameFromIonicModuleForRoot: Purging reference in the ionicModule forRoot method ...");
    var regex = generateIonicModulePurgeProviderRegex(providerClassName);
    var results = regex.exec(moduleFileContent);
    if (results && results.length) {
        moduleFileContent = moduleFileContent.replace(regex, "/*" + results[0] + "*/");
    }
    logger_1.Logger.debug("[treeshake] purgeProviderClassNameFromIonicModuleForRoot: Purging reference in the ionicModule forRoot method ... DONE");
    return moduleFileContent;
}
exports.purgeProviderClassNameFromIonicModuleForRoot = purgeProviderClassNameFromIonicModuleForRoot;
function generateWildCardImportRegex(relativeImportPath) {
    var cleansedString = helpers_1.escapeStringForRegex(relativeImportPath);
    return new RegExp("import.*?as(.*?)from '" + cleansedString + "';");
}
exports.generateWildCardImportRegex = generateWildCardImportRegex;
function generateRemoveComponentFromConstructorRegex(namedImport) {
    return new RegExp(namedImport + "..*?,");
}
exports.generateRemoveComponentFromConstructorRegex = generateRemoveComponentFromConstructorRegex;
function generateRemoveGetterFromImportRegex(namedImport, propertyName) {
    var regexString = "(Object.defineProperty.*?\"" + propertyName + "\".*?{[\\s\\S]*?" + namedImport + "[\\s\\S]*?}[\\s\\S]*?}[\\s\\S]*?}\\);)";
    return new RegExp(regexString);
}
exports.generateRemoveGetterFromImportRegex = generateRemoveGetterFromImportRegex;
function generateRemoveIfStatementRegex(namedImport) {
    return new RegExp("if \\(\\(token === " + namedImport + ".([\\S]*?)\\)\\) {([\\S\\s]*?)}", "gm");
}
exports.generateRemoveIfStatementRegex = generateRemoveIfStatementRegex;
function generateIonicModulePurgeProviderRegex(className) {
    return new RegExp(className + ",", "gm");
}
exports.generateIonicModulePurgeProviderRegex = generateIonicModulePurgeProviderRegex;
function getIonicModuleFilePath() {
    var entryPoint = helpers_1.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_ENTRY_POINT);
    return path_1.join(path_1.dirname(entryPoint), 'module.js');
}
exports.getIonicModuleFilePath = getIonicModuleFilePath;
// okay, so real talk
// the ng4 compiler changed how some of this stuff works.
// basically, due to imports not-really-being-used in AoT mode WRT pages/providers,
// we don't have a good way of detecting whether a provider is actually used in an app
// since they're in the ng-module ng-factories regardless if they're used or not. If that sounds
// confusing and weird - it's because it is.
// the simple answer is this method analyzes a developers srcDir for TS files
// and if they import a provider, we are manually inserting those files into the "dependency map"
// so that we have an accurate representation of what's user providers
function checkIfProviderIsUsedInSrc(context, dependencyMap) {
    var srcFiles = context.fileCache.getAll().filter(function (file) { return path_1.extname(file.path) === '.ts'
        && file.path.startsWith(context.srcDir)
        && !file.path.endsWith('.d.ts')
        && !file.path.endsWith('.ngfactory.ts')
        && !file.path.endsWith(helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX)); });
    srcFiles.forEach(function (srcFile) {
        var sourceFile = typescript_utils_1.getTypescriptSourceFile(srcFile.path, srcFile.content);
        var imports = typescript_utils_1.findNodes(sourceFile, sourceFile, typescript_1.SyntaxKind.ImportDeclaration);
        imports.forEach(function (importStatement) {
            if (importStatement.moduleSpecifier.text === 'ionic-angular'
                && importStatement.importClause.namedBindings
                && importStatement.importClause.namedBindings.elements) {
                importStatement.importClause.namedBindings.elements.forEach(function (importSpecifier) {
                    if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_CONTROLLER_CLASSNAME)) {
                        var actionSheetControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(actionSheetControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(actionSheetControllerPath, importeeSet);
                    }
                    else if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_ALERT_CONTROLLER_CLASSNAME)) {
                        var alertControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_ALERT_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(alertControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(alertControllerPath, importeeSet);
                    }
                    else if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_LOADING_CONTROLLER_CLASSNAME)) {
                        var loadingControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_LOADING_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(loadingControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(loadingControllerPath, importeeSet);
                    }
                    else if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_MODAL_CONTROLLER_CLASSNAME)) {
                        var modalControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_MODAL_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(modalControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(modalControllerPath, importeeSet);
                    }
                    else if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_PICKER_CONTROLLER_CLASSNAME)) {
                        var pickerControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_PICKER_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(pickerControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(pickerControllerPath, importeeSet);
                    }
                    else if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_CONTROLLER_CLASSNAME)) {
                        var popoverControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(popoverControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(popoverControllerPath, importeeSet);
                    }
                    else if (importSpecifier.name.text === helpers_1.getStringPropertyValue(Constants.ENV_TOAST_CONTROLLER_CLASSNAME)) {
                        var toastControllerPath = helpers_1.getStringPropertyValue(Constants.ENV_TOAST_CONTROLLER_PATH);
                        var importeeSet = dependencyMap.get(toastControllerPath);
                        importeeSet.add(srcFile.path);
                        dependencyMap.set(toastControllerPath, importeeSet);
                    }
                });
            }
        });
    });
    return dependencyMap;
}
exports.checkIfProviderIsUsedInSrc = checkIfProviderIsUsedInSrc;
