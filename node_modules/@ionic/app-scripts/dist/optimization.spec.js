"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var optimization = require("./optimization");
var decorators = require("./optimization/decorators");
var treeshake = require("./optimization/treeshake");
var Constants = require("./util/constants");
var helpers = require("./util/helpers");
var file_cache_1 = require("./util/file-cache");
describe('optimization task', function () {
    describe('doOptimizations', function () {
        it('should not run optimizations unless flags are set', function () {
            // arrange
            var fileCache = new file_cache_1.FileCache();
            fileCache.set('somePath', { path: 'somePath', content: 'someContent' });
            var context = {
                fileCache: fileCache
            };
            spyOn(helpers, helpers.getBooleanPropertyValue.name).and.returnValue(false);
            spyOn(decorators, decorators.purgeStaticFieldDecorators.name);
            spyOn(decorators, decorators.purgeStaticCtorFields.name);
            spyOn(decorators, decorators.purgeTranspiledDecorators.name);
            spyOn(treeshake, treeshake.calculateUnusedComponents.name);
            // act
            var result = optimization.doOptimizations(context, new Map());
            // assert
            expect(result).toBeTruthy();
            expect(decorators.purgeStaticFieldDecorators).not.toHaveBeenCalled();
            expect(decorators.purgeStaticCtorFields).not.toHaveBeenCalled();
            expect(decorators.purgeTranspiledDecorators).not.toHaveBeenCalled();
            expect(treeshake.calculateUnusedComponents).not.toHaveBeenCalled();
        });
    });
    describe('purgeGeneratedFiles', function () {
        it('should remove files in buildDir with suffix from the cache', function () {
            var buildDir = path_1.join(process.cwd(), 'some', 'fake', 'dir', 'myApp', 'www', 'build');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                buildDir: buildDir
            };
            var suffix = 'deptree.js';
            var filePathOne = path_1.join(buildDir, "0." + suffix);
            var filePathTwo = path_1.join(buildDir, "1." + suffix);
            var filePathThree = path_1.join(buildDir, "main.js");
            var filePathFour = path_1.join(buildDir, "main.css");
            var filePathFive = path_1.join(process.cwd(), 'some', 'fake', 'dir', 'myApp', 'src', "app.ts");
            var filePathSix = path_1.join(process.cwd(), 'some', 'fake', 'dir', 'myApp', 'src', "app.js");
            var filePathSeven = path_1.join(process.cwd(), 'some', 'fake', 'dir', 'myApp', 'src', 'pages', "1." + suffix);
            context.fileCache.set(filePathOne, { path: filePathOne, content: filePathOne });
            context.fileCache.set(filePathTwo, { path: filePathTwo, content: filePathTwo });
            context.fileCache.set(filePathThree, { path: filePathThree, content: filePathThree });
            context.fileCache.set(filePathFour, { path: filePathFour, content: filePathFour });
            context.fileCache.set(filePathFive, { path: filePathFive, content: filePathFive });
            context.fileCache.set(filePathSix, { path: filePathSix, content: filePathSix });
            context.fileCache.set(filePathSeven, { path: filePathSeven, content: filePathSeven });
            optimization.purgeGeneratedFiles(context, suffix);
            expect(context.fileCache.getAll().length).toEqual(5);
            expect(context.fileCache.get(filePathOne)).toBeFalsy();
            expect(context.fileCache.get(filePathTwo)).toBeFalsy();
        });
    });
    describe('doOptimizations', function () {
        it('should not manual tree shaking unless the module.js file is in the cache', function () {
            var context = {
                fileCache: new file_cache_1.FileCache(),
            };
            var mockIndexPath = path_1.join('some', 'path', 'myApp', 'node_modules', 'ionic-angular', 'index.js');
            spyOn(treeshake, treeshake.calculateUnusedComponents.name);
            spyOn(treeshake, treeshake.purgeUnusedImportsAndExportsFromModuleFile.name);
            spyOn(treeshake, treeshake.purgeComponentNgFactoryImportAndUsage.name);
            spyOn(treeshake, treeshake.purgeProviderControllerImportAndUsage.name);
            spyOn(treeshake, treeshake.purgeProviderClassNameFromIonicModuleForRoot.name);
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(mockIndexPath);
            spyOn(helpers, helpers.getBooleanPropertyValue.name).and.callFake(function (propertyName) {
                if (propertyName === Constants.ENV_MANUAL_TREESHAKING) {
                    return true;
                }
                return false;
            });
            optimization.doOptimizations(context, new Map());
            expect(treeshake.calculateUnusedComponents).not.toHaveBeenCalled();
            expect(treeshake.purgeUnusedImportsAndExportsFromModuleFile).not.toHaveBeenCalled();
            expect(treeshake.purgeComponentNgFactoryImportAndUsage).not.toHaveBeenCalled();
            expect(treeshake.purgeProviderControllerImportAndUsage).not.toHaveBeenCalled();
            expect(treeshake.purgeProviderClassNameFromIonicModuleForRoot).not.toHaveBeenCalled();
        });
        it('should run manual tree shaking when there is a module.js file in the cache', function () {
            var context = {
                fileCache: new file_cache_1.FileCache(),
            };
            var mockIndexPath = path_1.join('some', 'path', 'myApp', 'node_modules', 'ionic-angular', 'index.js');
            spyOn(treeshake, treeshake.getAppModuleNgFactoryPath.name);
            spyOn(treeshake, treeshake.calculateUnusedComponents.name).and.returnValue({ purgedModules: new Map() });
            spyOn(treeshake, treeshake.purgeUnusedImportsAndExportsFromModuleFile.name);
            spyOn(helpers, helpers.getStringPropertyValue.name).and.callFake(function (propertyName) {
                return mockIndexPath;
            });
            spyOn(helpers, helpers.getBooleanPropertyValue.name).and.callFake(function (propertyName) {
                if (propertyName === Constants.ENV_MANUAL_TREESHAKING) {
                    return true;
                }
                return false;
            });
            context.fileCache.set(mockIndexPath, { path: mockIndexPath, content: 'indexContent' });
            context.fileCache.set(treeshake.getIonicModuleFilePath(), { path: treeshake.getIonicModuleFilePath(), content: 'moduleContent' });
            optimization.doOptimizations(context, new Map());
            expect(treeshake.calculateUnusedComponents).toHaveBeenCalled();
            expect(treeshake.purgeUnusedImportsAndExportsFromModuleFile).toHaveBeenCalled();
        });
    });
});
