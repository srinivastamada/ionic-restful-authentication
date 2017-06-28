"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var webpack = require("./webpack");
var file_cache_1 = require("./util/file-cache");
var helpers = require("./util/helpers");
describe('Webpack Task', function () {
    describe('writeBundleFilesToDisk', function () {
        it('should write all build artifacts to disk except css', function () {
            var appDir = path_1.join('some', 'fake', 'dir', 'myApp');
            var buildDir = path_1.join(appDir, 'www', 'build');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                buildDir: buildDir
            };
            var fileOnePath = path_1.join(buildDir, 'main.js');
            var fileTwoPath = path_1.join(buildDir, 'main.js.map');
            var fileThreePath = path_1.join(buildDir, '0.main.js');
            var fileFourPath = path_1.join(buildDir, '0.main.js.map');
            var fileFivePath = path_1.join(buildDir, '1.main.js');
            var fileSixPath = path_1.join(buildDir, '1.main.js.map');
            var fileSevenPath = path_1.join(appDir, 'pages', 'page-one.ts');
            var fileEightPath = path_1.join(appDir, 'pages', 'page-one.js');
            var fileNinePath = path_1.join(buildDir, 'main.css');
            var fileTenPath = path_1.join(buildDir, 'main.css.map');
            var fileElevenPath = path_1.join(buildDir, 'secondary.css');
            var fileTwelvePath = path_1.join(buildDir, 'secondary.css.map');
            context.fileCache.set(fileOnePath, { path: fileOnePath, content: fileOnePath + 'content' });
            context.fileCache.set(fileTwoPath, { path: fileTwoPath, content: fileTwoPath + 'content' });
            context.fileCache.set(fileThreePath, { path: fileThreePath, content: fileThreePath + 'content' });
            context.fileCache.set(fileFourPath, { path: fileFourPath, content: fileFourPath + 'content' });
            context.fileCache.set(fileFivePath, { path: fileFivePath, content: fileFivePath + 'content' });
            context.fileCache.set(fileSixPath, { path: fileSixPath, content: fileSixPath + 'content' });
            context.fileCache.set(fileSevenPath, { path: fileSevenPath, content: fileSevenPath + 'content' });
            context.fileCache.set(fileEightPath, { path: fileEightPath, content: fileEightPath + 'content' });
            context.fileCache.set(fileNinePath, { path: fileNinePath, content: fileNinePath + 'content' });
            context.fileCache.set(fileTenPath, { path: fileTenPath, content: fileTenPath + 'content' });
            context.fileCache.set(fileElevenPath, { path: fileElevenPath, content: fileElevenPath + 'content' });
            context.fileCache.set(fileTwelvePath, { path: fileTwelvePath, content: fileTwelvePath + 'content' });
            var writeFileSpy = spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());
            var promise = webpack.writeBundleFilesToDisk(context);
            return promise.then(function () {
                expect(writeFileSpy).toHaveBeenCalledTimes(6);
                expect(writeFileSpy.calls.all()[0].args[0]).toEqual(fileOnePath);
                expect(writeFileSpy.calls.all()[0].args[1]).toEqual(fileOnePath + 'content');
                expect(writeFileSpy.calls.all()[1].args[0]).toEqual(fileTwoPath);
                expect(writeFileSpy.calls.all()[1].args[1]).toEqual(fileTwoPath + 'content');
                expect(writeFileSpy.calls.all()[2].args[0]).toEqual(fileThreePath);
                expect(writeFileSpy.calls.all()[2].args[1]).toEqual(fileThreePath + 'content');
                expect(writeFileSpy.calls.all()[3].args[0]).toEqual(fileFourPath);
                expect(writeFileSpy.calls.all()[3].args[1]).toEqual(fileFourPath + 'content');
                expect(writeFileSpy.calls.all()[4].args[0]).toEqual(fileFivePath);
                expect(writeFileSpy.calls.all()[4].args[1]).toEqual(fileFivePath + 'content');
                expect(writeFileSpy.calls.all()[5].args[0]).toEqual(fileSixPath);
                expect(writeFileSpy.calls.all()[5].args[1]).toEqual(fileSixPath + 'content');
            });
        });
        it('should preprend ionic core info', function () {
            var appDir = path_1.join('some', 'fake', 'dir', 'myApp');
            var buildDir = path_1.join(appDir, 'www', 'build');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                buildDir: buildDir,
                outputJsFileName: 'main.js'
            };
            var fileOnePath = path_1.join(buildDir, 'main.js');
            var fileTwoPath = path_1.join(buildDir, 'main.js.map');
            context.fileCache.set(fileOnePath, { path: fileOnePath, content: fileOnePath + 'content' });
            context.fileCache.set(fileTwoPath, { path: fileTwoPath, content: fileTwoPath + 'content' });
            var writeFileSpy = spyOn(helpers, helpers.writeFileAsync.name).and.returnValue(Promise.resolve());
            var promise = webpack.writeBundleFilesToDisk(context);
            return promise.then(function () {
                expect(writeFileSpy).toHaveBeenCalledTimes(2);
                expect(writeFileSpy.calls.all()[0].args[0]).toEqual(fileOnePath);
                expect(writeFileSpy.calls.all()[1].args[0]).toEqual(fileTwoPath);
            });
        });
    });
});
