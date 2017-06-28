"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var Constants = require("./constants");
var helpers_1 = require("./helpers");
function purgeSourceMapsIfNeeded(context) {
    if (helpers_1.getBooleanPropertyValue(Constants.ENV_VAR_GENERATE_SOURCE_MAP)) {
        // keep the source maps and just return
        return Promise.resolve([]);
    }
    return helpers_1.readDirAsync(context.buildDir).then(function (fileNames) {
        var sourceMaps = fileNames.filter(function (fileName) { return fileName.endsWith('.map'); });
        var fullPaths = sourceMaps.map(function (sourceMap) { return path_1.join(context.buildDir, sourceMap); });
        var promises = [];
        for (var _i = 0, fullPaths_1 = fullPaths; _i < fullPaths_1.length; _i++) {
            var fullPath = fullPaths_1[_i];
            promises.push(helpers_1.unlinkAsync(fullPath));
        }
        return Promise.all(promises);
    });
}
exports.purgeSourceMapsIfNeeded = purgeSourceMapsIfNeeded;
