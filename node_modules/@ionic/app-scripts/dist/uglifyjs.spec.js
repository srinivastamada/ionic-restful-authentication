"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var uglifyLib = require("uglify-js");
var helpers = require("./util/helpers");
var uglifyTask = require("./uglifyjs");
describe('uglifyjs', function () {
    describe('uglifyjsWorkerImpl', function () {
        it('should call uglify for the appropriate files', function () {
            var buildDir = path_1.join('some', 'fake', 'dir', 'myApp', 'www', 'build');
            var pathOne = path_1.join(buildDir, '0.main.js');
            var pathOneMap = pathOne + '.map';
            var pathTwo = path_1.join(buildDir, '1.main.js');
            var pathTwoMap = pathTwo + '.map';
            var pathThree = path_1.join(buildDir, 'main.js');
            var pathThreeMap = pathThree + '.map';
            var context = {
                buildDir: buildDir,
                bundledFilePaths: [pathOne, pathOneMap, pathTwo, pathTwoMap, pathThree, pathThreeMap]
            };
            var mockMinfiedResponse = {
                code: 'code',
                map: 'map'
            };
            var mockUglifyConfig = {
                mangle: true,
                compress: true
            };
            var uglifySpy = spyOn(uglifyLib, 'minify').and.returnValue(mockMinfiedResponse);
            var writeFileSpy = spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());
            var promise = uglifyTask.uglifyjsWorkerImpl(context, mockUglifyConfig);
            return promise.then(function () {
                expect(uglifyLib.minify).toHaveBeenCalledTimes(3);
                expect(uglifySpy.calls.all()[0].args[0]).toEqual(pathOne);
                expect(uglifySpy.calls.all()[0].args[1].compress).toEqual(true);
                expect(uglifySpy.calls.all()[0].args[1].mangle).toEqual(true);
                expect(uglifySpy.calls.all()[0].args[1].inSourceMap).toEqual(pathOneMap);
                expect(uglifySpy.calls.all()[0].args[1].outSourceMap).toEqual(pathOneMap);
                expect(uglifySpy.calls.all()[1].args[0]).toEqual(pathTwo);
                expect(uglifySpy.calls.all()[1].args[1].compress).toEqual(true);
                expect(uglifySpy.calls.all()[1].args[1].mangle).toEqual(true);
                expect(uglifySpy.calls.all()[1].args[1].inSourceMap).toEqual(pathTwoMap);
                expect(uglifySpy.calls.all()[1].args[1].outSourceMap).toEqual(pathTwoMap);
                expect(uglifySpy.calls.all()[2].args[0]).toEqual(pathThree);
                expect(uglifySpy.calls.all()[2].args[1].compress).toEqual(true);
                expect(uglifySpy.calls.all()[2].args[1].mangle).toEqual(true);
                expect(uglifySpy.calls.all()[2].args[1].inSourceMap).toEqual(pathThreeMap);
                expect(uglifySpy.calls.all()[2].args[1].outSourceMap).toEqual(pathThreeMap);
                expect(writeFileSpy).toHaveBeenCalledTimes(6);
                expect(writeFileSpy.calls.all()[0].args[0]).toEqual(pathOne);
                expect(writeFileSpy.calls.all()[0].args[1]).toEqual(mockMinfiedResponse.code);
                expect(writeFileSpy.calls.all()[1].args[0]).toEqual(pathOneMap);
                expect(writeFileSpy.calls.all()[1].args[1]).toEqual(mockMinfiedResponse.map);
                expect(writeFileSpy.calls.all()[2].args[0]).toEqual(pathTwo);
                expect(writeFileSpy.calls.all()[2].args[1]).toEqual(mockMinfiedResponse.code);
                expect(writeFileSpy.calls.all()[3].args[0]).toEqual(pathTwoMap);
                expect(writeFileSpy.calls.all()[3].args[1]).toEqual(mockMinfiedResponse.map);
                expect(writeFileSpy.calls.all()[4].args[0]).toEqual(pathThree);
                expect(writeFileSpy.calls.all()[4].args[1]).toEqual(mockMinfiedResponse.code);
                expect(writeFileSpy.calls.all()[5].args[0]).toEqual(pathThreeMap);
                expect(writeFileSpy.calls.all()[5].args[1]).toEqual(mockMinfiedResponse.map);
            });
        });
    });
});
