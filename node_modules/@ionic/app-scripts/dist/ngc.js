"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger/logger");
var config_1 = require("./util/config");
var Constants = require("./util/constants");
var aot_compiler_1 = require("./aot/aot-compiler");
function ngc(context, configFile) {
    configFile = config_1.getUserConfigFile(context, taskInfo, configFile);
    var logger = new logger_1.Logger('ngc');
    return ngcWorker(context, configFile)
        .then(function () {
        logger.finish();
    })
        .catch(function (err) {
        throw logger.fail(err);
    });
}
exports.ngc = ngc;
function ngcWorker(context, configFile) {
    var compiler = new aot_compiler_1.AotCompiler(context, { entryPoint: process.env[Constants.ENV_APP_ENTRY_POINT],
        rootDir: context.rootDir,
        tsConfigPath: process.env[Constants.ENV_TS_CONFIG],
        appNgModuleClass: process.env[Constants.ENV_APP_NG_MODULE_CLASS],
        appNgModulePath: process.env[Constants.ENV_APP_NG_MODULE_PATH]
    });
    return compiler.compile();
}
exports.ngcWorker = ngcWorker;
var taskInfo = {
    fullArg: '--ngc',
    shortArg: '-n',
    envVar: 'IONIC_NGC',
    packageConfig: 'ionic_ngc',
    defaultConfigFile: null
};
