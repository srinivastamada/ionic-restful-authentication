"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var CommonChunksPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
exports.NODE_MODULES = path_1.join(process.cwd(), 'node_modules');
exports.RXJS = path_1.join(exports.NODE_MODULES, 'rxjs');
exports.ZONEJS = path_1.join(exports.NODE_MODULES, 'zone.js');
exports.ANGULAR = path_1.join(exports.NODE_MODULES, '@angular');
exports.IONIC = path_1.join(exports.NODE_MODULES, 'ionic-angular');
function getIonicDependenciesCommonChunksPlugin() {
    return new CommonChunksPlugin({
        name: 'known-vendors',
        minChunks: checkIfModuleIsIonicDependency
    });
}
exports.getIonicDependenciesCommonChunksPlugin = getIonicDependenciesCommonChunksPlugin;
function getNonIonicDependenciesCommonChunksPlugin() {
    return new CommonChunksPlugin({
        name: 'unknown-vendors',
        minChunks: checkIfModuleIsNodeModuleButNotIonicDepenedency
    });
}
exports.getNonIonicDependenciesCommonChunksPlugin = getNonIonicDependenciesCommonChunksPlugin;
function isIonicDependency(modulePath) {
    return modulePath.startsWith(exports.RXJS) || modulePath.startsWith(exports.ZONEJS) || modulePath.startsWith(exports.ANGULAR) || modulePath.startsWith(exports.IONIC);
}
function checkIfModuleIsIonicDependency(module) {
    return !!(module.userRequest && isIonicDependency(module.userRequest));
}
exports.checkIfModuleIsIonicDependency = checkIfModuleIsIonicDependency;
function checkIfModuleIsNodeModuleButNotIonicDepenedency(module) {
    return !!(module.userRequest && module.userRequest.startsWith(exports.NODE_MODULES) && !isIonicDependency(module.userRequest));
}
exports.checkIfModuleIsNodeModuleButNotIonicDepenedency = checkIfModuleIsNodeModuleButNotIonicDepenedency;
