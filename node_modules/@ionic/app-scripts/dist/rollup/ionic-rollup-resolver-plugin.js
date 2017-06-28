"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var helpers_1 = require("../util/helpers");
var logger_1 = require("../logger/logger");
var path_1 = require("path");
var pluginutils = require("rollup-pluginutils");
exports.PLUGIN_NAME = 'ion-rollup-resolver';
function ionicRollupResolverPlugin(context) {
    var filter = pluginutils.createFilter(INCLUDE, EXCLUDE);
    return {
        name: exports.PLUGIN_NAME,
        transform: function (sourceText, sourcePath) {
            if (!filter(sourcePath)) {
                return null;
            }
            var jsSourcePath = helpers_1.changeExtension(sourcePath, '.js');
            var mapPath = jsSourcePath + '.map';
            if (context.fileCache) {
                var file = context.fileCache.get(jsSourcePath);
                var map = context.fileCache.get(mapPath);
                // if the file and map aren't in memory, load them and cache them for future use
                try {
                    if (!file) {
                        var content = fs_1.readFileSync(jsSourcePath).toString();
                        file = { path: jsSourcePath, content: content };
                        context.fileCache.set(jsSourcePath, file);
                    }
                }
                catch (ex) {
                    logger_1.Logger.debug("transform: Failed to load " + jsSourcePath + " from disk");
                }
                try {
                    if (!map) {
                        var content = fs_1.readFileSync(mapPath).toString();
                        map = { path: mapPath, content: content };
                        context.fileCache.set(mapPath, map);
                    }
                }
                catch (ex) {
                    logger_1.Logger.debug("transform: Failed to load source map " + mapPath + " from disk");
                    // just return null and fallback to the default behavior
                    return null;
                }
                if (!file || !file.content) {
                    logger_1.Logger.debug("transform: unable to find " + jsSourcePath);
                    return null;
                }
                var mapContent = null;
                if (map && map.content) {
                    try {
                        mapContent = JSON.parse(map.content);
                    }
                    catch (ex) {
                    }
                }
                return {
                    code: file.content,
                    map: mapContent
                };
            }
            return null;
        },
        resolveId: function (importee, importer) {
            return resolveId(importee, importer, context);
        },
        load: function (sourcePath) {
            if (context.fileCache) {
                var file = context.fileCache.get(sourcePath);
                if (file && file.content) {
                    return file.content;
                }
            }
            return null;
        }
    };
}
exports.ionicRollupResolverPlugin = ionicRollupResolverPlugin;
function resolveId(importee, importer, context) {
    if (!importer || /\0/.test(importee)) {
        // disregard entry module
        // ignore IDs with null character, these belong to other plugins
        return null;
    }
    if (context.fileCache) {
        var importerFile = context.fileCache.get(importer);
        if (importerFile && importerFile.content) {
            var attemptedImporteeBasename = path_1.resolve(path_1.join(path_1.dirname(importer), importee));
            var attemptedImportee = attemptedImporteeBasename + '.ts';
            var importeeFile = context.fileCache.get(attemptedImportee);
            if (importeeFile) {
                logger_1.Logger.debug("resolveId: found and resolving " + attemptedImportee);
                return attemptedImportee;
            }
            else {
                // rather than a file, the attempedImportee could be a directory
                // while via node resolve pattern auto resolves to index file
                var attemptedImporteeIndex = path_1.resolve(path_1.join(attemptedImporteeBasename, 'index.ts'));
                var importeeIndexFile = context.fileCache.get(attemptedImporteeIndex);
                if (importeeIndexFile) {
                    logger_1.Logger.debug("resolveId: found and resolving " + attemptedImporteeIndex);
                    return attemptedImporteeIndex;
                }
            }
        }
    }
    return null;
}
exports.resolveId = resolveId;
var INCLUDE = ['*.ts+(|x)', '*.js+(|x)', '**/*.ts+(|x)', '**/*.js+(|x)'];
var EXCLUDE = ['*.d.ts', '**/*.d.ts'];
