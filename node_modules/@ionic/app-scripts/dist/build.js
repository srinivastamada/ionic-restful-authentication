"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = require("./util/constants");
var interfaces_1 = require("./util/interfaces");
var errors_1 = require("./util/errors");
var events_1 = require("./util/events");
var helpers_1 = require("./util/helpers");
var bundle_1 = require("./bundle");
var clean_1 = require("./clean");
var copy_1 = require("./copy");
var lint_1 = require("./lint");
var logger_1 = require("./logger/logger");
var minify_1 = require("./minify");
var ngc_1 = require("./ngc");
var transpile_1 = require("./transpile");
var postprocess_1 = require("./postprocess");
var preprocess_1 = require("./preprocess");
var sass_1 = require("./sass");
var template_1 = require("./template");
var transpile_2 = require("./transpile");
function build(context) {
    helpers_1.setContext(context);
    var logger = new logger_1.Logger("build " + (context.isProd ? 'prod' : 'dev'));
    return buildWorker(context)
        .then(function () {
        // congrats, we did it!  (•_•) / ( •_•)>⌐■-■ / (⌐■_■)
        logger.finish();
    })
        .catch(function (err) {
        if (err.isFatal) {
            throw err;
        }
        throw logger.fail(err);
    });
}
exports.build = build;
function buildWorker(context) {
    return Promise.resolve().then(function () {
        // load any 100% required files to ensure they exist
        return validateRequiredFilesExist(context);
    })
        .then(function (_a) {
        var _ = _a[0], tsConfigContents = _a[1];
        return validateTsConfigSettings(tsConfigContents);
    })
        .then(function () {
        return buildProject(context);
    });
}
function validateRequiredFilesExist(context) {
    return Promise.all([
        helpers_1.readFileAsync(process.env[Constants.ENV_APP_ENTRY_POINT]),
        transpile_1.getTsConfigAsync(context, process.env[Constants.ENV_TS_CONFIG])
    ]).catch(function (error) {
        if (error.code === 'ENOENT' && error.path === process.env[Constants.ENV_APP_ENTRY_POINT]) {
            error = new errors_1.BuildError(error.path + " was not found. The \"main.dev.ts\" and \"main.prod.ts\" files have been deprecated. Please create a new file \"main.ts\" containing the content of \"main.dev.ts\", and then delete the deprecated files.\n                            For more information, please see the default Ionic project main.ts file here:\n                            https://github.com/driftyco/ionic2-app-base/tree/master/src/app/main.ts");
            error.isFatal = true;
            throw error;
        }
        if (error.code === 'ENOENT' && error.path === process.env[Constants.ENV_TS_CONFIG]) {
            error = new errors_1.BuildError([error.path + " was not found. The \"tsconfig.json\" file is missing. This file is required.",
                'For more information please see the default Ionic project tsconfig.json file here:',
                'https://github.com/driftyco/ionic2-app-base/blob/master/tsconfig.json'].join('\n'));
            error.isFatal = true;
            throw error;
        }
        error.isFatal = true;
        throw error;
    });
}
function validateTsConfigSettings(tsConfigFileContents) {
    return new Promise(function (resolve, reject) {
        try {
            var isValid = tsConfigFileContents.options &&
                tsConfigFileContents.options.sourceMap === true;
            if (!isValid) {
                var error = new errors_1.BuildError(['The "tsconfig.json" file must have compilerOptions.sourceMap set to true.',
                    'For more information please see the default Ionic project tsconfig.json file here:',
                    'https://github.com/driftyco/ionic2-app-base/blob/master/tsconfig.json'].join('\n'));
                error.isFatal = true;
                return reject(error);
            }
            resolve();
        }
        catch (e) {
            var error = new errors_1.BuildError('The "tsconfig.json" file contains malformed JSON.');
            error.isFatal = true;
            return reject(error);
        }
    });
}
function buildProject(context) {
    // sync empty the www/build directory
    clean_1.clean(context);
    buildId++;
    var copyPromise = copy_1.copy(context);
    var compilePromise = (context.runAot) ? ngc_1.ngc(context) : transpile_2.transpile(context);
    return compilePromise
        .then(function () {
        return preprocess_1.preprocess(context);
    })
        .then(function () {
        return bundle_1.bundle(context);
    })
        .then(function () {
        var minPromise = (context.runMinifyJs) ? minify_1.minifyJs(context) : Promise.resolve();
        var sassPromise = sass_1.sass(context)
            .then(function () {
            return (context.runMinifyCss) ? minify_1.minifyCss(context) : Promise.resolve();
        });
        return Promise.all([
            minPromise,
            sassPromise,
            copyPromise
        ]);
    })
        .then(function () {
        return postprocess_1.postprocess(context);
    })
        .then(function () {
        if (helpers_1.getBooleanPropertyValue(Constants.ENV_ENABLE_LINT)) {
            // kick off the tslint after everything else
            // nothing needs to wait on its completion unless bailing on lint error is enabled
            var result = lint_1.lint(context);
            if (helpers_1.getBooleanPropertyValue(Constants.ENV_BAIL_ON_LINT_ERROR)) {
                return result;
            }
        }
    })
        .catch(function (err) {
        throw new errors_1.BuildError(err);
    });
}
function buildUpdate(changedFiles, context) {
    return new Promise(function (resolve) {
        var logger = new logger_1.Logger('build');
        buildId++;
        var buildUpdateMsg = {
            buildId: buildId,
            reloadApp: false
        };
        events_1.emit(events_1.EventType.BuildUpdateStarted, buildUpdateMsg);
        function buildTasksDone(resolveValue) {
            // all build tasks have been resolved or one of them
            // bailed early, stopping all others to not run
            parallelTasksPromise.then(function () {
                // all parallel tasks are also done
                // so now we're done done
                var buildUpdateMsg = {
                    buildId: buildId,
                    reloadApp: resolveValue.requiresAppReload
                };
                events_1.emit(events_1.EventType.BuildUpdateCompleted, buildUpdateMsg);
                if (!resolveValue.requiresAppReload) {
                    // just emit that only a certain file changed
                    // this one is useful when only a sass changed happened
                    // and the webpack only needs to livereload the css
                    // but does not need to do a full page refresh
                    events_1.emit(events_1.EventType.FileChange, resolveValue.changedFiles);
                }
                var requiresLintUpdate = false;
                for (var _i = 0, changedFiles_1 = changedFiles; _i < changedFiles_1.length; _i++) {
                    var changedFile = changedFiles_1[_i];
                    if (changedFile.ext === '.ts') {
                        if (changedFile.event === 'change' || changedFile.event === 'add') {
                            requiresLintUpdate = true;
                            break;
                        }
                    }
                }
                if (requiresLintUpdate) {
                    // a ts file changed, so let's lint it too, however
                    // this task should run as an after thought
                    if (helpers_1.getBooleanPropertyValue(Constants.ENV_ENABLE_LINT)) {
                        lint_1.lintUpdate(changedFiles, context);
                    }
                }
                logger.finish('green', true);
                logger_1.Logger.newLine();
                // we did it!
                resolve();
            });
        }
        // kick off all the build tasks
        // and the tasks that can run parallel to all the build tasks
        var buildTasksPromise = buildUpdateTasks(changedFiles, context);
        var parallelTasksPromise = buildUpdateParallelTasks(changedFiles, context);
        // whether it was resolved or rejected, we need to do the same thing
        buildTasksPromise
            .then(buildTasksDone)
            .catch(function () {
            buildTasksDone({
                requiresAppReload: false,
                changedFiles: changedFiles
            });
        });
    });
}
exports.buildUpdate = buildUpdate;
/**
 * Collection of all the build tasks than need to run
 * Each task will only run if it's set with eacn BuildState.
 */
