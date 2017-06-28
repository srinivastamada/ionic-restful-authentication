"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lint = require("./lint");
var workerClient = require("./worker-client");
var Constants = require("./util/constants");
var originalEnv = process.env;
describe('lint task', function () {
    describe('lint', function () {
        beforeEach(function () {
            originalEnv = process.env;
            process.env = {};
        });
        afterEach(function () {
            process.env = originalEnv;
        });
        it('Should return resolved promise', function (done) {
            // arrange
            spyOn(workerClient, workerClient.runWorker.name).and.returnValue(Promise.resolve());
            // act
            var promise = lint.lint(null);
            // assert
            promise.then(function () {
                done();
            });
        });
        it('Should return resolved promise when bail on error is not set', function (done) {
            // arrange
            spyOn(workerClient, workerClient.runWorker.name).and.returnValue(Promise.reject(new Error('Simulating an error')));
            // act
            var promise = lint.lint(null);
            // assert
            promise.then(function () {
                done();
            });
        });
        it('Should return rejected promise when bail on error is set', function (done) {
            spyOn(workerClient, workerClient.runWorker.name).and.returnValue(Promise.reject(new Error('Simulating an error')));
            process.env[Constants.ENV_BAIL_ON_LINT_ERROR] = 'true';
            // act
            var promise = lint.lint(null);
            // assert
            promise.catch(function () {
                done();
            });
        });
    });
});
