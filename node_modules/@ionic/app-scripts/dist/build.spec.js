"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants = require("./util/constants");
var helpers = require("./util/helpers");
var build = require("./build");
var bundle = require("./bundle");
var copy = require("./copy");
var clean = require("./clean");
var lint = require("./lint");
var minify = require("./minify");
var ngc = require("./ngc");
var postprocess = require("./postprocess");
var preprocess = require("./preprocess");
var sass = require("./sass");
var transpile = require("./transpile");
describe('build', function () {
    beforeEach(function () {
        spyOn(clean, 'clean');
        spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve());
        spyOn(transpile, transpile.getTsConfigAsync.name).and.callFake(function () {
            return Promise.resolve({
                "options": {
                    "sourceMap": true
                }
            });
        });
        spyOn(bundle, bundle.bundle.name).and.returnValue(Promise.resolve());
        spyOn(copy, copy.copy.name).and.returnValue(Promise.resolve());
        spyOn(minify, minify.minifyCss.name).and.returnValue(Promise.resolve());
        spyOn(minify, minify.minifyJs.name).and.returnValue(Promise.resolve());
        spyOn(lint, lint.lint.name).and.returnValue(Promise.resolve());
        spyOn(ngc, ngc.ngc.name).and.returnValue(Promise.resolve());
        spyOn(postprocess, postprocess.postprocess.name).and.returnValue(Promise.resolve());
        spyOn(preprocess, preprocess.preprocess.name).and.returnValue(Promise.resolve());
        spyOn(sass, sass.sass.name).and.returnValue(Promise.resolve());
        spyOn(transpile, transpile.transpile.name).and.returnValue(Promise.resolve());
    });
    it('should do a prod build', function () {
        var context = {
            isProd: true,
            optimizeJs: true,
            runMinifyJs: true,
            runMinifyCss: true,
            runAot: true
        };
        var getBooleanPropertyValueSpy = spyOn(helpers, helpers.getBooleanPropertyValue.name).and.returnValue(true);
        return build.build(context).then(function () {
            expect(helpers.readFileAsync).toHaveBeenCalled();
            expect(copy.copy).toHaveBeenCalled();
            expect(ngc.ngc).toHaveBeenCalled();
            expect(bundle.bundle).toHaveBeenCalled();
            expect(minify.minifyJs).toHaveBeenCalled();
            expect(sass.sass).toHaveBeenCalled();
            expect(minify.minifyCss).toHaveBeenCalled();
            expect(lint.lint).toHaveBeenCalled();
            expect(getBooleanPropertyValueSpy.calls.first().args[0]).toEqual(Constants.ENV_ENABLE_LINT);
            expect(transpile.transpile).not.toHaveBeenCalled();
        }).catch(function (err) {
            expect(true).toEqual(false);
        });
    });
    it('should do a dev build', function () {
        var context = {
            isProd: false,
            optimizeJs: false,
            runMinifyJs: false,
            runMinifyCss: false,
            runAot: false
        };
        var getBooleanPropertyValueSpy = spyOn(helpers, helpers.getBooleanPropertyValue.name).and.returnValue(true);
        return build.build(context).then(function () {
            expect(helpers.readFileAsync).toHaveBeenCalled();
            expect(copy.copy).toHaveBeenCalled();
            expect(transpile.transpile).toHaveBeenCalled();
            expect(bundle.bundle).toHaveBeenCalled();
            expect(sass.sass).toHaveBeenCalled();
            expect(lint.lint).toHaveBeenCalled();
            expect(getBooleanPropertyValueSpy.calls.first().args[0]).toEqual(Constants.ENV_ENABLE_LINT);
            expect(postprocess.postprocess).toHaveBeenCalled();
            expect(preprocess.preprocess).toHaveBeenCalled();
            expect(ngc.ngc).not.toHaveBeenCalled();
            expect(minify.minifyJs).not.toHaveBeenCalled();
            expect(minify.minifyCss).not.toHaveBeenCalled();
        }).catch(function (err) {
            expect(true).toEqual(false);
        });
    });
    it('should skip lint', function () {
        var context = {
            isProd: false,
            optimizeJs: false,
            runMinifyJs: false,
            runMinifyCss: false,
            runAot: false
        };
        var getBooleanPropertyValueSpy = spyOn(helpers, helpers.getBooleanPropertyValue.name).and.returnValue(false);
        return build.build(context).then(function () {
            expect(helpers.readFileAsync).toHaveBeenCalled();
            expect(copy.copy).toHaveBeenCalled();
            expect(transpile.transpile).toHaveBeenCalled();
            expect(bundle.bundle).toHaveBeenCalled();
            expect(sass.sass).toHaveBeenCalled();
            expect(lint.lint).not.toHaveBeenCalled();
            expect(getBooleanPropertyValueSpy.calls.first().args[0]).toEqual(Constants.ENV_ENABLE_LINT);
            expect(postprocess.postprocess).toHaveBeenCalled();
            expect(preprocess.preprocess).toHaveBeenCalled();
            expect(ngc.ngc).not.toHaveBeenCalled();
            expect(minify.minifyJs).not.toHaveBeenCalled();
            expect(minify.minifyCss).not.toHaveBeenCalled();
        }).catch(function (err) {
            expect(true).toEqual(false);
        });
    });
});
describe('test project requirements before building', function () {
    it('should fail if APP_ENTRY_POINT file does not exist', function () {
        process.env[Constants.ENV_APP_ENTRY_POINT] = 'src/app/main.ts';
        process.env[Constants.ENV_TS_CONFIG] = 'tsConfig.js';
        var error = new Error('App entry point was not found');
        spyOn(helpers, 'readFileAsync').and.returnValue(Promise.reject(error));
        return build.build({}).catch(function (e) {
            expect(helpers.readFileAsync).toHaveBeenCalledTimes(1);
            expect(e).toEqual(error);
        });
    });
    it('should fail if IONIC_TS_CONFIG file does not exist', function () {
        process.env[Constants.ENV_APP_ENTRY_POINT] = 'src/app/main.ts';
        process.env[Constants.ENV_TS_CONFIG] = 'tsConfig.js';
        var error = new Error('Config was not found');
        spyOn(helpers, helpers.readFileAsync.name).and.returnValues(Promise.resolve());
        spyOn(transpile, transpile.getTsConfigAsync.name).and.returnValues(Promise.reject(error));
        return build.build({}).catch(function (e) {
            expect(transpile.getTsConfigAsync).toHaveBeenCalledTimes(1);
            expect(helpers.readFileAsync).toHaveBeenCalledTimes(1);
            expect(e).toEqual(error);
        });
    });
    it('should fail fataly if IONIC_TS_CONFIG file does not contain valid JSON', function () {
        process.env[Constants.ENV_APP_ENTRY_POINT] = 'src/app/main.ts';
        process.env[Constants.ENV_TS_CONFIG] = 'tsConfig.js';
        spyOn(transpile, transpile.getTsConfigAsync.name).and.callFake(function () {
            return Promise.resolve("{\n        \"options\" {\n          \"sourceMap\": false\n        }\n      }\n      ");
        });
        return build.build({}).catch(function (e) {
            expect(transpile.getTsConfigAsync).toHaveBeenCalledTimes(1);
            expect(e.isFatal).toBeTruthy();
        });
    });
    it('should fail fataly if IONIC_TS_CONFIG file does not contain compilerOptions.sourceMap === true', function () {
        process.env[Constants.ENV_APP_ENTRY_POINT] = 'src/app/main.ts';
        process.env[Constants.ENV_TS_CONFIG] = 'tsConfig.js';
        spyOn(transpile, transpile.getTsConfigAsync.name).and.callFake(function () {
            return Promise.resolve("{\n        \"options\": {\n          \"sourceMap\": false\n        }\n      }\n      ");
        });
        return build.build({}).catch(function (e) {
            expect(transpile.getTsConfigAsync).toHaveBeenCalledTimes(1);
            expect(e.isFatal).toBeTruthy();
        });
    });
    it('should succeed if IONIC_TS_CONFIG file contains compilerOptions.sourceMap === true', function () {
        process.env[Constants.ENV_APP_ENTRY_POINT] = 'src/app/main.ts';
        process.env[Constants.ENV_TS_CONFIG] = 'tsConfig.js';
        spyOn(bundle, bundle.bundle.name).and.returnValue(Promise.resolve());
        spyOn(clean, clean.clean.name);
        spyOn(copy, copy.copy.name).and.returnValue(Promise.resolve());
        spyOn(minify, minify.minifyCss.name).and.returnValue(Promise.resolve());
        spyOn(minify, minify.minifyJs.name).and.returnValue(Promise.resolve());
        spyOn(lint, lint.lint.name).and.returnValue(Promise.resolve());
        spyOn(ngc, ngc.ngc.name).and.returnValue(Promise.resolve());
        spyOn(postprocess, postprocess.postprocess.name).and.returnValue(Promise.resolve());
        spyOn(preprocess, preprocess.preprocess.name).and.returnValue(Promise.resolve());
        spyOn(sass, sass.sass.name).and.returnValue(Promise.resolve());
        spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve());
        spyOn(transpile, transpile.transpile.name).and.returnValue(Promise.resolve());
        spyOn(transpile, transpile.getTsConfigAsync.name).and.returnValue(Promise.resolve({
            "options": {
                "sourceMap": true
            }
        }));
        return build.build({}).then(function () {
            expect(transpile.getTsConfigAsync).toHaveBeenCalledTimes(1);
            expect(helpers.readFileAsync).toHaveBeenCalledTimes(1);
        });
    });
});
