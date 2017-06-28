"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lintUtils = require("./lint-utils");
var lintFactory = require("./lint-factory");
var helpers = require("../util/helpers");
var fs = require("fs");
var tsLintLogger = require("../logger/logger-tslint");
var loggerDiagnostics = require("../logger/logger-diagnostics");
describe('lint utils', function () {
    describe('lintFile', function () {
        it('should return lint details', function () {
            // arrange
            var mockLintResults = {
                failures: []
            };
            var mockLinter = {
                lint: function () {
                    return mockLintResults;
                }
            };
            var filePath = '/Users/noone/someFile.ts';
            var fileContent = 'someContent';
            var mockProgram = {};
            spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve(fileContent));
            spyOn(lintFactory, lintFactory.getLinter.name).and.returnValue(mockLinter);
            spyOn(fs, 'openSync').and.returnValue(null);
            spyOn(fs, 'readSync').and.returnValue(null);
            spyOn(fs, 'closeSync').and.returnValue(null);
            // act
            var result = lintUtils.lintFile(null, mockProgram, filePath);
            // assert
            return result.then(function (result) {
                expect(result.filePath).toEqual(filePath);
                expect(result.failures).toEqual(mockLintResults.failures);
                expect(lintFactory.getLinter).toHaveBeenCalledWith(filePath, fileContent, mockProgram);
            });
        });
    });
    describe('processLintResults', function () {
        it('should complete when no files have an error', function () {
            // arrange
            var lintResults = [
                {
                    failures: [],
                    filePath: '/Users/myFileOne.ts'
                },
                {
                    failures: [],
                    filePath: '/Users/myFileTwo.ts'
                }
            ];
            // act
            lintUtils.processLintResults(null, lintResults);
            // assert
        });
        it('should throw an error when one or more file has failures', function () {
            // arrange
            spyOn(loggerDiagnostics, loggerDiagnostics.printDiagnostics.name).and.returnValue(null);
            spyOn(tsLintLogger, tsLintLogger.runTsLintDiagnostics.name).and.returnValue(null);
            var lintResults = [
                {
                    failures: [
                        {}
                    ],
                    filePath: '/Users/myFileOne.ts'
                },
                {
                    failures: [],
                    filePath: '/Users/myFileTwo.ts'
                }
            ];
            var knownError = new Error('Should never get here');
            // act
            try {
                lintUtils.processLintResults(null, lintResults);
                throw knownError;
            }
            catch (ex) {
                expect(loggerDiagnostics.printDiagnostics).toHaveBeenCalledTimes(1);
                expect(loggerDiagnostics.printDiagnostics).toHaveBeenCalledTimes(1);
                expect(ex).not.toEqual(knownError);
            }
        });
    });
});