function buildUpdateTasks(changedFiles, context) {
    var resolveValue = {
        requiresAppReload: false,
        changedFiles: []
    };
    return loadFiles(changedFiles, context)
        .then(function () {
        // TEMPLATE
        if (context.templateState === interfaces_1.BuildState.RequiresUpdate) {
            resolveValue.requiresAppReload = true;
            return template_1.templateUpdate(changedFiles, context);
        }
        // no template updates required
        return Promise.resolve();
    })
        .then(function () {
        // TRANSPILE
        if (context.transpileState === interfaces_1.BuildState.RequiresUpdate) {
            resolveValue.requiresAppReload = true;
            // we've already had a successful transpile once, only do an update
            // not that we've also already started a transpile diagnostics only
            // build that only needs to be completed by the end of buildUpdate
            return transpile_2.transpileUpdate(changedFiles, context);
        }
        else if (context.transpileState === interfaces_1.BuildState.RequiresBuild) {
            // run the whole transpile
            resolveValue.requiresAppReload = true;
            return transpile_2.transpile(context);
        }
        // no transpiling required
        return Promise.resolve();
    })
        .then(function () {
        // PREPROCESS
        return preprocess_1.preprocessUpdate(changedFiles, context);
    })
        .then(function () {
        // BUNDLE
        if (context.bundleState === interfaces_1.BuildState.RequiresUpdate) {
            // we need to do a bundle update
            resolveValue.requiresAppReload = true;
            return bundle_1.bundleUpdate(changedFiles, context);
        }
        else if (context.bundleState === interfaces_1.BuildState.RequiresBuild) {
            // we need to do a full bundle build
            resolveValue.requiresAppReload = true;
            return bundle_1.bundle(context);
        }
        // no bundling required
        return Promise.resolve();
    })
        .then(function () {
        // SASS
        if (context.sassState === interfaces_1.BuildState.RequiresUpdate) {
            // we need to do a sass update
            return sass_1.sassUpdate(changedFiles, context).then(function (outputCssFile) {
                var changedFile = {
                    event: Constants.FILE_CHANGE_EVENT,
                    ext: '.css',
                    filePath: outputCssFile
                };
                context.fileCache.set(outputCssFile, { path: outputCssFile, content: outputCssFile });
                resolveValue.changedFiles.push(changedFile);
            });
        }
        else if (context.sassState === interfaces_1.BuildState.RequiresBuild) {
            // we need to do a full sass build
            return sass_1.sass(context).then(function (outputCssFile) {
                var changedFile = {
                    event: Constants.FILE_CHANGE_EVENT,
                    ext: '.css',
                    filePath: outputCssFile
                };
                context.fileCache.set(outputCssFile, { path: outputCssFile, content: outputCssFile });
                resolveValue.changedFiles.push(changedFile);
            });
        }
        // no sass build required
        return Promise.resolve();
    })
        .then(function () {
        return resolveValue;
    });
}
function loadFiles(changedFiles, context) {
    // UPDATE IN-MEMORY FILE CACHE
    var promises = [];
    var _loop_1 = function (changedFile) {
        if (changedFile.event === Constants.FILE_DELETE_EVENT) {
            // remove from the cache on delete
            context.fileCache.remove(changedFile.filePath);
        }
        else {
            // load the latest since the file changed
            var promise = helpers_1.readFileAsync(changedFile.filePath);
            promises.push(promise);
            promise.then(function (content) {
                context.fileCache.set(changedFile.filePath, { path: changedFile.filePath, content: content });
            });
        }
    };
    for (var _i = 0, changedFiles_2 = changedFiles; _i < changedFiles_2.length; _i++) {
        var changedFile = changedFiles_2[_i];
        _loop_1(changedFile);
    }
    return Promise.all(promises);
}
/**
 * parallelTasks are for any tasks that can run parallel to the entire
 * build, but we still need to make sure they've completed before we're
 * all done, it's also possible there are no parallelTasks at all
 */
function buildUpdateParallelTasks(changedFiles, context) {
    var parallelTasks = [];
    if (context.transpileState === interfaces_1.BuildState.RequiresUpdate) {
        parallelTasks.push(transpile_2.transpileDiagnosticsOnly(context));
    }
    return Promise.all(parallelTasks);
}
var buildId = 0;
