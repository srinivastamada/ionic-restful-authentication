"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var babili = require("./babili");
var crossSpawn = require("cross-spawn");
describe('babili function', function () {
    beforeEach(function () {
    });
    it('should reject promise when non-zero status code', function () {
        var spawnMock = {
            on: function () { }
        };
        spyOn(crossSpawn, 'spawn').and.returnValue(spawnMock);
        var onSpy = spyOn(spawnMock, 'on');
        var context = {
            nodeModulesDir: '/Users/noone/Projects/ionic-conference-app/node_modules'
        };
        var knownError = 'should never get here';
        var promise = babili.runBabili(context);
        var spawnCallback = onSpy.calls.first().args[1];
        spawnCallback(1);
        return promise.then(function () {
            throw new Error(knownError);
        }).catch(function (err) {
            expect(err.message).not.toEqual(knownError);
        });
    });
    it('should resolve promise when zero status code', function () {
        var spawnMock = {
            on: function () { }
        };
        spyOn(crossSpawn, 'spawn').and.returnValue(spawnMock);
        var onSpy = spyOn(spawnMock, 'on');
        var context = {
            nodeModulesDir: '/Users/noone/Projects/ionic-conference-app/node_modules'
        };
        var promise = babili.runBabili(context);
        var spawnCallback = onSpy.calls.first().args[1];
        spawnCallback(0);
        return promise;
    });
    it('should throw if context does not have a rootDir', function () {
        var context = {};
        var knownError = 'should never get here';
        var promise = babili.runBabili(context);
        return promise.then(function () {
            throw new Error(knownError);
        }).catch(function (err) {
            expect(err.message).not.toEqual(knownError);
        });
    });
});
