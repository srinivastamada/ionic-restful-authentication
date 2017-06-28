"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var errors_1 = require("../util/errors");
var lint_factory_1 = require("./lint-factory");
var helpers_1 = require("../util/helpers");
var logger_1 = require("../logger/logger");
var logger_diagnostics_1 = require("../logger/logger-diagnostics");
var logger_tslint_1 = require("../logger/logger-tslint");
function isMpegFile(file) {
    var buffer = new Buffer(256);
    buffer.fill(0);
    var fd = fs.openSync(file, 'r');
    try {
        fs.readSync(fd, buffer, 0, 256, null);
        if (buffer.readInt8(0) === 0x47 && buffer.readInt8(188) === 0x47) {
            logger_1.Logger.debug("tslint: " + file + ": ignoring MPEG transport stream");
            return true;
        }
    }
    finally {
        fs.closeSync(fd);
    }
    return false;
}
exports.isMpegFile = isMpegFile;
function lintFile(context, program, filePath) {
    return Promise.resolve().then(function () {
        if (isMpegFile(filePath)) {
            throw new Error(filePath + " is not a valid TypeScript file");
        }
        return helpers_1.readFileAsync(filePath);
    }).then(function (fileContents) {
        var linter = lint_factory_1.getLinter(filePath, fileContents, program);
        var lintResult = linter.lint();
        return {
            filePath: filePath,
            failures: lintResult.failures
        };
    });
}
exports.lintFile = lintFile;
function processLintResults(context, lintResults) {
    var filesThatDidntPass = [];
    for (var _i = 0, lintResults_1 = lintResults; _i < lintResults_1.length; _i++) {
        var lintResult = lintResults_1[_i];
        if (lintResult && lintResult.failures && lintResult.failures.length) {
            var diagnostics = logger_tslint_1.runTsLintDiagnostics(context, lintResult.failures);
            logger_diagnostics_1.printDiagnostics(context, logger_diagnostics_1.DiagnosticsType.TsLint, diagnostics, true, false);
            filesThatDidntPass.push(lintResult.filePath);
        }
    }
    if (filesThatDidntPass.length) {
        var errorMsg = generateFormattedErrorMsg(filesThatDidntPass);
        throw new errors_1.BuildError(errorMsg);
    }
}
exports.processLintResults = processLintResults;
function generateFormattedErrorMsg(failingFiles) {
    var listOfFilesString = '';
    failingFiles.forEach(function (file) { return listOfFilesString = listOfFilesString + file + '\n'; });
    return "The following files did not pass tslint: \n" + listOfFilesString;
}
exports.generateFormattedErrorMsg = generateFormattedErrorMsg;
;
