"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
require("reflect-metadata");
var typescript_1 = require("typescript");
var tsc_1 = require("@angular/tsc-wrapped/src/tsc");
var hybrid_file_system_factory_1 = require("../util/hybrid-file-system-factory");
var compiler_host_factory_1 = require("./compiler-host-factory");
var utils_1 = require("./utils");
var logger_1 = require("../logger/logger");
var logger_diagnostics_1 = require("../logger/logger-diagnostics");
var logger_typescript_1 = require("../logger/logger-typescript");
var errors_1 = require("../util/errors");
var helpers_1 = require("../util/helpers");
var codegen_1 = require("./codegen");
var AotCompiler = (function () {
    function AotCompiler(context, options) {
        this.context = context;
        this.options = options;
        this.tsConfig = getNgcConfig(this.context, this.options.tsConfigPath);
        this.angularCompilerOptions = Object.assign({}, this.tsConfig.ngOptions, {
            basePath: this.options.rootDir,
            entryPoint: this.options.entryPoint
        });
        this.fileSystem = hybrid_file_system_factory_1.getInstance();
        this.compilerHost = compiler_host_factory_1.getInstance(this.tsConfig.parsed.options);
        this.program = typescript_1.createProgram(this.tsConfig.parsed.fileNames, this.tsConfig.parsed.options, this.compilerHost);
    }
    AotCompiler.prototype.compile = function () {
        var _this = this;
        return Promise.resolve().then(function () {
        }).then(function () {
            logger_diagnostics_1.clearDiagnostics(_this.context, logger_diagnostics_1.DiagnosticsType.TypeScript);
            var i18nOptions = {
                i18nFile: undefined,
                i18nFormat: undefined,
                locale: undefined,
                basePath: _this.options.rootDir
            };
            logger_1.Logger.debug('[AotCompiler] compile: starting codegen ... ');
            return codegen_1.doCodegen({
                angularCompilerOptions: _this.angularCompilerOptions,
                cliOptions: i18nOptions,
                program: _this.program,
                compilerHost: _this.compilerHost,
                compilerOptions: _this.tsConfig.parsed.options
            });
        }).then(function () {
            logger_1.Logger.debug('[AotCompiler] compile: starting codegen ... DONE');
            logger_1.Logger.debug('[AotCompiler] compile: Creating and validating new TypeScript Program ...');
            _this.program = errorCheckProgram(_this.context, _this.tsConfig, _this.compilerHost, _this.program);
            logger_1.Logger.debug('[AotCompiler] compile: Creating and validating new TypeScript Program ... DONE');
        })
            .then(function () {
            logger_1.Logger.debug('[AotCompiler] compile: The following files are included in the program: ');
            for (var _i = 0, _a = _this.tsConfig.parsed.fileNames; _i < _a.length; _i++) {
                var fileName = _a[_i];
                logger_1.Logger.debug("[AotCompiler] compile: " + fileName);
                var cleanedFileName = path_1.normalize(path_1.resolve(fileName));
                var content = fs_extra_1.readFileSync(cleanedFileName).toString();
                _this.context.fileCache.set(cleanedFileName, { path: cleanedFileName, content: content });
            }
        }).then(function () {
            logger_1.Logger.debug('[AotCompiler] compile: Starting to process and modify entry point ...');
            var mainFile = _this.context.fileCache.get(_this.options.entryPoint);
            if (!mainFile) {
                throw new errors_1.BuildError(new Error("Could not find entry point (bootstrap file) " + _this.options.entryPoint));
            }
            logger_1.Logger.debug('[AotCompiler] compile: Resolving NgModule from entry point');
            var modifiedFileContent = null;
            try {
                logger_1.Logger.debug('[AotCompiler] compile: Dynamically changing entry point content to AOT mode content');
                modifiedFileContent = utils_1.replaceBootstrap(mainFile.path, mainFile.content, _this.options.appNgModulePath, _this.options.appNgModuleClass);
            }
            catch (ex) {
                logger_1.Logger.debug("Failed to parse bootstrap: ", ex.message);
                logger_1.Logger.warn("Failed to parse and update " + _this.options.entryPoint + " content for AoT compilation.\n                    For now, the default fallback content will be used instead.\n                    Please consider updating " + _this.options.entryPoint + " with the content from the following link:\n                    https://github.com/driftyco/ionic2-app-base/tree/master/src/app/main.ts");
                modifiedFileContent = utils_1.getFallbackMainContent();
            }
            logger_1.Logger.debug("[AotCompiler] compile: Modified File Content: " + modifiedFileContent);
            _this.context.fileCache.set(_this.options.entryPoint, { path: _this.options.entryPoint, content: modifiedFileContent });
            logger_1.Logger.debug('[AotCompiler] compile: Starting to process and modify entry point ... DONE');
        })
            .then(function () {
            logger_1.Logger.debug('[AotCompiler] compile: Transpiling files ...');
            transpileFiles(_this.context, _this.tsConfig, _this.fileSystem);
            logger_1.Logger.debug('[AotCompiler] compile: Transpiling files ... DONE');
        }).then(function () {
            return {
                lazyLoadedModuleDictionary: _this.lazyLoadedModuleDictionary
            };
        });
    };
    return AotCompiler;
}());
exports.AotCompiler = AotCompiler;
function errorCheckProgram(context, tsConfig, compilerHost, cachedProgram) {
    // Create a new Program, based on the old one. This will trigger a resolution of all
    // transitive modules, which include files that might just have been generated.
    var program = typescript_1.createProgram(tsConfig.parsed.fileNames, tsConfig.parsed.options, compilerHost, cachedProgram);
    var globalDiagnostics = program.getGlobalDiagnostics();
    var tsDiagnostics = program.getSyntacticDiagnostics()
        .concat(program.getSemanticDiagnostics())
        .concat(program.getOptionsDiagnostics());
    if (globalDiagnostics.length) {
        var diagnostics = logger_typescript_1.runTypeScriptDiagnostics(context, globalDiagnostics);
        logger_diagnostics_1.printDiagnostics(context, logger_diagnostics_1.DiagnosticsType.TypeScript, diagnostics, true, false);
        throw new errors_1.BuildError(new Error('Failed to transpile TypeScript'));
    }
    if (tsDiagnostics.length) {
        var diagnostics = logger_typescript_1.runTypeScriptDiagnostics(context, tsDiagnostics);
        logger_diagnostics_1.printDiagnostics(context, logger_diagnostics_1.DiagnosticsType.TypeScript, diagnostics, true, false);
        throw new errors_1.BuildError(new Error('Failed to transpile TypeScript'));
    }
    return program;
}
function transpileFiles(context, tsConfig, fileSystem) {
    var tsFiles = context.fileCache.getAll().filter(function (file) { return path_1.extname(file.path) === '.ts' && file.path.indexOf('.d.ts') === -1; });
    for (var _i = 0, tsFiles_1 = tsFiles; _i < tsFiles_1.length; _i++) {
        var tsFile = tsFiles_1[_i];
        logger_1.Logger.debug("[AotCompiler] transpileFiles: Transpiling file " + tsFile.path + " ...");
        var transpileOutput = transpileFileContent(tsFile.path, tsFile.content, tsConfig.parsed.options);
        var diagnostics = logger_typescript_1.runTypeScriptDiagnostics(context, transpileOutput.diagnostics);
        if (diagnostics.length) {
            // darn, we've got some things wrong, transpile failed :(
            logger_diagnostics_1.printDiagnostics(context, logger_diagnostics_1.DiagnosticsType.TypeScript, diagnostics, true, true);
            throw new errors_1.BuildError(new Error('Failed to transpile TypeScript'));
        }
        var jsFilePath = helpers_1.changeExtension(tsFile.path, '.js');
        fileSystem.addVirtualFile(jsFilePath, transpileOutput.outputText);
        fileSystem.addVirtualFile(jsFilePath + '.map', transpileOutput.sourceMapText);
        logger_1.Logger.debug("[AotCompiler] transpileFiles: Transpiling file " + tsFile.path + " ... DONE");
    }
}
function transpileFileContent(fileName, sourceText, options) {
    var transpileOptions = {
        compilerOptions: options,
        fileName: fileName,
        reportDiagnostics: true
    };
    return typescript_1.transpileModule(sourceText, transpileOptions);
}
function getNgcConfig(context, tsConfigPath) {
    var tsConfigFile = tsc_1.tsc.readConfiguration(tsConfigPath, process.cwd());
    if (!tsConfigFile) {
        throw new errors_1.BuildError("tsconfig: invalid tsconfig file, \"" + tsConfigPath + "\"");
    }
    return tsConfigFile;
}
exports.getNgcConfig = getNgcConfig;
