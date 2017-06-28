"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var file_cache_1 = require("../util/file-cache");
var path_1 = require("path");
var ionic_rollup_resolver_plugin_1 = require("./ionic-rollup-resolver-plugin");
var importer = '/Users/noone/Dev/ionic-conference-app/src/app/app.module.ts';
describe('ion-rollup-resolver', function () {
    describe('resolveId', function () {
        it('should return null when given an undefined/null import', function () {
            // arrange
            // no arrange needed
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId(null, '', null);
            // assert
            expect(result).toEqual(null);
        });
        it('should return null when tsfiles is undefined/null', function () {
            // arrange
            var context = {};
            context.fileCache = null;
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId('importee', importer, context);
            // assert
            expect(result).toEqual(null);
        });
        it('should return null when importer is not found in list of files', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId('importee', importer, context);
            // assert
            expect(result).toEqual(null);
        });
        it('should return null when importer content is null', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: null
            });
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId('importee', importer, context);
            // assert
            expect(result).toEqual(null);
        });
        it('should return null when importer content is empty', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: ''
            });
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId('importee', importer, context);
            // assert
            expect(result).toEqual(null);
        });
        it('should return path to file when file is found with ref to forward dir', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: 'fake irrelevant data'
            });
            var importee = './test-folder';
            var importerBasename = path_1.dirname(importer);
            var importeeFullPath = path_1.resolve(path_1.join(importerBasename, importee)) + '.ts';
            context.fileCache.set(importeeFullPath, {
                path: importeeFullPath,
                content: 'someContent'
            });
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId(importee, importer, context);
            // assert
            expect(result).toEqual(importeeFullPath);
        });
        it('should return path to file when file is found with ref to backward dir', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: 'fake irrelevant data'
            });
            var importee = '../pages/test-folder';
            var importerBasename = path_1.dirname(importer);
            var importeeFullPath = path_1.resolve(path_1.join(importerBasename, importee)) + '.ts';
            context.fileCache.set(importeeFullPath, { path: importeeFullPath, content: null });
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId(importee, importer, context);
            // assert
            expect(result).toEqual(importeeFullPath);
        });
        it('should return path to index file when file is found but index file is for forward path', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: 'fake irrelevant data'
            });
            var importee = './test-folder';
            var importerBasename = path_1.dirname(importer);
            var importeeFullPath = path_1.join(path_1.resolve(path_1.join(importerBasename, importee)), 'index.ts');
            context.fileCache.set(importeeFullPath, { path: importeeFullPath, content: null });
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId(importee, importer, context);
            // assert
            expect(result).toEqual(importeeFullPath);
        });
        it('should return path to index file when file is found but index file is for backward path', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: 'fake irrelevant data'
            });
            var importee = '../pages/test-folder';
            var importerBasename = path_1.dirname(importer);
            var importeeFullPath = path_1.join(path_1.resolve(path_1.join(importerBasename, importee)), 'index.ts');
            context.fileCache.set(importeeFullPath, { path: importeeFullPath, content: null });
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId(importee, importer, context);
            // assert
            expect(result).toEqual(importeeFullPath);
        });
        it('should return null when importee isn\'t found in memory', function () {
            // arrange
            var context = {};
            context.fileCache = new file_cache_1.FileCache();
            context.fileCache.set(importer, {
                path: importer,
                content: 'fake irrelevant data'
            });
            var importee = '../pages/test-folder';
            // act
            var result = ionic_rollup_resolver_plugin_1.resolveId(importee, importer, context);
            // assert
            expect(result).toEqual(null);
        });
    });
});
