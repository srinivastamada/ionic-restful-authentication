"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./util/errors");
var Constants = require("./util/constants");
var rollup_1 = require("./rollup");
var webpack_1 = require("./webpack");
function bundle(context, configFile) {
    return bundleWorker(context, configFile)
        .catch(function (err) {
        throw new errors_1.BuildError(err);
    });
}
exports.bundle = bundle;
function bundleWorker(context, configFile) {
    if (context.bundler === Constants.BUNDLER_ROLLUP) {
        return rollup_1.rollup(context, configFile);
    }
    return webpack_1.webpack(context, configFile);
}
function bundleUpdate(changedFiles, context) {
    if (context.bundler === Constants.BUNDLER_ROLLUP) {
        return rollup_1.rollupUpdate(changedFiles, context)
            .catch(function (err) {
            throw new errors_1.BuildError(err);
        });
    }
    return webpack_1.webpackUpdate(changedFiles, context)
        .catch(function (err) {
        if (err instanceof errors_1.IgnorableError) {
            throw err;
        }
        throw new errors_1.BuildError(err);
    });
}
exports.bundleUpdate = bundleUpdate;
function buildJsSourceMaps(context) {
    if (context.bundler === Constants.BUNDLER_ROLLUP) {
        var rollupConfig = rollup_1.getRollupConfig(context, null);
        return rollupConfig.sourceMap;
    }
    var webpackConfig = webpack_1.getWebpackConfig(context, null);
    return !!(webpackConfig.devtool && webpackConfig.devtool.length > 0);
}
exports.buildJsSourceMaps = buildJsSourceMaps;
function getJsOutputDest(context) {
    if (context.bundler === Constants.BUNDLER_ROLLUP) {
        var rollupConfig = rollup_1.getRollupConfig(context, null);
        return rollup_1.getOutputDest(context, rollupConfig);
    }
    return webpack_1.getOutputDest(context);
}
exports.getJsOutputDest = getJsOutputDest;
