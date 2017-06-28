"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var typescript_1 = require("typescript");
var logger_1 = require("../logger/logger");
var Constants = require("../util/constants");
var helpers_1 = require("../util/helpers");
var typescript_utils_1 = require("../util/typescript-utils");
var transpile_1 = require("../transpile");
function getDeepLinkData(appNgModuleFilePath, fileCache, isAot) {
    // we only care about analyzing a subset of typescript files, so do that for efficiency
    var typescriptFiles = filterTypescriptFilesForDeepLinks(fileCache);
    var deepLinkConfigEntries = [];
    typescriptFiles.forEach(function (file) {
        var sourceFile = typescript_utils_1.getTypescriptSourceFile(file.path, file.content);
        var deepLinkDecoratorData = getDeepLinkDecoratorContentForSourceFile(sourceFile);
        if (deepLinkDecoratorData) {
            // sweet, the page has a DeepLinkDecorator, which means it meets the criteria to process that bad boy
            var pathInfo = getNgModuleDataFromPage(appNgModuleFilePath, file.path, deepLinkDecoratorData.className, fileCache, isAot);
            var deepLinkConfigEntry = Object.assign({}, deepLinkDecoratorData, pathInfo);
            deepLinkConfigEntries.push(deepLinkConfigEntry);
        }
    });
    return deepLinkConfigEntries;
}
exports.getDeepLinkData = getDeepLinkData;
function filterTypescriptFilesForDeepLinks(fileCache) {
    var deepLinksDir = helpers_1.getStringPropertyValue(Constants.ENV_VAR_DEEPLINKS_DIR);
    var moduleSuffix = helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX);
    return fileCache.getAll().filter(function (file) { return path_1.extname(file.path) === '.ts' && file.path.indexOf(moduleSuffix) === -1 && file.path.indexOf(deepLinksDir) >= 0; });
}
exports.filterTypescriptFilesForDeepLinks = filterTypescriptFilesForDeepLinks;
function getNgModulePathFromCorrespondingPage(filePath) {
    var newExtension = helpers_1.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX);
    return helpers_1.changeExtension(filePath, newExtension);
}
exports.getNgModulePathFromCorrespondingPage = getNgModulePathFromCorrespondingPage;
function getRelativePathToPageNgModuleFromAppNgModule(pathToAppNgModule, pathToPageNgModule) {
    return path_1.relative(path_1.dirname(pathToAppNgModule), pathToPageNgModule);
}
exports.getRelativePathToPageNgModuleFromAppNgModule = getRelativePathToPageNgModuleFromAppNgModule;
function getNgModuleDataFromPage(appNgModuleFilePath, filePath, className, fileCache, isAot) {
    var ngModulePath = getNgModulePathFromCorrespondingPage(filePath);
    var ngModuleFile = fileCache.get(ngModulePath);
    if (!ngModuleFile) {
        throw new Error(filePath + " has a @IonicPage decorator, but it does not have a corresponding \"NgModule\" at " + ngModulePath);
    }
    // get the class declaration out of NgModule class content
    var exportedClassName = typescript_utils_1.getNgModuleClassName(ngModuleFile.path, ngModuleFile.content);
    var relativePathToAppNgModule = getRelativePathToPageNgModuleFromAppNgModule(appNgModuleFilePath, ngModulePath);
    var absolutePath = isAot ? helpers_1.changeExtension(ngModulePath, '.ngfactory.ts') : ngModulePath;
    var userlandModulePath = isAot ? helpers_1.changeExtension(relativePathToAppNgModule, '.ngfactory') : helpers_1.changeExtension(relativePathToAppNgModule, '');
    var namedExport = isAot ? exportedClassName + "NgFactory" : exportedClassName;
    return {
        absolutePath: absolutePath,
        userlandModulePath: helpers_1.toUnixPath(userlandModulePath),
        className: namedExport
    };
}
exports.getNgModuleDataFromPage = getNgModuleDataFromPage;
function getDeepLinkDecoratorContentForSourceFile(sourceFile) {
    var classDeclarations = typescript_utils_1.getClassDeclarations(sourceFile);
    var defaultSegment = path_1.basename(helpers_1.changeExtension(sourceFile.fileName, ''));
    var list = [];
    classDeclarations.forEach(function (classDeclaration) {
        if (classDeclaration.decorators) {
            classDeclaration.decorators.forEach(function (decorator) {
                var className = classDeclaration.name.text;
                if (decorator.expression && decorator.expression.expression && decorator.expression.expression.text === DEEPLINK_DECORATOR_TEXT) {
                    var deepLinkArgs = decorator.expression.arguments;
                    var deepLinkObject = null;
                    if (deepLinkArgs && deepLinkArgs.length) {
                        deepLinkObject = deepLinkArgs[0];
                    }
                    var propertyList = [];
                    if (deepLinkObject && deepLinkObject.properties) {
                        propertyList = deepLinkObject.properties;
                    }
                    var deepLinkName = getStringValueFromDeepLinkDecorator(sourceFile, propertyList, className, DEEPLINK_DECORATOR_NAME_ATTRIBUTE);
                    var deepLinkSegment = getStringValueFromDeepLinkDecorator(sourceFile, propertyList, defaultSegment, DEEPLINK_DECORATOR_SEGMENT_ATTRIBUTE);
                    var deepLinkPriority = getStringValueFromDeepLinkDecorator(sourceFile, propertyList, 'low', DEEPLINK_DECORATOR_PRIORITY_ATTRIBUTE);
                    var deepLinkDefaultHistory = getArrayValueFromDeepLinkDecorator(sourceFile, propertyList, [], DEEPLINK_DECORATOR_DEFAULT_HISTORY_ATTRIBUTE);
                    var rawStringContent = typescript_utils_1.getNodeStringContent(sourceFile, decorator.expression);
                    list.push({
                        name: deepLinkName,
                        segment: deepLinkSegment,
                        priority: deepLinkPriority,
                        defaultHistory: deepLinkDefaultHistory,
                        rawString: rawStringContent,
                        className: className
                    });
                }
            });
        }
    });
    if (list.length > 1) {
        throw new Error('Only one @IonicPage decorator is allowed per file.');
    }
    if (list.length === 1) {
        return list[0];
    }
    return null;
}
exports.getDeepLinkDecoratorContentForSourceFile = getDeepLinkDecoratorContentForSourceFile;
function getStringValueFromDeepLinkDecorator(sourceFile, propertyNodeList, defaultValue, identifierToLookFor) {
    try {
        var valueToReturn_1 = defaultValue;
        logger_1.Logger.debug("[DeepLinking util] getNameValueFromDeepLinkDecorator: Setting default deep link " + identifierToLookFor + " to " + defaultValue);
        propertyNodeList.forEach(function (propertyNode) {
            if (propertyNode && propertyNode.name && propertyNode.name.text === identifierToLookFor) {
                var initializer = propertyNode.initializer;
                var stringContent = typescript_utils_1.getNodeStringContent(sourceFile, initializer);
                stringContent = helpers_1.replaceAll(stringContent, '\'', '');
                stringContent = helpers_1.replaceAll(stringContent, '`', '');
                stringContent = helpers_1.replaceAll(stringContent, '"', '');
                stringContent = stringContent.trim();
                valueToReturn_1 = stringContent;
            }
        });
        logger_1.Logger.debug("[DeepLinking util] getNameValueFromDeepLinkDecorator: DeepLink " + identifierToLookFor + " set to " + valueToReturn_1);
        return valueToReturn_1;
    }
    catch (ex) {
        logger_1.Logger.error("Failed to parse the @IonicPage decorator. The " + identifierToLookFor + " must be an array of strings");
        throw ex;
    }
}
function getArrayValueFromDeepLinkDecorator(sourceFile, propertyNodeList, defaultValue, identifierToLookFor) {
    try {
        var valueToReturn_2 = defaultValue;
        logger_1.Logger.debug("[DeepLinking util] getArrayValueFromDeepLinkDecorator: Setting default deep link " + identifierToLookFor + " to " + defaultValue);
        propertyNodeList.forEach(function (propertyNode) {
            if (propertyNode && propertyNode.name && propertyNode.name.text === identifierToLookFor) {
                var initializer = propertyNode.initializer;
                if (initializer && initializer.elements) {
                    var stringArray = initializer.elements.map(function (element) {
                        var elementText = element.text;
                        elementText = helpers_1.replaceAll(elementText, '\'', '');
                        elementText = helpers_1.replaceAll(elementText, '`', '');
                        elementText = helpers_1.replaceAll(elementText, '"', '');
                        elementText = elementText.trim();
                        return elementText;
                    });
                    valueToReturn_2 = stringArray;
                }
            }
        });
        logger_1.Logger.debug("[DeepLinking util] getNameValueFromDeepLinkDecorator: DeepLink " + identifierToLookFor + " set to " + valueToReturn_2);
        return valueToReturn_2;
    }
    catch (ex) {
        logger_1.Logger.error("Failed to parse the @IonicPage decorator. The " + identifierToLookFor + " must be an array of strings");
        throw ex;
    }
}
function hasExistingDeepLinkConfig(appNgModuleFilePath, appNgModuleFileContent) {
    var sourceFile = typescript_utils_1.getTypescriptSourceFile(appNgModuleFilePath, appNgModuleFileContent);
    var decorator = typescript_utils_1.getNgModuleDecorator(appNgModuleFilePath, sourceFile);
    var functionCall = getIonicModuleForRootCall(decorator);
    if (functionCall.arguments.length <= 2) {
        return false;
    }
    var deepLinkConfigArg = functionCall.arguments[2];
    return deepLinkConfigArg.kind === typescript_1.SyntaxKind.ObjectLiteralExpression;
}
exports.hasExistingDeepLinkConfig = hasExistingDeepLinkConfig;
function getIonicModuleForRootCall(decorator) {
    var argument = typescript_utils_1.getNgModuleObjectLiteralArg(decorator);
    var properties = argument.properties.filter(function (property) {
        return property.name.text === NG_MODULE_IMPORT_DECLARATION;
    });
    if (properties.length === 0) {
        throw new Error('Could not find "import" property in NgModule arguments');
    }
    if (properties.length > 1) {
        throw new Error('Found multiple "import" properties in NgModule arguments. Only one is allowed');
    }
    var property = properties[0];
    var importArrayLiteral = property.initializer;
    var functionsInImport = importArrayLiteral.elements.filter(function (element) {
        return element.kind === typescript_1.SyntaxKind.CallExpression;
    });
    var ionicModuleFunctionCalls = functionsInImport.filter(function (functionNode) {
        return (functionNode.expression
            && functionNode.expression.name
            && functionNode.expression.name.text === FOR_ROOT_METHOD
            && functionNode.expression.expression
            && functionNode.expression.expression.text === IONIC_MODULE_NAME);
    });
    if (ionicModuleFunctionCalls.length === 0) {
        throw new Error('Could not find IonicModule.forRoot call in "imports"');
    }
    if (ionicModuleFunctionCalls.length > 1) {
        throw new Error('Found multiple IonicModule.forRoot calls in "imports". Only one is allowed');
    }
    return ionicModuleFunctionCalls[0];
}
function convertDeepLinkConfigEntriesToString(entries) {
    var individualLinks = entries.map(function (entry) { return convertDeepLinkEntryToJsObjectString(entry); });
    var deepLinkConfigString = "\n{\n  links: [\n    " + individualLinks.join(',\n    ') + "\n  ]\n}";
    return deepLinkConfigString;
}
exports.convertDeepLinkConfigEntriesToString = convertDeepLinkConfigEntriesToString;
function convertDeepLinkEntryToJsObjectString(entry) {
    var defaultHistoryWithQuotes = entry.defaultHistory.map(function (defaultHistoryEntry) { return "'" + defaultHistoryEntry + "'"; });
    var segmentString = entry.segment && entry.segment.length ? "'" + entry.segment + "'" : null;
    return "{ loadChildren: '" + entry.userlandModulePath + LOAD_CHILDREN_SEPARATOR + entry.className + "', name: '" + entry.name + "', segment: " + segmentString + ", priority: '" + entry.priority + "', defaultHistory: [" + defaultHistoryWithQuotes.join(', ') + "] }";
}
exports.convertDeepLinkEntryToJsObjectString = convertDeepLinkEntryToJsObjectString;
function updateAppNgModuleAndFactoryWithDeepLinkConfig(context, deepLinkString, changedFiles, isAot) {
    var appNgModulePath = helpers_1.getStringPropertyValue(Constants.ENV_APP_NG_MODULE_PATH);
    var appNgModuleFile = context.fileCache.get(appNgModulePath);
    if (!appNgModuleFile) {
        throw new Error("App NgModule " + appNgModulePath + " not found in cache");
    }
    var updatedAppNgModuleContent = getUpdatedAppNgModuleContentWithDeepLinkConfig(appNgModulePath, appNgModuleFile.content, deepLinkString);
    context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: updatedAppNgModuleContent });
    var appNgModuleOutput = transpile_1.transpileTsString(context, appNgModulePath, updatedAppNgModuleContent);
    var appNgModuleSourceMapPath = helpers_1.changeExtension(appNgModulePath, '.js.map');
    var appNgModulePathJsFile = helpers_1.changeExtension(appNgModulePath, '.js');
    context.fileCache.set(appNgModuleSourceMapPath, { path: appNgModuleSourceMapPath, content: appNgModuleOutput.sourceMapText });
    context.fileCache.set(appNgModulePathJsFile, { path: appNgModulePathJsFile, content: appNgModuleOutput.outputText });
    if (changedFiles) {
        changedFiles.push({
            event: 'change',
            filePath: appNgModulePath,
            ext: path_1.extname(appNgModulePath).toLowerCase()
        });
    }
    if (isAot) {
        var appNgModuleFactoryPath = helpers_1.changeExtension(appNgModulePath, '.ngfactory.ts');
        var appNgModuleFactoryFile = context.fileCache.get(appNgModuleFactoryPath);
        if (!appNgModuleFactoryFile) {
            throw new Error("App NgModule Factory " + appNgModuleFactoryPath + " not found in cache");
        }
        var updatedAppNgModuleFactoryContent = getUpdatedAppNgModuleFactoryContentWithDeepLinksConfig(appNgModuleFactoryFile.content, deepLinkString);
        context.fileCache.set(appNgModuleFactoryPath, { path: appNgModuleFactoryPath, content: updatedAppNgModuleFactoryContent });
        var appNgModuleFactoryOutput = transpile_1.transpileTsString(context, appNgModuleFactoryPath, updatedAppNgModuleFactoryContent);
        var appNgModuleFactorySourceMapPath = helpers_1.changeExtension(appNgModuleFactoryPath, '.js.map');
        var appNgModuleFactoryPathJsFile = helpers_1.changeExtension(appNgModuleFactoryPath, '.js');
        context.fileCache.set(appNgModuleFactorySourceMapPath, { path: appNgModuleFactorySourceMapPath, content: appNgModuleFactoryOutput.sourceMapText });
        context.fileCache.set(appNgModuleFactoryPathJsFile, { path: appNgModuleFactoryPathJsFile, content: appNgModuleFactoryOutput.outputText });
        if (changedFiles) {
            changedFiles.push({
                event: 'change',
                filePath: appNgModuleFactoryPath,
                ext: path_1.extname(appNgModuleFactoryPath).toLowerCase()
            });
        }
    }
}
exports.updateAppNgModuleAndFactoryWithDeepLinkConfig = updateAppNgModuleAndFactoryWithDeepLinkConfig;
function getUpdatedAppNgModuleContentWithDeepLinkConfig(appNgModuleFilePath, appNgModuleFileContent, deepLinkStringContent) {
    var sourceFile = typescript_utils_1.getTypescriptSourceFile(appNgModuleFilePath, appNgModuleFileContent);
    var decorator = typescript_utils_1.getNgModuleDecorator(appNgModuleFilePath, sourceFile);
    var functionCall = getIonicModuleForRootCall(decorator);
    if (functionCall.arguments.length === 1) {
        appNgModuleFileContent = addDefaultSecondArgumentToAppNgModule(appNgModuleFileContent, functionCall);
        sourceFile = typescript_utils_1.getTypescriptSourceFile(appNgModuleFilePath, appNgModuleFileContent);
        decorator = typescript_utils_1.getNgModuleDecorator(appNgModuleFilePath, sourceFile);
        functionCall = getIonicModuleForRootCall(decorator);
    }
    if (functionCall.arguments.length === 2) {
        // we need to add the node
        return addDeepLinkArgumentToAppNgModule(appNgModuleFileContent, functionCall, deepLinkStringContent);
    }
    // we need to replace whatever node exists here with the deeplink config
    return typescript_utils_1.replaceNode(appNgModuleFilePath, appNgModuleFileContent, functionCall.arguments[2], deepLinkStringContent);
}
exports.getUpdatedAppNgModuleContentWithDeepLinkConfig = getUpdatedAppNgModuleContentWithDeepLinkConfig;
function getUpdatedAppNgModuleFactoryContentWithDeepLinksConfig(appNgModuleFactoryFileContent, deepLinkStringContent) {
    // tried to do this with typescript API, wasn't clear on how to do it
    var regex = /this.*?DeepLinkConfigToken.*?=([\s\S]*?);/g;
    var results = regex.exec(appNgModuleFactoryFileContent);
    if (results && results.length === 2) {
        var actualString = results[0];
        var chunkToReplace = results[1];
        var fullStringToReplace = actualString.replace(chunkToReplace, deepLinkStringContent);
        return appNgModuleFactoryFileContent.replace(actualString, fullStringToReplace);
    }
    throw new Error('The RegExp to find the DeepLinkConfigToken did not return valid data');
}
exports.getUpdatedAppNgModuleFactoryContentWithDeepLinksConfig = getUpdatedAppNgModuleFactoryContentWithDeepLinksConfig;
function addDefaultSecondArgumentToAppNgModule(appNgModuleFileContent, ionicModuleForRoot) {
    var argOneNode = ionicModuleForRoot.arguments[0];
    var updatedFileContent = typescript_utils_1.appendAfter(appNgModuleFileContent, argOneNode, ', {}');
    return updatedFileContent;
}
exports.addDefaultSecondArgumentToAppNgModule = addDefaultSecondArgumentToAppNgModule;
function addDeepLinkArgumentToAppNgModule(appNgModuleFileContent, ionicModuleForRoot, deepLinkString) {
    var argTwoNode = ionicModuleForRoot.arguments[1];
    var updatedFileContent = typescript_utils_1.appendAfter(appNgModuleFileContent, argTwoNode, ", " + deepLinkString);
    return updatedFileContent;
}
exports.addDeepLinkArgumentToAppNgModule = addDeepLinkArgumentToAppNgModule;
function generateDefaultDeepLinkNgModuleContent(pageFilePath, className) {
    var importFrom = path_1.basename(pageFilePath, '.ts');
    return "\nimport { NgModule } from '@angular/core';\nimport { IonicPageModule } from 'ionic-angular';\nimport { " + className + " } from './" + importFrom + "';\n\n@NgModule({\n  declarations: [\n    " + className + ",\n  ],\n  imports: [\n    IonicPageModule.forChild(" + className + ")\n  ]\n})\nexport class " + className + "Module {}\n\n";
}
exports.generateDefaultDeepLinkNgModuleContent = generateDefaultDeepLinkNgModuleContent;
var DEEPLINK_DECORATOR_TEXT = 'IonicPage';
var DEEPLINK_DECORATOR_NAME_ATTRIBUTE = 'name';
var DEEPLINK_DECORATOR_SEGMENT_ATTRIBUTE = 'segment';
var DEEPLINK_DECORATOR_PRIORITY_ATTRIBUTE = 'priority';
var DEEPLINK_DECORATOR_DEFAULT_HISTORY_ATTRIBUTE = 'defaultHistory';
var NG_MODULE_IMPORT_DECLARATION = 'imports';
var IONIC_MODULE_NAME = 'IonicModule';
var FOR_ROOT_METHOD = 'forRoot';
var LOAD_CHILDREN_SEPARATOR = '#';
