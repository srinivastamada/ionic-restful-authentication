"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commonChunksPlugins = require("./common-chunks-plugins");
var path_1 = require("path");
describe('common-chunks-plugins', function () {
    describe('checkIfModuleIsIonicDependency', function () {
        it('should return false when userRequest is null', function () {
            var result = commonChunksPlugins.checkIfModuleIsIonicDependency({});
            expect(result).toEqual(false);
        });
        it('should return false when userRequest is an unknown 3rd party module', function () {
            var result = commonChunksPlugins.checkIfModuleIsIonicDependency({
                userRequest: path_1.join(commonChunksPlugins.NODE_MODULES, 'moment', 'index.js')
            });
            expect(result).toEqual(false);
        });
        it('should return true when userRequest is an known 3rd party module', function () {
            var angularResult = commonChunksPlugins.checkIfModuleIsIonicDependency({
                userRequest: path_1.join(commonChunksPlugins.ANGULAR, 'src', 'something.js')
            });
            var rxjsResult = commonChunksPlugins.checkIfModuleIsIonicDependency({
                userRequest: path_1.join(commonChunksPlugins.RXJS, 'src', 'something.js')
            });
            var ionicResult = commonChunksPlugins.checkIfModuleIsIonicDependency({
                userRequest: path_1.join(commonChunksPlugins.IONIC, 'src', 'something.js')
            });
            var zoneResult = commonChunksPlugins.checkIfModuleIsIonicDependency({
                userRequest: path_1.join(commonChunksPlugins.ZONEJS, 'src', 'something.js')
            });
            expect(angularResult).toEqual(true);
            expect(rxjsResult).toEqual(true);
            expect(ionicResult).toEqual(true);
            expect(zoneResult).toEqual(true);
        });
    });
    describe('checkIfModuleIsNodeModuleButNotIonicDepenedency', function () {
        it('should return false when userRequest is null', function () {
            var result = commonChunksPlugins.checkIfModuleIsNodeModuleButNotIonicDepenedency({});
            expect(result).toEqual(false);
        });
        it('should return true when userRequest is an unknown 3rd party module', function () {
            var result = commonChunksPlugins.checkIfModuleIsNodeModuleButNotIonicDepenedency({
                userRequest: path_1.join(commonChunksPlugins.NODE_MODULES, 'moment', 'index.js')
            });
            expect(result).toEqual(true);
        });
        it('should return false when userRequest is a known 3rd party module', function () {
            var angularResult = commonChunksPlugins.checkIfModuleIsNodeModuleButNotIonicDepenedency({
                userRequest: path_1.join(commonChunksPlugins.ANGULAR, 'src', 'something.js')
            });
            var rxjsResult = commonChunksPlugins.checkIfModuleIsNodeModuleButNotIonicDepenedency({
                userRequest: path_1.join(commonChunksPlugins.RXJS, 'src', 'something.js')
            });
            var ionicResult = commonChunksPlugins.checkIfModuleIsNodeModuleButNotIonicDepenedency({
                userRequest: path_1.join(commonChunksPlugins.IONIC, 'src', 'something.js')
            });
            var zoneResult = commonChunksPlugins.checkIfModuleIsNodeModuleButNotIonicDepenedency({
                userRequest: path_1.join(commonChunksPlugins.ZONEJS, 'src', 'something.js')
            });
            expect(angularResult).toEqual(false);
            expect(rxjsResult).toEqual(false);
            expect(ionicResult).toEqual(false);
            expect(zoneResult).toEqual(false);
        });
    });
});
