"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var helpers_1 = require("../util/helpers");
function runTsLintDiagnostics(context, failures) {
    return failures.map(function (failure) {
        return loadDiagnostic(context, failure);
    });
}
exports.runTsLintDiagnostics = runTsLintDiagnostics;
function getPositonData(positionObject) {
    return {
        position: positionObject.position,
        line: positionObject.lineAndCharacter ? positionObject.lineAndCharacter.line : 0,
        character: positionObject.lineAndCharacter ? positionObject.lineAndCharacter.character : 0,
    };
}
function loadDiagnostic(context, f) {
    var start = getPositonData(f.startPosition);
    var end = getPositonData(f.endPosition);
    var d = {
        level: 'warn',
        type: 'tslint',
        language: 'typescript',
        absFileName: f.fileName,
        relFileName: logger_1.Logger.formatFileName(context.rootDir, f.fileName),
        header: logger_1.Logger.formatHeader('tslint', f.fileName, context.rootDir, start.line + 1, end.line + 1),
        code: f.ruleName,
        messageText: f.failure,
        lines: []
    };
    if (f.sourceFile && f.sourceFile.text) {
        var srcLines = helpers_1.splitLineBreaks(f.sourceFile.text);
        for (var i = start.line; i <= end.line; i++) {
            if (srcLines[i].trim().length) {
                var errorLine = {
                    lineIndex: i,
                    lineNumber: i + 1,
                    text: srcLines[i],
                    html: srcLines[i],
                    errorCharStart: (i === start.line) ? start.character : (i === end.line) ? end.character : -1,
                    errorLength: 0,
                };
                for (var j = errorLine.errorCharStart; j < errorLine.text.length; j++) {
                    if (STOP_CHARS.indexOf(errorLine.text.charAt(j)) > -1) {
                        break;
                    }
                    errorLine.errorLength++;
                }
                if (errorLine.errorLength === 0 && errorLine.errorCharStart > 0) {
                    errorLine.errorLength = 1;
                    errorLine.errorCharStart--;
                }
                d.lines.push(errorLine);
            }
        }
        if (start.line > 0) {
            var beforeLine = {
                lineIndex: start.line - 1,
                lineNumber: start.line,
                text: srcLines[start.line - 1],
                html: srcLines[start.line - 1],
                errorCharStart: -1,
                errorLength: -1
            };
            d.lines.unshift(beforeLine);
        }
        if (end.line < srcLines.length) {
            var afterLine = {
                lineIndex: end.line + 1,
                lineNumber: end.line + 2,
                text: srcLines[end.line + 1],
                html: srcLines[end.line + 1],
                errorCharStart: -1,
                errorLength: -1
            };
            d.lines.push(afterLine);
        }
    }
    return d;
}
var STOP_CHARS = [' ', '=', ',', '.', '\t', '{', '}', '(', ')', '"', '\'', '`', '?', ':', ';', '+', '-', '*', '/', '<', '>', '&', '[', ']', '|'];
