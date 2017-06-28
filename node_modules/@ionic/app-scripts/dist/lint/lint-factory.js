"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslint_1 = require("tslint");
var Linter = require("tslint");
function getLinter(filePath, fileContent, program) {
    var configuration = tslint_1.findConfiguration(null, filePath);
    var linter = new Linter(filePath, fileContent, {
        configuration: configuration,
        formatter: null,
        formattersDirectory: null,
        rulesDirectory: null,
    }, program);
    return linter;
}
exports.getLinter = getLinter;
function createProgram(configFilePath, sourceDir) {
    return tslint_1.createProgram(configFilePath, sourceDir);
}
exports.createProgram = createProgram;
function getFileNames(program) {
    return tslint_1.getFileNames(program);
}
exports.getFileNames = getFileNames;
