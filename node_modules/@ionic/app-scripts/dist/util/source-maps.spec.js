"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var Constants = require("./constants");
var sourceMaps = require("./source-maps");
var helpers = require("./helpers");
describe('source maps', function () {
    describe('purgeSourceMapsIfNeeded', function () {
        it('should return a resolved promise when purging source maps isnt needed', function () {
            // arrange
            var env = {};
            env[Constants.ENV_VAR_GENERATE_SOURCE_MAP] = 'true';
            process.env = env;
            // act
            var resultPromise = sourceMaps.purgeSourceMapsIfNeeded(null);
            // assert
            return resultPromise;
        });
        it('should return a promise call unlink on all files with a .map extensin', function () {
            // arrange
            var env = {};
            env[Constants.ENV_VAR_GENERATE_SOURCE_MAP] = null;
            process.env = env;
            var buildDir = '/some/fake/build/dir';
            var context = { buildDir: buildDir };
            spyOn(helpers, helpers.readDirAsync.name).and.returnValue(Promise.resolve(['test.js', 'test.js.map', 'test2.js', 'test2.js.map']));
            var unlinkSpy = spyOn(helpers, helpers.unlinkAsync.name).and.returnValue(Promise.resolve());
            // act
            var resultPromise = sourceMaps.purgeSourceMapsIfNeeded(context);
            // assert
            return resultPromise.then(function () {
                expect(unlinkSpy.calls.argsFor(0)[0]).toEqual(path_1.join(buildDir, 'test.js.map'));
                expect(unlinkSpy.calls.argsFor(1)[0]).toEqual(path_1.join(buildDir, 'test2.js.map'));
            });
        });
    });
});
