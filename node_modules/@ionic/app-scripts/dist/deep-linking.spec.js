"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var deepLinking = require("./deep-linking");
var deeplinkUtils = require("./deep-linking/util");
var Constants = require("./util/constants");
var interfaces_1 = require("./util/interfaces");
var file_cache_1 = require("./util/file-cache");
var helpers = require("./util/helpers");
describe('Deep Linking task', function () {
    describe('deepLinkingWorkerImpl', function () {
        beforeEach(function () {
            deepLinking.reset();
        });
        it('should not update app ngmodule when it has an existing deeplink config', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache()
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue([1]);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(true);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, null);
            return promise.then(function () {
                expect(deepLinking.cachedUnmodifiedAppNgModuleFileContent).toEqual(knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).not.toHaveBeenCalled();
                expect(deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig).not.toHaveBeenCalled();
            });
        });
        it('should not update app ngmodule when no deeplinks were found', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache()
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue([]);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, null);
            return promise.then(function () {
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).not.toHaveBeenCalled();
                expect(deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig).not.toHaveBeenCalled();
            });
        });
        it('should update deeplink config', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                runAot: true
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            var knownMockDeepLinkArray = [1];
            var changedFiles = [];
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue(knownMockDeepLinkArray);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            return promise.then(function () {
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString);
                expect(helpers.getStringPropertyValue).toBeCalledWith(Constants.ENV_APP_NG_MODULE_PATH);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig).toHaveBeenCalledWith(context, knownDeepLinkString, changedFiles, context.runAot);
            });
        });
        it('should update deeplink config on subsequent updates when the deeplink string is different', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                runAot: true
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            var knownDeepLinkString2 = 'someDeepLinkString2';
            var knownMockDeepLinkArray = [1];
            var changedFiles = null;
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue(knownMockDeepLinkArray);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            var hasConvertDeepLinkConfigToStringBeenCalled = false;
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.callFake(function () {
                if (!hasConvertDeepLinkConfigToStringBeenCalled) {
                    hasConvertDeepLinkConfigToStringBeenCalled = true;
                    return knownDeepLinkString;
                }
                return knownDeepLinkString2;
            });
            var spy = spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            return promise.then(function () {
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString);
                expect(helpers.getStringPropertyValue).toBeCalledWith(Constants.ENV_APP_NG_MODULE_PATH);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(spy.calls.first().args[0]).toEqual(context);
                expect(spy.calls.first().args[1]).toEqual(knownDeepLinkString);
                expect(spy.calls.first().args[2]).toEqual(changedFiles);
                expect(spy.calls.first().args[3]).toEqual(context.runAot);
                return deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            }).then(function (result) {
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString2);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledTimes(2);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledTimes(2);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledTimes(2);
                expect(spy).toHaveBeenCalledTimes(2);
                expect(spy.calls.mostRecent().args[0]).toEqual(context);
                expect(spy.calls.mostRecent().args[1]).toEqual(knownDeepLinkString2);
                expect(spy.calls.mostRecent().args[2]).toEqual(changedFiles);
                expect(spy.calls.mostRecent().args[3]).toEqual(context.runAot);
            });
        });
        it('should not update deeplink config on subsequent updates when the deeplink string is the same', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                runAot: true
            };
            var knownFileContent = 'someFileContent';
            var knownDeepLinkString = 'someDeepLinkString';
            var knownMockDeepLinkArray = [1];
            var changedFiles = null;
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue(knownMockDeepLinkArray);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            var spy = spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            return promise.then(function () {
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString);
                expect(helpers.getStringPropertyValue).toBeCalledWith(Constants.ENV_APP_NG_MODULE_PATH);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(spy.calls.first().args[0]).toEqual(context);
                expect(spy.calls.first().args[1]).toEqual(knownDeepLinkString);
                expect(spy.calls.first().args[2]).toEqual(changedFiles);
                expect(spy.calls.first().args[3]).toEqual(context.runAot);
                return deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            }).then(function (result) {
                expect(result).toEqual(knownMockDeepLinkArray);
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledTimes(2);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledTimes(2);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledTimes(2);
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });
        it('should update the deeplink config and cached deeplink string no matter what when the app.module.ts is changed', function () {
            var appNgModulePath = path_1.join('some', 'fake', 'path', 'myApp', 'src', 'app', 'app.module.ts');
            var context = {
                fileCache: new file_cache_1.FileCache(),
                runAot: true
            };
            var knownFileContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { HttpModule } from '@angular/http';\nimport { NgModule, ErrorHandler } from '@angular/core';\n\nimport { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';\n\nimport { InAppBrowser } from '@ionic-native/in-app-browser';\nimport { SplashScreen } from '@ionic-native/splash-screen';\n\nimport { IonicStorageModule } from '@ionic/storage';\n\nimport { ConferenceApp } from './app.component';\n\nimport { ConferenceData } from '../providers/conference-data';\nimport { UserData } from '../providers/user-data';\n\n@NgModule({\n  declarations: [\n    ConferenceApp\n  ],\n  imports: [\n    BrowserModule,\n    HttpModule,\n    IonicModule.forRoot(ConferenceApp, {\n      preloadModules: true\n    }),\n    IonicStorageModule.forRoot()\n  ],\n  bootstrap: [IonicApp],\n  entryComponents: [\n    ConferenceApp\n  ],\n  providers: [\n    { provide: ErrorHandler, useClass: IonicErrorHandler },\n    ConferenceData,\n    UserData,\n    InAppBrowser,\n    SplashScreen\n  ]\n})\nexport class AppModule { }\n";
            var knownFileContent2 = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { HttpModule } from '@angular/http';\nimport { NgModule, ErrorHandler } from '@angular/core';\n\nimport { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';\n\nimport { InAppBrowser } from '@ionic-native/in-app-browser';\nimport { SplashScreen } from '@ionic-native/splash-screen';\n\nimport { IonicStorageModule } from '@ionic/storage';\n\nimport { ConferenceApp } from './app.component';\n\nimport { ConferenceData } from '../providers/conference-data';\nimport { UserData } from '../providers/user-data';\n\n@NgModule({\n  declarations: [\n    ConferenceApp,\n    SomeNewComponent\n  ],\n  imports: [\n    BrowserModule,\n    HttpModule,\n    IonicModule.forRoot(ConferenceApp, {\n      preloadModules: true\n    }),\n    IonicStorageModule.forRoot()\n  ],\n  bootstrap: [IonicApp],\n  entryComponents: [\n    ConferenceApp\n  ],\n  providers: [\n    { provide: ErrorHandler, useClass: IonicErrorHandler },\n    ConferenceData,\n    UserData,\n    InAppBrowser,\n    SplashScreen\n  ]\n})\nexport class AppModule { }\n";
            var knownDeepLinkString = 'someDeepLinkString';
            var knownMockDeepLinkArray = [1];
            var changedFiles = [];
            context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(appNgModulePath);
            spyOn(deeplinkUtils, deeplinkUtils.getDeepLinkData.name).and.returnValue(knownMockDeepLinkArray);
            spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
            spyOn(deeplinkUtils, deeplinkUtils.convertDeepLinkConfigEntriesToString.name).and.returnValue(knownDeepLinkString);
            var spy = spyOn(deeplinkUtils, deeplinkUtils.updateAppNgModuleAndFactoryWithDeepLinkConfig.name);
            var promise = deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            return promise.then(function () {
                expect(deepLinking.cachedUnmodifiedAppNgModuleFileContent).toEqual(knownFileContent);
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString);
                expect(helpers.getStringPropertyValue).toBeCalledWith(Constants.ENV_APP_NG_MODULE_PATH);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(spy.calls.first().args[0]).toEqual(context);
                expect(spy.calls.first().args[1]).toEqual(knownDeepLinkString);
                expect(spy.calls.first().args[2]).toEqual(changedFiles);
                expect(spy.calls.first().args[3]).toEqual(context.runAot);
                // add a changed file to the fray
                changedFiles.push({
                    event: 'change',
                    ext: '.ts',
                    filePath: appNgModulePath
                });
                context.fileCache.set(appNgModulePath, { path: appNgModulePath, content: knownFileContent2 });
                return deepLinking.deepLinkingWorkerImpl(context, changedFiles);
            }).then(function (result) {
                expect(result).toEqual(knownMockDeepLinkArray);
                expect(deepLinking.cachedDeepLinkString).toEqual(knownDeepLinkString);
                expect(deepLinking.cachedUnmodifiedAppNgModuleFileContent).toEqual(knownFileContent2);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledTimes(2);
                expect(deeplinkUtils.getDeepLinkData).toHaveBeenCalledWith(appNgModulePath, context.fileCache, context.runAot);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledTimes(2);
                expect(deeplinkUtils.hasExistingDeepLinkConfig).toHaveBeenCalledWith(appNgModulePath, knownFileContent);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledWith(knownMockDeepLinkArray);
                expect(deeplinkUtils.convertDeepLinkConfigEntriesToString).toHaveBeenCalledTimes(2);
                expect(spy).toHaveBeenCalledTimes(2);
            });
        });
        describe('deepLinkingUpdate', function () {
            it('should clear an existing cached deep link string so it can generate a new one', function () {
                var context = {
                    deepLinkState: interfaces_1.BuildState.RequiresBuild,
                    fileCache: new file_cache_1.FileCache()
                };
                var somePath = 'somePath';
                context.fileCache.set(somePath, { path: somePath, content: 'someContent' });
                var originalCachedDeepLinkString = 'someKnownString';
                deepLinking.setCachedDeepLinkString(originalCachedDeepLinkString);
                spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(somePath);
                spyOn(deeplinkUtils, deeplinkUtils.hasExistingDeepLinkConfig.name).and.returnValue(false);
                var setDeeplinkConfigSpy = spyOn(helpers, helpers.setParsedDeepLinkConfig.name);
                return deepLinking.deepLinkingUpdate([], context).then(function () {
                    expect(setDeeplinkConfigSpy.calls.mostRecent().args[0].length).toEqual(0);
                    expect(deepLinking.cachedDeepLinkString).toEqual(null);
                });
            });
        });
    });
});
