"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var preprocess = require("./preprocess");
var deeplink = require("./deep-linking");
var helpers = require("./util/helpers");
var optimization = require("./optimization");
describe('Preprocess Task', function () {
    describe('preprocess', function () {
        it('should call deepLink but not optimization or write files to disk', function () {
            // arrange
            var context = {
                optimizeJs: false
            };
            spyOn(deeplink, deeplink.deepLinking.name).and.returnValue(Promise.resolve());
            spyOn(optimization, optimization.optimization.name).and.returnValue(Promise.resolve());
            spyOn(helpers, helpers.getBooleanPropertyValue.name).and.returnValue(false);
            spyOn(preprocess, preprocess.writeFilesToDisk.name).and.returnValue(null);
            // act
            return preprocess.preprocess(context).then(function () {
                // assert
                expect(optimization.optimization).not.toHaveBeenCalled();
                expect(preprocess.writeFilesToDisk).not.toHaveBeenCalledWith();
            });
        });
        it('should call optimization or write files to disk', function () {
            // arrange
            var context = {
                optimizeJs: true
            };
            spyOn(deeplink, deeplink.deepLinking.name).and.returnValue(Promise.resolve());
            spyOn(optimization, optimization.optimization.name).and.returnValue(Promise.resolve());
            spyOn(helpers, helpers.getBooleanPropertyValue.name).and.returnValue(false);
            spyOn(preprocess, preprocess.writeFilesToDisk.name).and.returnValue(null);
            // act
            return preprocess.preprocess(context).then(function () {
                // assert
                expect(optimization.optimization).toHaveBeenCalled();
                expect(preprocess.writeFilesToDisk).not.toHaveBeenCalledWith();
            });
        });
    });
});
