"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = require("typescript");
var typescript_utils_1 = require("../util/typescript-utils");
var logger_1 = require("../logger/logger");
var NgcCompilerHost = (function () {
    function NgcCompilerHost(options, fileSystem, setParentNodes) {
        if (setParentNodes === void 0) { setParentNodes = true; }
        this.options = options;
        this.fileSystem = fileSystem;
        this.setParentNodes = setParentNodes;
        this.diskCompilerHost = typescript_1.createCompilerHost(this.options, this.setParentNodes);
        this.sourceFileMap = new Map();
    }
    NgcCompilerHost.prototype.fileExists = function (filePath) {
        var fileContent = this.fileSystem.getFileContent(filePath);
        if (fileContent) {
            return true;
        }
        return this.diskCompilerHost.fileExists(filePath);
    };
    NgcCompilerHost.prototype.readFile = function (filePath) {
        var fileContent = this.fileSystem.getFileContent(filePath);
        if (fileContent) {
            return fileContent;
        }
        return this.diskCompilerHost.readFile(filePath);
    };
    NgcCompilerHost.prototype.directoryExists = function (directoryPath) {
        var stats = this.fileSystem.getDirectoryStats(directoryPath);
        if (stats) {
            return true;
        }
        return this.diskCompilerHost.directoryExists(directoryPath);
    };
    NgcCompilerHost.prototype.getFiles = function (directoryPath) {
        return this.fileSystem.getFileNamesInDirectory(directoryPath);
    };
    NgcCompilerHost.prototype.getDirectories = function (directoryPath) {
        var subdirs = this.fileSystem.getSubDirs(directoryPath);
        var delegated;
        try {
            delegated = this.diskCompilerHost.getDirectories(directoryPath);
        }
        catch (e) {
            delegated = [];
        }
        return delegated.concat(subdirs);
    };
    NgcCompilerHost.prototype.getSourceFile = function (filePath, languageVersion, onError) {
        var existingSourceFile = this.sourceFileMap.get(filePath);
        if (existingSourceFile) {
            return existingSourceFile;
        }
        // we haven't created a source file for this yet, so try to use what's in memory
        var fileContentFromMemory = this.fileSystem.getFileContent(filePath);
        if (fileContentFromMemory) {
            var typescriptSourceFile = typescript_utils_1.getTypescriptSourceFile(filePath, fileContentFromMemory, languageVersion, this.setParentNodes);
            this.sourceFileMap.set(filePath, typescriptSourceFile);
            return typescriptSourceFile;
        }
        // dang, it's not in memory, load it from disk and cache it
        var diskSourceFile = this.diskCompilerHost.getSourceFile(filePath, languageVersion, onError);
        this.sourceFileMap.set(filePath, diskSourceFile);
        return diskSourceFile;
    };
    NgcCompilerHost.prototype.getCancellationToken = function () {
        return this.diskCompilerHost.getCancellationToken();
    };
    NgcCompilerHost.prototype.getDefaultLibFileName = function (options) {
        return this.diskCompilerHost.getDefaultLibFileName(options);
    };
    NgcCompilerHost.prototype.writeFile = function (fileName, data, writeByteOrderMark, onError) {
        logger_1.Logger.debug("[NgcCompilerHost] writeFile: adding " + fileName + " to virtual file system");
        this.fileSystem.addVirtualFile(fileName, data);
    };
    NgcCompilerHost.prototype.getCurrentDirectory = function () {
        return this.diskCompilerHost.getCurrentDirectory();
    };
    NgcCompilerHost.prototype.getCanonicalFileName = function (fileName) {
        return this.diskCompilerHost.getCanonicalFileName(fileName);
    };
    NgcCompilerHost.prototype.useCaseSensitiveFileNames = function () {
        return this.diskCompilerHost.useCaseSensitiveFileNames();
    };
    NgcCompilerHost.prototype.getNewLine = function () {
        return this.diskCompilerHost.getNewLine();
    };
    return NgcCompilerHost;
}());
exports.NgcCompilerHost = NgcCompilerHost;
