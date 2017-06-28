"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_1 = require("fs");
var logger_1 = require("../logger/logger");
var helpers_1 = require("../util/helpers");
var Constants = require("../util/constants");
var GeneratorConstants = require("./constants");
var helpers_2 = require("../util/helpers");
var glob_util_1 = require("../util/glob-util");
var helpers_3 = require("../util/helpers");
var typescript_utils_1 = require("../util/typescript-utils");
function hydrateRequest(context, request) {
    var hydrated = Object.assign({ includeNgModule: true }, request);
    var suffix = getSuffixFromGeneratorType(context, request.type);
    hydrated.className = helpers_3.ensureSuffix(helpers_2.pascalCase(request.name), helpers_2.upperCaseFirst(suffix));
    hydrated.fileName = helpers_3.removeSuffix(helpers_2.paramCase(request.name), "-" + helpers_2.paramCase(suffix));
    hydrated.dirToRead = path_1.join(helpers_2.getStringPropertyValue(Constants.ENV_VAR_IONIC_ANGULAR_TEMPLATE_DIR), request.type);
    var baseDir = getDirToWriteToByType(context, request.type);
    hydrated.dirToWrite = path_1.join(baseDir, hydrated.fileName);
    return hydrated;
}
exports.hydrateRequest = hydrateRequest;
function hydrateTabRequest(context, request) {
    var h = hydrateRequest(context, request);
    var hydrated = Object.assign({
        tabs: request.tabs,
        tabContent: '',
        tabVariables: ''
    }, h);
    for (var i = 0; i < request.tabs.length; i++) {
        var tabVar = helpers_2.camelCase(request.tabs[i].name) + "Root";
        hydrated.tabVariables += "  " + tabVar + " = '" + request.tabs[i].className + "'\n";
        // If this is the last ion-tab to insert
        // then we do not want a new line
        if (i === request.tabs.length - 1) {
            hydrated.tabContent += "    <ion-tab [root]=\"" + tabVar + "\" tabTitle=\"" + helpers_2.sentenceCase(request.tabs[i].name) + "\" tabIcon=\"information-circle\"></ion-tab>";
        }
        else {
            hydrated.tabContent += "    <ion-tab [root]=\"" + tabVar + "\" tabTitle=\"" + helpers_2.sentenceCase(request.tabs[i].name) + "\" tabIcon=\"information-circle\"></ion-tab>\n";
        }
    }
    return hydrated;
}
exports.hydrateTabRequest = hydrateTabRequest;
function readTemplates(pathToRead) {
    var fileNames = fs_1.readdirSync(pathToRead);
    var absolutePaths = fileNames.map(function (fileName) {
        return path_1.join(pathToRead, fileName);
    });
    var filePathToContent = new Map();
    var promises = absolutePaths.map(function (absolutePath) {
        var promise = helpers_2.readFileAsync(absolutePath);
        promise.then(function (fileContent) {
            filePathToContent.set(absolutePath, fileContent);
        });
        return promise;
    });
    return Promise.all(promises).then(function () {
        return filePathToContent;
    });
}
exports.readTemplates = readTemplates;
function filterOutTemplates(request, templates) {
    var templatesToUseMap = new Map();
    templates.forEach(function (fileContent, filePath) {
        var newFileExtension = path_1.basename(filePath, GeneratorConstants.KNOWN_FILE_EXTENSION);
        var shouldSkip = (!request.includeNgModule && newFileExtension === GeneratorConstants.NG_MODULE_FILE_EXTENSION) || (!request.includeSpec && newFileExtension === GeneratorConstants.SPEC_FILE_EXTENSION);
        if (!shouldSkip) {
            templatesToUseMap.set(filePath, fileContent);
        }
    });
    return templatesToUseMap;
}
exports.filterOutTemplates = filterOutTemplates;
function applyTemplates(request, templates) {
    var appliedTemplateMap = new Map();
    templates.forEach(function (fileContent, filePath) {
        fileContent = helpers_2.replaceAll(fileContent, GeneratorConstants.CLASSNAME_VARIABLE, request.className);
        fileContent = helpers_2.replaceAll(fileContent, GeneratorConstants.FILENAME_VARIABLE, request.fileName);
        fileContent = helpers_2.replaceAll(fileContent, GeneratorConstants.SUPPLIEDNAME_VARIABLE, request.name);
        fileContent = helpers_2.replaceAll(fileContent, GeneratorConstants.TAB_CONTENT_VARIABLE, request.tabContent);
        fileContent = helpers_2.replaceAll(fileContent, GeneratorConstants.TAB_VARIABLES_VARIABLE, request.tabVariables);
        appliedTemplateMap.set(filePath, fileContent);
    });
    return appliedTemplateMap;
}
exports.applyTemplates = applyTemplates;
function writeGeneratedFiles(request, processedTemplates) {
    var promises = [];
    var createdFileList = [];
    processedTemplates.forEach(function (fileContent, filePath) {
        var newFileExtension = path_1.basename(filePath, GeneratorConstants.KNOWN_FILE_EXTENSION);
        var newFileName = request.fileName + "." + newFileExtension;
        var fileToWrite = path_1.join(request.dirToWrite, newFileName);
        createdFileList.push(fileToWrite);
        promises.push(createDirAndWriteFile(fileToWrite, fileContent));
    });
    return Promise.all(promises).then(function () {
        return createdFileList;
    });
}
exports.writeGeneratedFiles = writeGeneratedFiles;
function createDirAndWriteFile(filePath, fileContent) {
    var directory = path_1.dirname(filePath);
    return helpers_2.mkDirpAsync(directory).then(function () {
        return helpers_2.writeFileAsync(filePath, fileContent);
    });
}
function getNgModules(context, types) {
    var ngModuleSuffix = helpers_2.getStringPropertyValue(Constants.ENV_NG_MODULE_FILE_NAME_SUFFIX);
    var patterns = types.map(function (type) { return path_1.join(getDirToWriteToByType(context, type), '**', "*" + ngModuleSuffix); });
    return glob_util_1.globAll(patterns);
}
exports.getNgModules = getNgModules;
function getSuffixFromGeneratorType(context, type) {
    if (type === Constants.COMPONENT) {
        return 'Component';
    }
    else if (type === Constants.DIRECTIVE) {
        return 'Directive';
    }
    else if (type === Constants.PAGE || type === Constants.TABS) {
        return 'Page';
    }
    else if (type === Constants.PIPE) {
        return 'Pipe';
    }
    else if (type === Constants.PROVIDER) {
        return 'Provider';
    }
    throw new Error("Unknown Generator Type: " + type);
}
function getDirToWriteToByType(context, type) {
    if (type === Constants.COMPONENT) {
        return context.componentsDir;
    }
    else if (type === Constants.DIRECTIVE) {
        return context.directivesDir;
    }
    else if (type === Constants.PAGE || type === Constants.TABS) {
        return context.pagesDir;
    }
    else if (type === Constants.PIPE) {
        return context.pipesDir;
    }
    else if (type === Constants.PROVIDER) {
        return context.providersDir;
    }
    throw new Error("Unknown Generator Type: " + type);
}
exports.getDirToWriteToByType = getDirToWriteToByType;
function nonPageFileManipulation(context, name, ngModulePath, type) {
    var hydratedRequest = hydrateRequest(context, { type: type, name: name });
    var fileContent;
    return helpers_2.readFileAsync(ngModulePath).then(function (content) {
        fileContent = content;
        return generateTemplates(context, hydratedRequest);
    }).then(function () {
        var importPath = helpers_1.toUnixPath("" + path_1.relative(path_1.dirname(ngModulePath), hydratedRequest.dirToWrite) + path_1.sep + hydratedRequest.fileName);
        fileContent = typescript_utils_1.insertNamedImportIfNeeded(ngModulePath, fileContent, hydratedRequest.className, importPath);
        if (type === 'provider') {
            fileContent = typescript_utils_1.appendNgModuleDeclaration(ngModulePath, fileContent, hydratedRequest.className, type);
        }
        else {
            fileContent = typescript_utils_1.appendNgModuleDeclaration(ngModulePath, fileContent, hydratedRequest.className);
        }
        return helpers_2.writeFileAsync(ngModulePath, fileContent);
    });
}
exports.nonPageFileManipulation = nonPageFileManipulation;
function tabsModuleManipulation(tabs, hydratedRequest, tabHydratedRequests) {
    var ngModulePath = tabs[0].find(function (element) {
        return element.indexOf('module') !== -1;
    });
    var tabsNgModulePath = "" + hydratedRequest.dirToWrite + path_1.sep + hydratedRequest.fileName + ".module.ts";
    var importPath = helpers_1.toUnixPath(path_1.relative(path_1.dirname(tabsNgModulePath), ngModulePath.replace('.module.ts', '')));
    return helpers_2.readFileAsync(tabsNgModulePath).then(function (content) {
        var fileContent = content;
        fileContent = typescript_utils_1.insertNamedImportIfNeeded(tabsNgModulePath, fileContent, tabHydratedRequests[0].className, importPath);
        fileContent = typescript_utils_1.appendNgModuleDeclaration(tabsNgModulePath, fileContent, tabHydratedRequests[0].className);
        return helpers_2.writeFileAsync(tabsNgModulePath, fileContent);
    });
}
exports.tabsModuleManipulation = tabsModuleManipulation;
function generateTemplates(context, request) {
    logger_1.Logger.debug('[Generators] generateTemplates: Reading templates ...');
    return readTemplates(request.dirToRead).then(function (map) {
        logger_1.Logger.debug('[Generators] generateTemplates: Filtering out NgModule and Specs if needed ...');
        return filterOutTemplates(request, map);
    }).then(function (filteredMap) {
        logger_1.Logger.debug('[Generators] generateTemplates: Applying templates ...');
        var appliedTemplateMap = applyTemplates(request, filteredMap);
        logger_1.Logger.debug('[Generators] generateTemplates: Writing generated files to disk ...');
        return writeGeneratedFiles(request, appliedTemplateMap);
    });
}
exports.generateTemplates = generateTemplates;
;
;
;
