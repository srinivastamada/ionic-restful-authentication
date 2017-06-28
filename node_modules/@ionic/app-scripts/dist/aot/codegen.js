"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_cli_1 = require("@angular/compiler-cli");
var helpers_1 = require("../util/helpers");
function doCodegen(options) {
    return compiler_cli_1.__NGTOOLS_PRIVATE_API_2.codeGen({
        angularCompilerOptions: options.angularCompilerOptions,
        basePath: options.cliOptions.basePath,
        program: options.program,
        host: options.compilerHost,
        compilerOptions: options.compilerOptions,
        i18nFile: options.cliOptions.i18nFile,
        i18nFormat: options.cliOptions.i18nFormat,
        locale: options.cliOptions.locale,
        readResource: function (fileName) {
            return helpers_1.readFileAsync(fileName);
        }
    });
}
exports.doCodegen = doCodegen;
