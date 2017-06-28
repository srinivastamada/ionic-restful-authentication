"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var util = require("./util");
var transpile = require("../transpile");
var Constants = require("../util/constants");
var file_cache_1 = require("../util/file-cache");
var helpers = require("../util/helpers");
var tsUtils = require("../util/typescript-utils");
describe('util', function () {
    describe('filterTypescriptFilesForDeepLinks', function () {
        it('should return a list of files that are in the directory specified for deeplinking', function () {
            var pagesDir = path_1.join(process.cwd(), 'myApp', 'src', 'pages');
            var knownFileContent = 'Some string';
            var pageOneTs = path_1.join(pagesDir, 'page-one', 'page-one.ts');
            var pageOneHtml = path_1.join(pagesDir, 'page-one', 'page-one.html');
            var pageOneModule = path_1.join(pagesDir, 'page-one', 'page-one.module.ts');
            var pageTwoTs = path_1.join(pagesDir, 'page-two', 'page-two.ts');
            var pageTwoHtml = path_1.join(pagesDir, 'page-two', 'page-two.html');
            var pageTwoModule = path_1.join(pagesDir, 'page-two', 'page-two.module.ts');
            var pageThreeTs = path_1.join(pagesDir, 'page-three', 'page-three.ts');
            var pageThreeHtml = path_1.join(pagesDir, 'page-three', 'page-three.html');
            var pageThreeModule = path_1.join(pagesDir, 'page-three', 'page-three.module.ts');
            var someOtherFile = path_1.join('Users', 'hans-gruber', 'test.ts');
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageOneTs, { path: pageOneTs, content: knownFileContent });
            fileCache.set(pageOneHtml, { path: pageOneHtml, content: knownFileContent });
            fileCache.set(pageOneModule, { path: pageOneModule, content: knownFileContent });
            fileCache.set(pageTwoTs, { path: pageTwoTs, content: knownFileContent });
            fileCache.set(pageTwoHtml, { path: pageTwoHtml, content: knownFileContent });
            fileCache.set(pageTwoModule, { path: pageTwoModule, content: knownFileContent });
            fileCache.set(pageThreeTs, { path: pageThreeTs, content: knownFileContent });
            fileCache.set(pageThreeHtml, { path: pageThreeHtml, content: knownFileContent });
            fileCache.set(pageThreeModule, { path: pageThreeModule, content: knownFileContent });
            fileCache.set(someOtherFile, { path: someOtherFile, content: knownFileContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValues(pagesDir, '.module.ts');
            var results = util.filterTypescriptFilesForDeepLinks(fileCache);
            expect(results.length).toEqual(3);
            expect(results[0].path).toEqual(pageOneTs);
            expect(results[1].path).toEqual(pageTwoTs);
            expect(results[2].path).toEqual(pageThreeTs);
        });
    });
    describe('parseDeepLinkDecorator', function () {
        it('should return the decorator content from fully hydrated decorator', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  name: 'someName',\n  segment: 'someSegmentBro',\n  defaultHistory: ['page-one', 'page-two'],\n  priority: 'high'\n})\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result.name).toEqual('someName');
            expect(result.segment).toEqual('someSegmentBro');
            expect(result.defaultHistory[0]).toEqual('page-one');
            expect(result.defaultHistory[1]).toEqual('page-two');
            expect(result.priority).toEqual('high');
            expect(knownContent.indexOf(result.rawString)).toBeGreaterThan(-1);
        });
        it('should default to using class name when name is missing', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  segment: 'someSegmentBro',\n  defaultHistory: ['page-one', 'page-two'],\n  priority: 'high'\n})\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result.name).toEqual('HomePage');
            expect(result.segment).toEqual('someSegmentBro');
            expect(result.defaultHistory[0]).toEqual('page-one');
            expect(result.defaultHistory[1]).toEqual('page-two');
            expect(result.priority).toEqual('high');
            expect(knownContent.indexOf(result.rawString)).toBeGreaterThan(-1);
        });
        it('should return null segment when not in decorator', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  defaultHistory: ['page-one', 'page-two'],\n  priority: 'high'\n})\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result.name).toEqual('HomePage');
            expect(result.segment).toEqual('path');
            expect(result.defaultHistory[0]).toEqual('page-one');
            expect(result.defaultHistory[1]).toEqual('page-two');
            expect(result.priority).toEqual('high');
            expect(knownContent.indexOf(result.rawString)).toBeGreaterThan(-1);
        });
        it('should return empty array for defaultHistory when not in decorator', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  priority: 'high'\n})\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'myApp', 'src', 'pages', 'about.ts');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result.name).toEqual('HomePage');
            expect(result.segment).toEqual('about');
            expect(result.defaultHistory).toBeTruthy();
            expect(result.defaultHistory.length).toEqual(0);
            expect(result.priority).toEqual('high');
            expect(knownContent.indexOf(result.rawString)).toBeGreaterThan(-1);
        });
        it('should return priority of low when not in decorator', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n})\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result.name).toEqual('HomePage');
            expect(result.segment).toEqual('path');
            expect(result.defaultHistory).toBeTruthy();
            expect(result.defaultHistory.length).toEqual(0);
            expect(result.priority).toEqual('low');
            expect(knownContent.indexOf(result.rawString)).toBeGreaterThan(-1);
        });
        it('should return correct defaults when no param passed to decorator', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage()\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path.ts');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result.name).toEqual('HomePage');
            expect(result.segment).toEqual('path');
            expect(result.defaultHistory).toBeTruthy();
            expect(result.defaultHistory.length).toEqual(0);
            expect(result.priority).toEqual('low');
            expect(knownContent.indexOf(result.rawString)).toBeGreaterThan(-1);
        });
        it('should throw an error when multiple deeplink decorators are found', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n})\n@IonicPage({\n})\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var knownErrorMsg = 'Should never get here';
            try {
                util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
                throw new Error(knownErrorMsg);
            }
            catch (ex) {
                expect(ex.message).not.toEqual(knownErrorMsg);
            }
        });
        it('should return null when no deeplink decorator is found', function () {
            var knownContent = "\nimport { Component } from '@angular/core';\n\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@Component({\n  selector: 'page-home',\n  template: `\n  <ion-header>\n    <ion-navbar>\n      <ion-title>\n        Ionic Blank\n      </ion-title>\n    </ion-navbar>\n  </ion-header>\n\n  <ion-content padding>\n    The world is your oyster.\n    <p>\n      If you get lost, the <a href=\"http://ionicframework.com/docs/v2\">docs</a> will be your guide.\n    </p>\n    <button ion-button (click)=\"nextPage()\">Next Page</button>\n  </ion-content>\n  `\n})\nexport class HomePage {\n\n  constructor(public navCtrl: NavController) {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageOne');\n    console.log()\n  }\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result).toEqual(null);
        });
        it('should return null when there isn\'t a class declaration', function () {
            var knownContent = "\nimport {\n  CallExpression,\n  createSourceFile,\n  Identifier,\n  ImportClause,\n  ImportDeclaration,\n  ImportSpecifier,\n  NamedImports,\n  Node,\n  ScriptTarget,\n  SourceFile,\n  StringLiteral,\n  SyntaxKind\n} from 'typescript';\n\nimport { rangeReplace, stringSplice } from './helpers';\n\nexport function getTypescriptSourceFile(filePath: string, fileContent: string, languageVersion: ScriptTarget = ScriptTarget.Latest, setParentNodes: boolean = false): SourceFile {\n  return createSourceFile(filePath, fileContent, languageVersion, setParentNodes);\n}\n\nexport function removeDecorators(fileName: string, source: string): string {\n  const sourceFile = createSourceFile(fileName, source, ScriptTarget.Latest);\n  const decorators = findNodes(sourceFile, sourceFile, SyntaxKind.Decorator, true);\n  decorators.sort((a, b) => b.pos - a.pos);\n  decorators.forEach(d => {\n    source = source.slice(0, d.pos) + source.slice(d.end);\n  });\n\n  return source;\n}\n\n      ";
            var knownPath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var sourceFile = tsUtils.getTypescriptSourceFile(knownPath, knownContent);
            var result = util.getDeepLinkDecoratorContentForSourceFile(sourceFile);
            expect(result).toEqual(null);
        });
    });
    describe('getNgModuleDataFromCorrespondingPage', function () {
        it('should call the file cache with the path to an ngmodule', function () {
            var basePath = path_1.join(process.cwd(), 'some', 'fake', 'path');
            var pagePath = path_1.join(basePath, 'my-page', 'my-page.ts');
            var ngModulePath = path_1.join(basePath, 'my-page', 'my-page.module.ts');
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
            var result = util.getNgModulePathFromCorrespondingPage(pagePath);
            expect(result).toEqual(ngModulePath);
        });
    });
    describe('getRelativePathToPageNgModuleFromAppNgModule', function () {
        it('should return the relative path', function () {
            var prefix = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(prefix, 'app', 'app.module.ts');
            var pageNgModulePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.module.ts');
            var result = util.getRelativePathToPageNgModuleFromAppNgModule(appNgModulePath, pageNgModulePath);
            expect(result).toEqual(path_1.join('..', 'pages', 'page-one', 'page-one.module.ts'));
        });
    });
    describe('getNgModuleDataFromPage', function () {
        it('should throw when NgModule is not in cache and create default ngModule flag is off', function () {
            var prefix = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(prefix, 'app', 'app.module.ts');
            var pagePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.ts');
            var knownClassName = 'PageOne';
            var fileCache = new file_cache_1.FileCache();
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
            var knownErrorMsg = 'Should never happen';
            try {
                util.getNgModuleDataFromPage(appNgModulePath, pagePath, knownClassName, fileCache, false);
                throw new Error(knownErrorMsg);
            }
            catch (ex) {
                expect(ex.message).not.toEqual(knownErrorMsg);
            }
        });
        it('should return non-aot adjusted paths when not in AoT', function () {
            var pageNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { IonicPageModule } from 'ionic-angular';\n\nimport { HomePage } from './home';\n\n@NgModule({\n  declarations: [\n    HomePage,\n  ],\n  imports: [\n    IonicPageModule.forChild(HomePage),\n  ]\n})\nexport class HomePageModule {}\n      ";
            var prefix = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(prefix, 'app', 'app.module.ts');
            var pageNgModulePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.module.ts');
            var pagePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.ts');
            var knownClassName = 'PageOne';
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageNgModulePath, { path: pageNgModulePath, content: pageNgModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
            var result = util.getNgModuleDataFromPage(appNgModulePath, pagePath, knownClassName, fileCache, false);
            expect(result.absolutePath).toEqual(pageNgModulePath);
            expect(result.userlandModulePath).toEqual('../pages/page-one/page-one.module');
            expect(result.className).toEqual('HomePageModule');
        });
        it('should return adjusted paths to account for AoT', function () {
            var pageNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { IonicPageModule } from 'ionic-angular';\n\nimport { HomePage } from './home';\n\n@NgModule({\n  declarations: [\n    HomePage,\n  ],\n  imports: [\n    IonicPageModule.forChild(HomePage),\n  ]\n})\nexport class HomePageModule {}\n      ";
            var prefix = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(prefix, 'app', 'app.module.ts');
            var pageNgModulePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.module.ts');
            var pagePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.ts');
            var knownClassName = 'PageOne';
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageNgModulePath, { path: pageNgModulePath, content: pageNgModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
            var result = util.getNgModuleDataFromPage(appNgModulePath, pagePath, knownClassName, fileCache, true);
            expect(result.absolutePath).toEqual(helpers.changeExtension(pageNgModulePath, '.ngfactory.ts'));
            expect(result.userlandModulePath).toEqual('../pages/page-one/page-one.module.ngfactory');
            expect(result.className).toEqual('HomePageModuleNgFactory');
        });
    });
    describe('getDeepLinkData', function () {
        it('should return an empty list when no deep link decorators are found', function () {
            var pageOneContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n\n@Component({\n  selector: 'page-page-one',\n  templateUrl: './page-one.html'\n})\nexport class PageOne {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageTwo');\n  }\n\n  previousPage() {\n    this.navCtrl.pop();\n  }\n\n}\n      ";
            var pageOneNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageOne } from './page-one';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageOne,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageOne)\n  ],\n  entryComponents: [\n    PageOne\n  ]\n})\nexport class PageOneModule {}\n\n      ";
            var pageTwoContent = "\nimport { Component } from '@angular/core';\nimport { LoadingController, ModalController, NavController, PopoverController } from 'ionic-angular';\n\n\n@Component({\n  selector: 'page-page-two',\n  templateUrl: './page-two.html'\n})\nexport class PageTwo {\n\n  constructor(public loadingController: LoadingController, public modalController: ModalController, public navCtrl: NavController, public popoverCtrl: PopoverController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n  showLoader() {\n    const viewController = this.loadingController.create({\n      duration: 2000\n    });\n\n    viewController.present();\n  }\n\n  openModal() {\n    /*const viewController = this.modalController.create('PageThree');\n    viewController.present();\n    */\n\n    const viewController = this.popoverCtrl.create('PageThree');\n    viewController.present();\n\n\n    //this.navCtrl.push('PageThree');\n  }\n}\n\n      ";
            var pageTwoNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageTwo } from './page-two';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageTwo,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageTwo)\n  ]\n})\nexport class PageTwoModule {\n\n}\n      ";
            var pageSettingsContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n/*\n  Generated class for the PageTwo page.\n\n  See http://ionicframework.com/docs/v2/components/#navigation for more info on\n  Ionic pages and navigation.\n*/\n@Component({\n  selector: 'page-three',\n  templateUrl: './page-three.html'\n})\nexport class PageThree {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n}\n\n      ";
            var pageSettingsNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageThree } from './page-three';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageThree,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageThree)\n  ]\n})\nexport class PageThreeModule {\n\n}\n\n      ";
            var prefix = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(prefix, 'app', 'app.module.ts');
            var pageOneNgModulePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.module.ts');
            var pageOnePath = path_1.join(prefix, 'pages', 'page-one', 'page-one.ts');
            var pageTwoNgModulePath = path_1.join(prefix, 'pages', 'page-two', 'page-two.module.ts');
            var pageTwoPath = path_1.join(prefix, 'pages', 'page-two', 'page-two.ts');
            var pageSettingsNgModulePath = path_1.join(prefix, 'pages', 'settings-page', 'settings-page.module.ts');
            var pageSettingsPath = path_1.join(prefix, 'pages', 'settings-page', 'settings-page.ts');
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageOnePath, { path: pageOnePath, content: pageOneContent });
            fileCache.set(pageOneNgModulePath, { path: pageOneNgModulePath, content: pageOneNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageSettingsPath, { path: pageSettingsPath, content: pageSettingsContent });
            fileCache.set(pageSettingsNgModulePath, { path: pageSettingsNgModulePath, content: pageSettingsNgModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue('.module.ts');
            var results = util.getDeepLinkData(appNgModulePath, fileCache, false);
            expect(Array.isArray(results)).toBeTruthy();
            expect(results.length).toEqual(0);
        });
        it('should return an a list of deeplink configs from all pages that have them, and not include pages that dont', function () {
            var pageOneContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n\n@IonicPage({\n  name: 'SomeOtherName'\n})\n@Component({\n  selector: 'page-page-one',\n  templateUrl: './page-one.html'\n})\nexport class PageOne {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageTwo');\n  }\n\n  previousPage() {\n    this.navCtrl.pop();\n  }\n\n}\n      ";
            var pageOneNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageOne } from './page-one';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageOne,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageOne)\n  ],\n  entryComponents: [\n    PageOne\n  ]\n})\nexport class PageOneModule {}\n\n      ";
            var pageTwoContent = "\nimport { Component } from '@angular/core';\nimport { LoadingController, ModalController, NavController, PopoverController } from 'ionic-angular';\n\n\n@Component({\n  selector: 'page-page-two',\n  templateUrl: './page-two.html'\n})\nexport class PageTwo {\n\n  constructor(public loadingController: LoadingController, public modalController: ModalController, public navCtrl: NavController, public popoverCtrl: PopoverController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n  showLoader() {\n    const viewController = this.loadingController.create({\n      duration: 2000\n    });\n\n    viewController.present();\n  }\n\n  openModal() {\n    /*const viewController = this.modalController.create('PageThree');\n    viewController.present();\n    */\n\n    const viewController = this.popoverCtrl.create('PageThree');\n    viewController.present();\n\n\n    //this.navCtrl.push('PageThree');\n  }\n}\n\n      ";
            var pageTwoNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageTwo } from './page-two';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageTwo,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageTwo)\n  ]\n})\nexport class PageTwoModule {\n\n}\n      ";
            var pageSettingsContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  segment: 'someSegmentBro',\n  defaultHistory: ['page-one', 'page-two'],\n  priority: 'high'\n})\n@Component({\n  selector: 'page-three',\n  templateUrl: './page-three.html'\n})\nexport class PageThree {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n}\n\n      ";
            var pageSettingsNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageThree } from './page-three';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageThree,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageThree)\n  ]\n})\nexport class PageThreeModule {\n\n}\n\n      ";
            var srcDir = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(srcDir, 'app', 'app.module.ts');
            var pageOneNgModulePath = path_1.join(srcDir, 'pages', 'page-one', 'page-one.module.ts');
            var pageOnePath = path_1.join(srcDir, 'pages', 'page-one', 'page-one.ts');
            var pageTwoNgModulePath = path_1.join(srcDir, 'pages', 'page-two', 'page-two.module.ts');
            var pageTwoPath = path_1.join(srcDir, 'pages', 'page-two', 'page-two.ts');
            var pageSettingsNgModulePath = path_1.join(srcDir, 'pages', 'settings-page', 'settings-page.module.ts');
            var pageSettingsPath = path_1.join(srcDir, 'pages', 'settings-page', 'settings-page.ts');
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageOnePath, { path: pageOnePath, content: pageOneContent });
            fileCache.set(pageOneNgModulePath, { path: pageOneNgModulePath, content: pageOneNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageSettingsPath, { path: pageSettingsPath, content: pageSettingsContent });
            fileCache.set(pageSettingsNgModulePath, { path: pageSettingsNgModulePath, content: pageSettingsNgModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.callFake(function (input) {
                if (input === Constants.ENV_VAR_DEEPLINKS_DIR) {
                    return srcDir;
                }
                else {
                    return '.module.ts';
                }
            });
            var results = util.getDeepLinkData(appNgModulePath, fileCache, false);
            expect(results.length).toEqual(2);
        });
        it('should return an a list of deeplink configs from all pages that have them', function () {
            var pageOneContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n\n@IonicPage({\n  name: 'SomeOtherName'\n})\n@Component({\n  selector: 'page-page-one',\n  templateUrl: './page-one.html'\n})\nexport class PageOne {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageTwo');\n  }\n\n  previousPage() {\n    this.navCtrl.pop();\n  }\n\n}\n      ";
            var pageOneNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageOne } from './page-one';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageOne,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageOne)\n  ],\n  entryComponents: [\n    PageOne\n  ]\n})\nexport class PageOneModule {}\n\n      ";
            var pageTwoContent = "\nimport { Component } from '@angular/core';\nimport { LoadingController, ModalController, NavController, PopoverController } from 'ionic-angular';\n\n\n\n@Component({\n  selector: 'page-page-two',\n  templateUrl: './page-two.html'\n})\n@IonicPage()\nexport class PageTwo {\n\n  constructor(public loadingController: LoadingController, public modalController: ModalController, public navCtrl: NavController, public popoverCtrl: PopoverController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n  showLoader() {\n    const viewController = this.loadingController.create({\n      duration: 2000\n    });\n\n    viewController.present();\n  }\n\n  openModal() {\n    /*const viewController = this.modalController.create('PageThree');\n    viewController.present();\n    */\n\n    const viewController = this.popoverCtrl.create('PageThree');\n    viewController.present();\n\n\n    //this.navCtrl.push('PageThree');\n  }\n}\n\n      ";
            var pageTwoNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageTwo } from './page-two';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageTwo,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageTwo)\n  ]\n})\nexport class PageTwoModule {\n\n}\n      ";
            var pageSettingsContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  segment: 'someSegmentBro',\n  defaultHistory: ['page-one', 'page-two'],\n  priority: 'high'\n})\n@Component({\n  selector: 'page-three',\n  templateUrl: './page-three.html'\n})\nexport class PageThree {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n}\n\n      ";
            var pageSettingsNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageThree } from './page-three';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageThree,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageThree)\n  ]\n})\nexport class PageThreeModule {\n\n}\n\n      ";
            var srcDir = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(srcDir, 'app', 'app.module.ts');
            var pageOneNgModulePath = path_1.join(srcDir, 'pages', 'page-one', 'page-one.module.ts');
            var pageOnePath = path_1.join(srcDir, 'pages', 'page-one', 'page-one.ts');
            var pageTwoNgModulePath = path_1.join(srcDir, 'pages', 'page-two', 'page-two.module.ts');
            var pageTwoPath = path_1.join(srcDir, 'pages', 'page-two', 'page-two.ts');
            var pageSettingsNgModulePath = path_1.join(srcDir, 'pages', 'settings-page', 'fake-dir', 'settings-page.module.ts');
            var pageSettingsPath = path_1.join(srcDir, 'pages', 'settings-page', 'fake-dir', 'settings-page.ts');
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageOnePath, { path: pageOnePath, content: pageOneContent });
            fileCache.set(pageOneNgModulePath, { path: pageOneNgModulePath, content: pageOneNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageSettingsPath, { path: pageSettingsPath, content: pageSettingsContent });
            fileCache.set(pageSettingsNgModulePath, { path: pageSettingsNgModulePath, content: pageSettingsNgModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.callFake(function (input) {
                if (input === Constants.ENV_VAR_DEEPLINKS_DIR) {
                    return srcDir;
                }
                else {
                    return '.module.ts';
                }
            });
            var results = util.getDeepLinkData(appNgModulePath, fileCache, false);
            expect(results.length).toEqual(3);
            expect(results[0].name).toEqual('SomeOtherName');
            expect(results[0].segment).toEqual('page-one');
            expect(results[0].priority).toEqual('low');
            expect(results[0].defaultHistory.length).toEqual(0);
            expect(results[0].absolutePath).toEqual(path_1.join(srcDir, 'pages', 'page-one', 'page-one.module.ts'));
            expect(results[0].userlandModulePath).toEqual('../pages/page-one/page-one.module');
            expect(results[0].className).toEqual('PageOneModule');
            expect(results[1].name).toEqual('PageTwo');
            expect(results[1].segment).toEqual('page-two');
            expect(results[1].priority).toEqual('low');
            expect(results[1].defaultHistory.length).toEqual(0);
            expect(results[1].absolutePath).toEqual(path_1.join(srcDir, 'pages', 'page-two', 'page-two.module.ts'));
            expect(results[1].userlandModulePath).toEqual('../pages/page-two/page-two.module');
            expect(results[1].className).toEqual('PageTwoModule');
            expect(results[2].name).toEqual('PageThree');
            expect(results[2].segment).toEqual('someSegmentBro');
            expect(results[2].priority).toEqual('high');
            expect(results[2].defaultHistory.length).toEqual(2);
            expect(results[2].defaultHistory[0]).toEqual('page-one');
            expect(results[2].defaultHistory[1]).toEqual('page-two');
            expect(results[2].absolutePath).toEqual(path_1.join(srcDir, 'pages', 'settings-page', 'fake-dir', 'settings-page.module.ts'));
            expect(results[2].userlandModulePath).toEqual('../pages/settings-page/fake-dir/settings-page.module');
            expect(results[2].className).toEqual('PageThreeModule');
        });
        it('should throw when it cant find an NgModule as a peer to the page with a deep link config', function () {
            var pageOneContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n\n@IonicPage({\n  name: 'SomeOtherName'\n})\n@Component({\n  selector: 'page-page-one',\n  templateUrl: './page-one.html'\n})\nexport class PageOne {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  nextPage() {\n    this.navCtrl.push('PageTwo');\n  }\n\n  previousPage() {\n    this.navCtrl.pop();\n  }\n\n}\n      ";
            var pageOneNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageOne } from './page-one';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageOne,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageOne)\n  ],\n  entryComponents: [\n    PageOne\n  ]\n})\nexport class PageOneModule {}\n\n      ";
            var pageTwoContent = "\nimport { Component } from '@angular/core';\nimport { LoadingController, ModalController, NavController, PopoverController } from 'ionic-angular';\n\n\n\n@Component({\n  selector: 'page-page-two',\n  templateUrl: './page-two.html'\n})\n@IonicPage()\nexport class PageTwo {\n\n  constructor(public loadingController: LoadingController, public modalController: ModalController, public navCtrl: NavController, public popoverCtrl: PopoverController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n  showLoader() {\n    const viewController = this.loadingController.create({\n      duration: 2000\n    });\n\n    viewController.present();\n  }\n\n  openModal() {\n    /*const viewController = this.modalController.create('PageThree');\n    viewController.present();\n    */\n\n    const viewController = this.popoverCtrl.create('PageThree');\n    viewController.present();\n\n\n    //this.navCtrl.push('PageThree');\n  }\n}\n\n      ";
            var pageTwoNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageTwo } from './page-two';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageTwo,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageTwo)\n  ]\n})\nexport class PageTwoModule {\n\n}\n      ";
            var pageSettingsContent = "\nimport { Component } from '@angular/core';\nimport { IonicPage, NavController } from 'ionic-angular';\n\n@IonicPage({\n  segment: 'someSegmentBro',\n  defaultHistory: ['page-one', 'page-two'],\n  priority: 'high'\n})\n@Component({\n  selector: 'page-three',\n  templateUrl: './page-three.html'\n})\nexport class PageThree {\n\n  constructor(public navCtrl: NavController) {}\n\n  ionViewDidLoad() {\n  }\n\n  goBack() {\n    this.navCtrl.pop();\n  }\n\n}\n\n      ";
            var pageSettingsNgModuleContent = "\nimport { NgModule } from '@angular/core';\nimport { PageThree } from './page-three';\nimport { IonicPageModule } from 'ionic-angular';\n\n@NgModule({\n  declarations: [\n    PageThree,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageThree)\n  ]\n})\nexport class PageThreeModule {\n\n}\n\n      ";
            var srcDir = path_1.join(process.cwd(), 'myApp', 'src');
            var appNgModulePath = path_1.join(srcDir, 'app', 'app.module.ts');
            var pageOneNgModulePath = path_1.join(srcDir, 'pages', 'page-one', 'page-one.not-module.ts');
            var pageOnePath = path_1.join(srcDir, 'pages', 'page-one', 'page-one.ts');
            var pageTwoNgModulePath = path_1.join(srcDir, 'pages', 'page-two', 'page-two.module.ts');
            var pageTwoPath = path_1.join(srcDir, 'pages', 'page-two', 'page-two.ts');
            var pageSettingsNgModulePath = path_1.join(srcDir, 'pages', 'settings-page', 'fake-dir', 'settings-page.module.ts');
            var pageSettingsPath = path_1.join(srcDir, 'pages', 'settings-page', 'fake-dir', 'settings-page.ts');
            var fileCache = new file_cache_1.FileCache();
            fileCache.set(pageOnePath, { path: pageOnePath, content: pageOneContent });
            fileCache.set(pageOneNgModulePath, { path: pageOneNgModulePath, content: pageOneNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageTwoPath, { path: pageTwoPath, content: pageTwoContent });
            fileCache.set(pageTwoNgModulePath, { path: pageTwoNgModulePath, content: pageTwoNgModuleContent });
            fileCache.set(pageSettingsPath, { path: pageSettingsPath, content: pageSettingsContent });
            fileCache.set(pageSettingsNgModulePath, { path: pageSettingsNgModulePath, content: pageSettingsNgModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.callFake(function (input) {
                if (input === Constants.ENV_VAR_DEEPLINKS_DIR) {
                    return srcDir;
                }
                else {
                    return '.module.ts';
                }
            });
            var knownError = 'should never get here';
            try {
                util.getDeepLinkData(appNgModulePath, fileCache, false);
                throw new Error(knownError);
            }
            catch (ex) {
                expect(ex.message).not.toEqual(knownError);
            }
        });
    });
    describe('hasExistingDeepLinkConfig', function () {
        it('should return true when there is an existing deep link config', function () {
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, {\n      links: [\n        { loadChildren: '../pages/page-one/page-one.module#PageOneModule', name: 'PageOne' },\n        { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo' },\n        { loadChildren: '../pages/page-three/page-three.module#PageThreeModule', name: 'PageThree' }\n      ]\n    }),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = '/idk/yo/some/path';
            var result = util.hasExistingDeepLinkConfig(knownPath, knownContent);
            expect(result).toEqual(true);
        });
        it('should return false when there isnt a deeplink config', function () {
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = path_1.join(process.cwd(), 'idk', 'some', 'fake', 'path');
            var result = util.hasExistingDeepLinkConfig(knownPath, knownContent);
            expect(result).toEqual(false);
        });
        it('should return false when null/undefined is passed in place on deeplink config', function () {
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, null),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = path_1.join(process.cwd(), 'idk', 'some', 'fake', 'path');
            var result = util.hasExistingDeepLinkConfig(knownPath, knownContent);
            expect(result).toEqual(false);
        });
    });
    describe('convertDeepLinkEntryToJsObjectString', function () {
        it('should convert to a flat string format', function () {
            var entry = {
                name: 'HomePage',
                segment: null,
                defaultHistory: [],
                priority: 'low',
                rawString: 'irrelevant for this test',
                absolutePath: path_1.join(process.cwd(), 'myApp', 'pages', 'home-page', 'home-page.module.ts'),
                userlandModulePath: '../pages/home-page/home-page.module',
                className: 'HomePageModule'
            };
            var result = util.convertDeepLinkEntryToJsObjectString(entry);
            expect(result).toEqual("{ loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: null, priority: 'low', defaultHistory: [] }");
        });
        it('should handle defaultHistory entries and segment', function () {
            var entry = {
                name: 'HomePage',
                segment: 'idkMan',
                defaultHistory: ['page-two', 'page-three', 'page-four'],
                priority: 'low',
                rawString: 'irrelevant for this test',
                absolutePath: path_1.join(process.cwd(), 'myApp', 'pages', 'home-page', 'home-page.module.ts'),
                userlandModulePath: '../pages/home-page/home-page.module',
                className: 'HomePageModule'
            };
            var result = util.convertDeepLinkEntryToJsObjectString(entry);
            expect(result).toEqual("{ loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] }");
        });
    });
    describe('convertDeepLinkConfigEntriesToString', function () {
        it('should convert list of decorator data to legacy ionic data structure as a string', function () {
            var list = [];
            list.push({
                name: 'HomePage',
                segment: 'idkMan',
                defaultHistory: ['page-two', 'page-three', 'page-four'],
                priority: 'low',
                rawString: 'irrelevant for this test',
                absolutePath: path_1.join(process.cwd(), 'myApp', 'pages', 'home-page', 'home-page.module.ts'),
                userlandModulePath: '../pages/home-page/home-page.module',
                className: 'HomePageModule'
            });
            list.push({
                name: 'PageTwo',
                segment: null,
                defaultHistory: [],
                priority: 'low',
                rawString: 'irrelevant for this test',
                absolutePath: path_1.join(process.cwd(), 'myApp', 'pages', 'home-page', 'home-page.module.ts'),
                userlandModulePath: '../pages/page-two/page-two.module',
                className: 'PageTwoModule'
            });
            list.push({
                name: 'SettingsPage',
                segment: null,
                defaultHistory: [],
                priority: 'low',
                rawString: 'irrelevant for this test',
                absolutePath: path_1.join(process.cwd(), 'myApp', 'pages', 'home-page', 'home-page.module.ts'),
                userlandModulePath: '../pages/settings-page/setting-page.module',
                className: 'SettingsPageModule'
            });
            var result = util.convertDeepLinkConfigEntriesToString(list);
            expect(result.indexOf('links: [')).toBeGreaterThanOrEqual(0);
            expect(result.indexOf("{ loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },")).toBeGreaterThanOrEqual(0);
            expect(result.indexOf("{ loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },")).toBeGreaterThanOrEqual(0);
            expect(result.indexOf("{ loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }")).toBeGreaterThanOrEqual(0);
        });
    });
    describe('getUpdatedAppNgModuleContentWithDeepLinkConfig', function () {
        it('should add a default argument for the second param of forRoot, then add the deeplink config', function () {
            var knownStringToInject = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var expectedResult = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, {\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = path_1.join('some', 'fake', 'path');
            var result = util.getUpdatedAppNgModuleContentWithDeepLinkConfig(knownPath, knownContent, knownStringToInject);
            expect(result).toEqual(expectedResult);
        });
        it('should append the deeplink config as the third argument when second arg is null', function () {
            var knownStringToInject = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, null),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var expectedResult = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, null, {\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = path_1.join('some', 'fake', 'path');
            var result = util.getUpdatedAppNgModuleContentWithDeepLinkConfig(knownPath, knownContent, knownStringToInject);
            expect(result).toEqual(expectedResult);
        });
        it('should append the deeplink config as the third argument when second arg is object', function () {
            var knownStringToInject = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var expectedResult = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, {\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = path_1.join('some', 'fake', 'path');
            var result = util.getUpdatedAppNgModuleContentWithDeepLinkConfig(knownPath, knownContent, knownStringToInject);
            expect(result).toEqual(expectedResult);
        });
        it('should replace the third argument with deeplink config', function () {
            var knownStringToInject = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var knownContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, null),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var expectedResult = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, {\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n      ";
            var knownPath = path_1.join('some', 'fake', 'path');
            var result = util.getUpdatedAppNgModuleContentWithDeepLinkConfig(knownPath, knownContent, knownStringToInject);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('getUpdatedAppNgModuleFactoryContentWithDeepLinksConfig', function () {
        it('should find and replace the content for DeepLinkConfigToken when existing content is null', function () {
            var knownDeepLinkString = "this._DeepLinkConfigToken_21 = (null as any);";
            var knownContent = "\n/**\n * @fileoverview This file is generated by the Angular template compiler.\n * Do not edit.\n * @suppress {suspiciousCode,uselessCode,missingProperties}\n */\n /* tslint:disable */\n\nimport * as import0 from '@angular/core';\nimport * as import1 from './app.module';\nimport * as import2 from '@angular/common';\nimport * as import3 from '@angular/platform-browser';\nimport * as import4 from '@angular/forms';\nimport * as import5 from 'ionic-angular/index';\nimport * as import6 from '../pages/home/home.module';\nimport * as import7 from 'ionic-angular/platform/dom-controller';\nimport * as import8 from 'ionic-angular/components/menu/menu-controller';\nimport * as import9 from 'ionic-angular/components/app/app';\nimport * as import10 from 'ionic-angular/gestures/gesture-controller';\nimport * as import11 from 'ionic-angular/util/ng-module-loader';\nimport * as import12 from 'ionic-angular/components/action-sheet/action-sheet-controller';\nimport * as import13 from 'ionic-angular/components/alert/alert-controller';\nimport * as import14 from 'ionic-angular/util/events';\nimport * as import15 from 'ionic-angular/util/form';\nimport * as import16 from 'ionic-angular/tap-click/haptic';\nimport * as import17 from 'ionic-angular/platform/keyboard';\nimport * as import18 from 'ionic-angular/components/loading/loading-controller';\nimport * as import19 from 'ionic-angular/components/modal/modal-controller';\nimport * as import20 from 'ionic-angular/components/picker/picker-controller';\nimport * as import21 from 'ionic-angular/components/popover/popover-controller';\nimport * as import22 from 'ionic-angular/tap-click/tap-click';\nimport * as import23 from 'ionic-angular/components/toast/toast-controller';\nimport * as import24 from 'ionic-angular/transitions/transition-controller';\nimport * as import25 from '../../node_modules/ionic-angular/components/action-sheet/action-sheet-component.ngfactory';\nimport * as import26 from '../../node_modules/ionic-angular/components/alert/alert-component.ngfactory';\nimport * as import27 from '../../node_modules/ionic-angular/components/app/app-root.ngfactory';\nimport * as import28 from '../../node_modules/ionic-angular/components/loading/loading-component.ngfactory';\nimport * as import29 from '../../node_modules/ionic-angular/components/modal/modal-component.ngfactory';\nimport * as import30 from '../../node_modules/ionic-angular/components/picker/picker-component.ngfactory';\nimport * as import31 from '../../node_modules/ionic-angular/components/popover/popover-component.ngfactory';\nimport * as import32 from '../../node_modules/ionic-angular/components/toast/toast-component.ngfactory';\nimport * as import33 from '../pages/home/home.ngfactory';\nimport * as import34 from './app.component.ngfactory';\nimport * as import35 from '../pages/home/home';\nimport * as import36 from './app.component';\nimport * as import37 from 'ionic-angular/navigation/url-serializer';\nimport * as import38 from 'ionic-angular/navigation/deep-linker';\nimport * as import39 from 'ionic-angular/platform/platform-registry';\nimport * as import40 from 'ionic-angular/platform/platform';\nimport * as import41 from 'ionic-angular/config/config';\nimport * as import42 from 'ionic-angular/util/module-loader';\nimport * as import43 from 'ionic-angular/config/mode-registry';\nimport * as import44 from 'ionic-angular/components/app/app-root';\nclass AppModuleInjector extends import0.\u0275NgModuleInjector<import1.AppModule> {\n  _CommonModule_0:import2.CommonModule;\n  _ApplicationModule_1:import0.ApplicationModule;\n  _BrowserModule_2:import3.BrowserModule;\n  _\u0275ba_3:import4.\u0275ba;\n  _FormsModule_4:import4.FormsModule;\n  _ReactiveFormsModule_5:import4.ReactiveFormsModule;\n  _IonicModule_6:import5.IonicModule;\n  _IonicPageModule_7:import5.IonicPageModule;\n  _HomePageModule_8:import6.HomePageModule;\n  _AppModule_9:import1.AppModule;\n  __LOCALE_ID_10:any;\n  __NgLocalization_11:import2.NgLocaleLocalization;\n  _ErrorHandler_12:any;\n  _ConfigToken_13:any;\n  _PlatformConfigToken_14:any;\n  _Platform_15:any;\n  _Config_16:any;\n  _DomController_17:import7.DomController;\n  _MenuController_18:import8.MenuController;\n  _App_19:import9.App;\n  _GestureController_20:import10.GestureController;\n  _DeepLinkConfigToken_21:any;\n  _Compiler_22:import0.Compiler;\n  _NgModuleLoader_23:import11.NgModuleLoader;\n  _ModuleLoader_24:any;\n  _APP_INITIALIZER_25:any[];\n  _ApplicationInitStatus_26:import0.ApplicationInitStatus;\n  _\u0275f_27:import0.\u0275f;\n  __ApplicationRef_28:any;\n  __APP_ID_29:any;\n  __IterableDiffers_30:any;\n  __KeyValueDiffers_31:any;\n  __DomSanitizer_32:import3.\u0275e;\n  __Sanitizer_33:any;\n  __HAMMER_GESTURE_CONFIG_34:import3.HammerGestureConfig;\n  __EVENT_MANAGER_PLUGINS_35:any[];\n  __EventManager_36:import3.EventManager;\n  _\u0275DomSharedStylesHost_37:import3.\u0275DomSharedStylesHost;\n  __\u0275DomRendererFactoryV2_38:import3.\u0275DomRendererFactoryV2;\n  __RendererFactoryV2_39:any;\n  __\u0275SharedStylesHost_40:any;\n  __Testability_41:import0.Testability;\n  __Meta_42:import3.Meta;\n  __Title_43:import3.Title;\n  __\u0275i_44:import4.\u0275i;\n  __FormBuilder_45:import4.FormBuilder;\n  __LAZY_LOADED_TOKEN_46:any;\n  __AppRootToken_47:any;\n  __APP_BASE_HREF_48:any;\n  __ActionSheetController_49:import12.ActionSheetController;\n  __AlertController_50:import13.AlertController;\n  __Events_51:import14.Events;\n  __Form_52:import15.Form;\n  __Haptic_53:import16.Haptic;\n  __Keyboard_54:import17.Keyboard;\n  __LoadingController_55:import18.LoadingController;\n  __LocationStrategy_56:any;\n  __Location_57:import2.Location;\n  __UrlSerializer_58:any;\n  __DeepLinker_59:any;\n  __ModalController_60:import19.ModalController;\n  __PickerController_61:import20.PickerController;\n  __PopoverController_62:import21.PopoverController;\n  __TapClick_63:import22.TapClick;\n  __ToastController_64:import23.ToastController;\n  __TransitionController_65:import24.TransitionController;\n  constructor(parent:import0.Injector) {\n    super(parent,[\n      import25.ActionSheetCmpNgFactory,\n      import26.AlertCmpNgFactory,\n      import27.IonicAppNgFactory,\n      import28.LoadingCmpNgFactory,\n      import29.ModalCmpNgFactory,\n      import30.PickerCmpNgFactory,\n      import31.PopoverCmpNgFactory,\n      import32.ToastCmpNgFactory,\n      import33.HomePageNgFactory,\n      import34.MyAppNgFactory\n    ]\n    ,[import27.IonicAppNgFactory]);\n  }\n  get _LOCALE_ID_10():any {\n    if ((this.__LOCALE_ID_10 == null)) { (this.__LOCALE_ID_10 = import0.\u0275o(this.parent.get(import0.LOCALE_ID,(null as any)))); }\n    return this.__LOCALE_ID_10;\n  }\n  get _NgLocalization_11():import2.NgLocaleLocalization {\n    if ((this.__NgLocalization_11 == null)) { (this.__NgLocalization_11 = new import2.NgLocaleLocalization(this._LOCALE_ID_10)); }\n    return this.__NgLocalization_11;\n  }\n  get _ApplicationRef_28():any {\n    if ((this.__ApplicationRef_28 == null)) { (this.__ApplicationRef_28 = this._\u0275f_27); }\n    return this.__ApplicationRef_28;\n  }\n  get _APP_ID_29():any {\n    if ((this.__APP_ID_29 == null)) { (this.__APP_ID_29 = import0.\u0275g()); }\n    return this.__APP_ID_29;\n  }\n  get _IterableDiffers_30():any {\n    if ((this.__IterableDiffers_30 == null)) { (this.__IterableDiffers_30 = import0.\u0275m()); }\n    return this.__IterableDiffers_30;\n  }\n  get _KeyValueDiffers_31():any {\n    if ((this.__KeyValueDiffers_31 == null)) { (this.__KeyValueDiffers_31 = import0.\u0275n()); }\n    return this.__KeyValueDiffers_31;\n  }\n  get _DomSanitizer_32():import3.\u0275e {\n    if ((this.__DomSanitizer_32 == null)) { (this.__DomSanitizer_32 = new import3.\u0275e(this.parent.get(import3.DOCUMENT))); }\n    return this.__DomSanitizer_32;\n  }\n  get _Sanitizer_33():any {\n    if ((this.__Sanitizer_33 == null)) { (this.__Sanitizer_33 = this._DomSanitizer_32); }\n    return this.__Sanitizer_33;\n  }\n  get _HAMMER_GESTURE_CONFIG_34():import3.HammerGestureConfig {\n    if ((this.__HAMMER_GESTURE_CONFIG_34 == null)) { (this.__HAMMER_GESTURE_CONFIG_34 = new import3.HammerGestureConfig()); }\n    return this.__HAMMER_GESTURE_CONFIG_34;\n  }\n  get _EVENT_MANAGER_PLUGINS_35():any[] {\n    if ((this.__EVENT_MANAGER_PLUGINS_35 == null)) { (this.__EVENT_MANAGER_PLUGINS_35 = [\n      new import3.\u0275DomEventsPlugin(this.parent.get(import3.DOCUMENT)),\n      new import3.\u0275KeyEventsPlugin(this.parent.get(import3.DOCUMENT)),\n      new import3.\u0275HammerGesturesPlugin(this.parent.get(import3.DOCUMENT),this._HAMMER_GESTURE_CONFIG_34)\n    ]\n    ); }\n    return this.__EVENT_MANAGER_PLUGINS_35;\n  }\n  get _EventManager_36():import3.EventManager {\n    if ((this.__EventManager_36 == null)) { (this.__EventManager_36 = new import3.EventManager(this._EVENT_MANAGER_PLUGINS_35,this.parent.get(import0.NgZone))); }\n    return this.__EventManager_36;\n  }\n  get _\u0275DomRendererFactoryV2_38():import3.\u0275DomRendererFactoryV2 {\n    if ((this.__\u0275DomRendererFactoryV2_38 == null)) { (this.__\u0275DomRendererFactoryV2_38 = new import3.\u0275DomRendererFactoryV2(this._EventManager_36,this._\u0275DomSharedStylesHost_37)); }\n    return this.__\u0275DomRendererFactoryV2_38;\n  }\n  get _RendererFactoryV2_39():any {\n    if ((this.__RendererFactoryV2_39 == null)) { (this.__RendererFactoryV2_39 = this._\u0275DomRendererFactoryV2_38); }\n    return this.__RendererFactoryV2_39;\n  }\n  get _\u0275SharedStylesHost_40():any {\n    if ((this.__\u0275SharedStylesHost_40 == null)) { (this.__\u0275SharedStylesHost_40 = this._\u0275DomSharedStylesHost_37); }\n    return this.__\u0275SharedStylesHost_40;\n  }\n  get _Testability_41():import0.Testability {\n    if ((this.__Testability_41 == null)) { (this.__Testability_41 = new import0.Testability(this.parent.get(import0.NgZone))); }\n    return this.__Testability_41;\n  }\n  get _Meta_42():import3.Meta {\n    if ((this.__Meta_42 == null)) { (this.__Meta_42 = new import3.Meta(this.parent.get(import3.DOCUMENT))); }\n    return this.__Meta_42;\n  }\n  get _Title_43():import3.Title {\n    if ((this.__Title_43 == null)) { (this.__Title_43 = new import3.Title(this.parent.get(import3.DOCUMENT))); }\n    return this.__Title_43;\n  }\n  get _\u0275i_44():import4.\u0275i {\n    if ((this.__\u0275i_44 == null)) { (this.__\u0275i_44 = new import4.\u0275i()); }\n    return this.__\u0275i_44;\n  }\n  get _FormBuilder_45():import4.FormBuilder {\n    if ((this.__FormBuilder_45 == null)) { (this.__FormBuilder_45 = new import4.FormBuilder()); }\n    return this.__FormBuilder_45;\n  }\n  get _LAZY_LOADED_TOKEN_46():any {\n    if ((this.__LAZY_LOADED_TOKEN_46 == null)) { (this.__LAZY_LOADED_TOKEN_46 = import35.HomePage); }\n    return this.__LAZY_LOADED_TOKEN_46;\n  }\n  get _AppRootToken_47():any {\n    if ((this.__AppRootToken_47 == null)) { (this.__AppRootToken_47 = import36.MyApp); }\n    return this.__AppRootToken_47;\n  }\n  get _APP_BASE_HREF_48():any {\n    if ((this.__APP_BASE_HREF_48 == null)) { (this.__APP_BASE_HREF_48 = '/'); }\n    return this.__APP_BASE_HREF_48;\n  }\n  get _ActionSheetController_49():import12.ActionSheetController {\n    if ((this.__ActionSheetController_49 == null)) { (this.__ActionSheetController_49 = new import12.ActionSheetController(this._App_19,this._Config_16)); }\n    return this.__ActionSheetController_49;\n  }\n  get _AlertController_50():import13.AlertController {\n    if ((this.__AlertController_50 == null)) { (this.__AlertController_50 = new import13.AlertController(this._App_19,this._Config_16)); }\n    return this.__AlertController_50;\n  }\n  get _Events_51():import14.Events {\n    if ((this.__Events_51 == null)) { (this.__Events_51 = new import14.Events()); }\n    return this.__Events_51;\n  }\n  get _Form_52():import15.Form {\n    if ((this.__Form_52 == null)) { (this.__Form_52 = new import15.Form()); }\n    return this.__Form_52;\n  }\n  get _Haptic_53():import16.Haptic {\n    if ((this.__Haptic_53 == null)) { (this.__Haptic_53 = new import16.Haptic(this._Platform_15)); }\n    return this.__Haptic_53;\n  }\n  get _Keyboard_54():import17.Keyboard {\n    if ((this.__Keyboard_54 == null)) { (this.__Keyboard_54 = new import17.Keyboard(this._Config_16,this._Platform_15,this.parent.get(import0.NgZone),this._DomController_17)); }\n    return this.__Keyboard_54;\n  }\n  get _LoadingController_55():import18.LoadingController {\n    if ((this.__LoadingController_55 == null)) { (this.__LoadingController_55 = new import18.LoadingController(this._App_19,this._Config_16)); }\n    return this.__LoadingController_55;\n  }\n  get _LocationStrategy_56():any {\n    if ((this.__LocationStrategy_56 == null)) { (this.__LocationStrategy_56 = import5.provideLocationStrategy(this.parent.get(import2.PlatformLocation),this._APP_BASE_HREF_48,this._Config_16)); }\n    return this.__LocationStrategy_56;\n  }\n  get _Location_57():import2.Location {\n    if ((this.__Location_57 == null)) { (this.__Location_57 = new import2.Location(this._LocationStrategy_56)); }\n    return this.__Location_57;\n  }\n  get _UrlSerializer_58():any {\n    if ((this.__UrlSerializer_58 == null)) { (this.__UrlSerializer_58 = import37.setupUrlSerializer(this._DeepLinkConfigToken_21)); }\n    return this.__UrlSerializer_58;\n  }\n  get _DeepLinker_59():any {\n    if ((this.__DeepLinker_59 == null)) { (this.__DeepLinker_59 = import38.setupDeepLinker(this._App_19,this._UrlSerializer_58,this._Location_57,this._ModuleLoader_24,this)); }\n    return this.__DeepLinker_59;\n  }\n  get _ModalController_60():import19.ModalController {\n    if ((this.__ModalController_60 == null)) { (this.__ModalController_60 = new import19.ModalController(this._App_19,this._Config_16,this._DeepLinker_59)); }\n    return this.__ModalController_60;\n  }\n  get _PickerController_61():import20.PickerController {\n    if ((this.__PickerController_61 == null)) { (this.__PickerController_61 = new import20.PickerController(this._App_19,this._Config_16)); }\n    return this.__PickerController_61;\n  }\n  get _PopoverController_62():import21.PopoverController {\n    if ((this.__PopoverController_62 == null)) { (this.__PopoverController_62 = new import21.PopoverController(this._App_19,this._Config_16,this._DeepLinker_59)); }\n    return this.__PopoverController_62;\n  }\n  get _TapClick_63():import22.TapClick {\n    if ((this.__TapClick_63 == null)) { (this.__TapClick_63 = new import22.TapClick(this._Config_16,this._Platform_15,this._DomController_17,this._App_19,this.parent.get(import0.NgZone),this._GestureController_20)); }\n    return this.__TapClick_63;\n  }\n  get _ToastController_64():import23.ToastController {\n    if ((this.__ToastController_64 == null)) { (this.__ToastController_64 = new import23.ToastController(this._App_19,this._Config_16)); }\n    return this.__ToastController_64;\n  }\n  get _TransitionController_65():import24.TransitionController {\n    if ((this.__TransitionController_65 == null)) { (this.__TransitionController_65 = new import24.TransitionController(this._Platform_15,this._Config_16)); }\n    return this.__TransitionController_65;\n  }\n  createInternal():import1.AppModule {\n    this._CommonModule_0 = new import2.CommonModule();\n    this._ApplicationModule_1 = new import0.ApplicationModule();\n    this._BrowserModule_2 = new import3.BrowserModule(this.parent.get(import3.BrowserModule,(null as any)));\n    this._\u0275ba_3 = new import4.\u0275ba();\n    this._FormsModule_4 = new import4.FormsModule();\n    this._ReactiveFormsModule_5 = new import4.ReactiveFormsModule();\n    this._IonicModule_6 = new import5.IonicModule();\n    this._IonicPageModule_7 = new import5.IonicPageModule();\n    this._HomePageModule_8 = new import6.HomePageModule();\n    this._AppModule_9 = new import1.AppModule();\n    this._ErrorHandler_12 = import3.\u0275a();\n    this._ConfigToken_13 = {};\n    this._PlatformConfigToken_14 = import39.providePlatformConfigs();\n    this._Platform_15 = import40.setupPlatform(this.parent.get(import3.DOCUMENT),this._PlatformConfigToken_14,this.parent.get(import0.NgZone));\n    this._Config_16 = import41.setupConfig(this._ConfigToken_13,this._Platform_15);\n    this._DomController_17 = new import7.DomController(this._Platform_15);\n    this._MenuController_18 = new import8.MenuController();\n    this._App_19 = new import9.App(this._Config_16,this._Platform_15,this._MenuController_18);\n    this._GestureController_20 = new import10.GestureController(this._App_19);\n    " + knownDeepLinkString + "\n    this._Compiler_22 = new import0.Compiler();\n    this._NgModuleLoader_23 = new import11.NgModuleLoader(this._Compiler_22,this.parent.get(import11.NgModuleLoaderConfig,(null as any)));\n    this._ModuleLoader_24 = import42.provideModuleLoader(this._NgModuleLoader_23,this);\n    this._APP_INITIALIZER_25 = [\n      import0.\u0275p,\n      import3.\u0275c(this.parent.get(import3.NgProbeToken,(null as any)),this.parent.get(import0.NgProbeToken,(null as any))),\n      import43.registerModeConfigs(this._Config_16),\n      import14.setupProvideEvents(this._Platform_15,this._DomController_17),\n      import22.setupTapClick(this._Config_16,this._Platform_15,this._DomController_17,this._App_19,this.parent.get(import0.NgZone),this._GestureController_20),\n      import42.setupPreloading(this._Config_16,this._DeepLinkConfigToken_21,this._ModuleLoader_24,this.parent.get(import0.NgZone))\n    ]\n    ;\n    this._ApplicationInitStatus_26 = new import0.ApplicationInitStatus(this._APP_INITIALIZER_25);\n    this._\u0275f_27 = new import0.\u0275f(this.parent.get(import0.NgZone),this.parent.get(import0.\u0275Console),this,this._ErrorHandler_12,this,this._ApplicationInitStatus_26);\n    this._\u0275DomSharedStylesHost_37 = new import3.\u0275DomSharedStylesHost(this.parent.get(import3.DOCUMENT));\n    return this._AppModule_9;\n  }\n  getInternal(token:any,notFoundResult:any):any {\n    if ((token === import2.CommonModule)) { return this._CommonModule_0; }\n    if ((token === import0.ApplicationModule)) { return this._ApplicationModule_1; }\n    if ((token === import3.BrowserModule)) { return this._BrowserModule_2; }\n    if ((token === import4.\u0275ba)) { return this._\u0275ba_3; }\n    if ((token === import4.FormsModule)) { return this._FormsModule_4; }\n    if ((token === import4.ReactiveFormsModule)) { return this._ReactiveFormsModule_5; }\n    if ((token === import5.IonicModule)) { return this._IonicModule_6; }\n    if ((token === import5.IonicPageModule)) { return this._IonicPageModule_7; }\n    if ((token === import6.HomePageModule)) { return this._HomePageModule_8; }\n    if ((token === import1.AppModule)) { return this._AppModule_9; }\n    if ((token === import0.LOCALE_ID)) { return this._LOCALE_ID_10; }\n    if ((token === import2.NgLocalization)) { return this._NgLocalization_11; }\n    if ((token === import0.ErrorHandler)) { return this._ErrorHandler_12; }\n    if ((token === import41.ConfigToken)) { return this._ConfigToken_13; }\n    if ((token === import39.PlatformConfigToken)) { return this._PlatformConfigToken_14; }\n    if ((token === import40.Platform)) { return this._Platform_15; }\n    if ((token === import41.Config)) { return this._Config_16; }\n    if ((token === import7.DomController)) { return this._DomController_17; }\n    if ((token === import8.MenuController)) { return this._MenuController_18; }\n    if ((token === import9.App)) { return this._App_19; }\n    if ((token === import10.GestureController)) { return this._GestureController_20; }\n    if ((token === import37.DeepLinkConfigToken)) { return this._DeepLinkConfigToken_21; }\n    if ((token === import0.Compiler)) { return this._Compiler_22; }\n    if ((token === import11.NgModuleLoader)) { return this._NgModuleLoader_23; }\n    if ((token === import42.ModuleLoader)) { return this._ModuleLoader_24; }\n    if ((token === import0.APP_INITIALIZER)) { return this._APP_INITIALIZER_25; }\n    if ((token === import0.ApplicationInitStatus)) { return this._ApplicationInitStatus_26; }\n    if ((token === import0.\u0275f)) { return this._\u0275f_27; }\n    if ((token === import0.ApplicationRef)) { return this._ApplicationRef_28; }\n    if ((token === import0.APP_ID)) { return this._APP_ID_29; }\n    if ((token === import0.IterableDiffers)) { return this._IterableDiffers_30; }\n    if ((token === import0.KeyValueDiffers)) { return this._KeyValueDiffers_31; }\n    if ((token === import3.DomSanitizer)) { return this._DomSanitizer_32; }\n    if ((token === import0.Sanitizer)) { return this._Sanitizer_33; }\n    if ((token === import3.HAMMER_GESTURE_CONFIG)) { return this._HAMMER_GESTURE_CONFIG_34; }\n    if ((token === import3.EVENT_MANAGER_PLUGINS)) { return this._EVENT_MANAGER_PLUGINS_35; }\n    if ((token === import3.EventManager)) { return this._EventManager_36; }\n    if ((token === import3.\u0275DomSharedStylesHost)) { return this._\u0275DomSharedStylesHost_37; }\n    if ((token === import3.\u0275DomRendererFactoryV2)) { return this._\u0275DomRendererFactoryV2_38; }\n    if ((token === import0.RendererFactoryV2)) { return this._RendererFactoryV2_39; }\n    if ((token === import3.\u0275SharedStylesHost)) { return this._\u0275SharedStylesHost_40; }\n    if ((token === import0.Testability)) { return this._Testability_41; }\n    if ((token === import3.Meta)) { return this._Meta_42; }\n    if ((token === import3.Title)) { return this._Title_43; }\n    if ((token === import4.\u0275i)) { return this._\u0275i_44; }\n    if ((token === import4.FormBuilder)) { return this._FormBuilder_45; }\n    if ((token === import42.LAZY_LOADED_TOKEN)) { return this._LAZY_LOADED_TOKEN_46; }\n    if ((token === import44.AppRootToken)) { return this._AppRootToken_47; }\n    if ((token === import2.APP_BASE_HREF)) { return this._APP_BASE_HREF_48; }\n    if ((token === import12.ActionSheetController)) { return this._ActionSheetController_49; }\n    if ((token === import13.AlertController)) { return this._AlertController_50; }\n    if ((token === import14.Events)) { return this._Events_51; }\n    if ((token === import15.Form)) { return this._Form_52; }\n    if ((token === import16.Haptic)) { return this._Haptic_53; }\n    if ((token === import17.Keyboard)) { return this._Keyboard_54; }\n    if ((token === import18.LoadingController)) { return this._LoadingController_55; }\n    if ((token === import2.LocationStrategy)) { return this._LocationStrategy_56; }\n    if ((token === import2.Location)) { return this._Location_57; }\n    if ((token === import37.UrlSerializer)) { return this._UrlSerializer_58; }\n    if ((token === import38.DeepLinker)) { return this._DeepLinker_59; }\n    if ((token === import19.ModalController)) { return this._ModalController_60; }\n    if ((token === import20.PickerController)) { return this._PickerController_61; }\n    if ((token === import21.PopoverController)) { return this._PopoverController_62; }\n    if ((token === import22.TapClick)) { return this._TapClick_63; }\n    if ((token === import23.ToastController)) { return this._ToastController_64; }\n    if ((token === import24.TransitionController)) { return this._TransitionController_65; }\n    return notFoundResult;\n  }\n  destroyInternal():void {\n    this._\u0275f_27.ngOnDestroy();\n    this._\u0275DomSharedStylesHost_37.ngOnDestroy();\n  }\n}\nexport const AppModuleNgFactory:import0.NgModuleFactory<import1.AppModule> = new import0.NgModuleFactory<any>(AppModuleInjector,import1.AppModule);\n      ";
            var contentToInject = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var expectedDeepLinkString = "this._DeepLinkConfigToken_21 =" + contentToInject;
            var result = util.getUpdatedAppNgModuleFactoryContentWithDeepLinksConfig(knownContent, contentToInject);
            expect(result.indexOf(knownDeepLinkString)).toEqual(-1);
            expect(result.indexOf(expectedDeepLinkString)).toBeGreaterThanOrEqual(0);
        });
    });
    describe('generateDefaultDeepLinkNgModuleContent', function () {
        it('should generate a default NgModule for a DeepLinked component', function () {
            var knownFileContent = "\nimport { NgModule } from '@angular/core';\nimport { IonicPageModule } from 'ionic-angular';\nimport { PageOne } from './page-one';\n\n@NgModule({\n  declarations: [\n    PageOne,\n  ],\n  imports: [\n    IonicPageModule.forChild(PageOne)\n  ]\n})\nexport class PageOneModule {}\n\n";
            var knownFilePath = path_1.join(process.cwd(), 'myApp', 'src', 'pages', 'page-one', 'page-one.ts');
            var knownClassName = 'PageOne';
            var fileContent = util.generateDefaultDeepLinkNgModuleContent(knownFilePath, knownClassName);
            expect(fileContent).toEqual(knownFileContent);
        });
    });
    describe('updateAppNgModuleAndFactoryWithDeepLinkConfig', function () {
        it('should throw when app ng module is not in cache', function () {
            var fileCache = new file_cache_1.FileCache();
            var knownContext = {
                fileCache: fileCache
            };
            var knownDeepLinkString = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var knownAppNgModulePath = path_1.join(process.cwd(), 'myApp', 'src', 'app.module.ts');
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(knownAppNgModulePath);
            spyOn(fileCache, 'get').and.callThrough();
            var knownErrorMsg = 'should never get here';
            try {
                util.updateAppNgModuleAndFactoryWithDeepLinkConfig(knownContext, knownDeepLinkString, null, false);
                throw new Error(knownErrorMsg);
            }
            catch (ex) {
                expect(ex.message).not.toEqual(knownErrorMsg);
                expect(fileCache.get).toHaveBeenCalledWith(knownAppNgModulePath);
            }
        });
        it('should update the cache with updated ts file, transpiled js file and map w/o aot', function () {
            var fileCache = new file_cache_1.FileCache();
            var knownContext = {
                fileCache: fileCache
            };
            var knownDeepLinkString = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var ngModuleContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, null),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n";
            var knownAppNgModulePath = path_1.join(process.cwd(), 'myApp', 'src', 'app.module.ts');
            fileCache.set(knownAppNgModulePath, { path: knownAppNgModulePath, content: ngModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(knownAppNgModulePath);
            spyOn(fileCache, 'get').and.callThrough();
            spyOn(transpile, transpile.transpileTsString.name).and.callFake(function (context, filePath, contentToTranspile) {
                return {
                    sourceMapText: 'sourceMapText',
                    outputText: contentToTranspile
                };
            });
            var changedFiles = [];
            util.updateAppNgModuleAndFactoryWithDeepLinkConfig(knownContext, knownDeepLinkString, changedFiles, false);
            expect(fileCache.getAll().length).toEqual(3);
            expect(fileCache.get(knownAppNgModulePath).content.indexOf(knownDeepLinkString)).toBeGreaterThanOrEqual(0);
            expect(fileCache.get(helpers.changeExtension(knownAppNgModulePath, '.js')).content.indexOf(knownDeepLinkString)).toBeGreaterThanOrEqual(0);
            expect(fileCache.get(helpers.changeExtension(knownAppNgModulePath, '.js.map')).content).toEqual('sourceMapText');
            expect(changedFiles.length).toEqual(1);
            expect(changedFiles[0].event).toEqual('change');
            expect(changedFiles[0].ext).toEqual('.ts');
            expect(changedFiles[0].filePath).toEqual(knownAppNgModulePath);
        });
        it('should throw when ng factory is not in cache', function () {
            var fileCache = new file_cache_1.FileCache();
            var knownContext = {
                fileCache: fileCache
            };
            var knownDeepLinkString = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var ngModuleContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, null),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n";
            var knownAppNgModulePath = path_1.join(process.cwd(), 'myApp', 'src', 'app.module.ts');
            fileCache.set(knownAppNgModulePath, { path: knownAppNgModulePath, content: ngModuleContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(knownAppNgModulePath);
            spyOn(fileCache, 'get').and.callThrough();
            spyOn(transpile, transpile.transpileTsString.name).and.callFake(function (context, filePath, contentToTranspile) {
                return {
                    sourceMapText: 'sourceMapText',
                    outputText: contentToTranspile
                };
            });
            var changedFiles = [];
            var knownErrorMsg = 'should never happen';
            try {
                util.updateAppNgModuleAndFactoryWithDeepLinkConfig(knownContext, knownDeepLinkString, changedFiles, true);
                throw new Error(knownErrorMsg);
            }
            catch (ex) {
                expect(ex.message).not.toEqual(knownErrorMsg);
            }
        });
        it('should update the cache with updated ts file, transpiled js file and map with aot', function () {
            var fileCache = new file_cache_1.FileCache();
            var knownContext = {
                fileCache: fileCache
            };
            var knownDeepLinkString = "{\n  links: [\n    { loadChildren: '../pages/home-page/home-page.module#HomePageModule', name: 'HomePage', segment: 'idkMan', priority: 'low', defaultHistory: ['page-two', 'page-three', 'page-four'] },\n    { loadChildren: '../pages/page-two/page-two.module#PageTwoModule', name: 'PageTwo', segment: null, priority: 'low', defaultHistory: [] },\n    { loadChildren: '../pages/settings-page/setting-page.module#SettingsPageModule', name: 'SettingsPage', segment: null, priority: 'low', defaultHistory: [] }\n  ]\n}\n";
            var ngModuleContent = "\nimport { BrowserModule } from '@angular/platform-browser';\nimport { NgModule } from '@angular/core';\nimport { IonicApp, IonicModule } from 'ionic-angular';\nimport { MyApp } from './app.component';\n\nimport { HomePageModule } from '../pages/home/home.module';\n\n@NgModule({\n  declarations: [\n    MyApp,\n  ],\n  imports: [\n    BrowserModule,\n    IonicModule.forRoot(MyApp, {}, null),\n    HomePageModule,\n  ],\n  bootstrap: [IonicApp],\n  providers: []\n})\nexport class AppModule {}\n";
            var knownNgFactoryContent = "\n/**\n * @fileoverview This file is generated by the Angular template compiler.\n * Do not edit.\n * @suppress {suspiciousCode,uselessCode,missingProperties}\n */\n /* tslint:disable */\n\nimport * as import0 from '@angular/core';\nimport * as import1 from './app.module';\nimport * as import2 from '@angular/common';\nimport * as import3 from '@angular/platform-browser';\nimport * as import4 from '@angular/forms';\nimport * as import5 from 'ionic-angular/index';\nimport * as import6 from '../pages/home/home.module';\nimport * as import7 from 'ionic-angular/platform/dom-controller';\nimport * as import8 from 'ionic-angular/components/menu/menu-controller';\nimport * as import9 from 'ionic-angular/components/app/app';\nimport * as import10 from 'ionic-angular/gestures/gesture-controller';\nimport * as import11 from 'ionic-angular/util/ng-module-loader';\nimport * as import12 from 'ionic-angular/components/action-sheet/action-sheet-controller';\nimport * as import13 from 'ionic-angular/components/alert/alert-controller';\nimport * as import14 from 'ionic-angular/util/events';\nimport * as import15 from 'ionic-angular/util/form';\nimport * as import16 from 'ionic-angular/tap-click/haptic';\nimport * as import17 from 'ionic-angular/platform/keyboard';\nimport * as import18 from 'ionic-angular/components/loading/loading-controller';\nimport * as import19 from 'ionic-angular/components/modal/modal-controller';\nimport * as import20 from 'ionic-angular/components/picker/picker-controller';\nimport * as import21 from 'ionic-angular/components/popover/popover-controller';\nimport * as import22 from 'ionic-angular/tap-click/tap-click';\nimport * as import23 from 'ionic-angular/components/toast/toast-controller';\nimport * as import24 from 'ionic-angular/transitions/transition-controller';\nimport * as import25 from '../../node_modules/ionic-angular/components/action-sheet/action-sheet-component.ngfactory';\nimport * as import26 from '../../node_modules/ionic-angular/components/alert/alert-component.ngfactory';\nimport * as import27 from '../../node_modules/ionic-angular/components/app/app-root.ngfactory';\nimport * as import28 from '../../node_modules/ionic-angular/components/loading/loading-component.ngfactory';\nimport * as import29 from '../../node_modules/ionic-angular/components/modal/modal-component.ngfactory';\nimport * as import30 from '../../node_modules/ionic-angular/components/picker/picker-component.ngfactory';\nimport * as import31 from '../../node_modules/ionic-angular/components/popover/popover-component.ngfactory';\nimport * as import32 from '../../node_modules/ionic-angular/components/toast/toast-component.ngfactory';\nimport * as import33 from '../pages/home/home.ngfactory';\nimport * as import34 from './app.component.ngfactory';\nimport * as import35 from '../pages/home/home';\nimport * as import36 from './app.component';\nimport * as import37 from 'ionic-angular/navigation/url-serializer';\nimport * as import38 from 'ionic-angular/navigation/deep-linker';\nimport * as import39 from 'ionic-angular/platform/platform-registry';\nimport * as import40 from 'ionic-angular/platform/platform';\nimport * as import41 from 'ionic-angular/config/config';\nimport * as import42 from 'ionic-angular/util/module-loader';\nimport * as import43 from 'ionic-angular/config/mode-registry';\nimport * as import44 from 'ionic-angular/components/app/app-root';\nclass AppModuleInjector extends import0.\u0275NgModuleInjector<import1.AppModule> {\n  _CommonModule_0:import2.CommonModule;\n  _ApplicationModule_1:import0.ApplicationModule;\n  _BrowserModule_2:import3.BrowserModule;\n  _\u0275ba_3:import4.\u0275ba;\n  _FormsModule_4:import4.FormsModule;\n  _ReactiveFormsModule_5:import4.ReactiveFormsModule;\n  _IonicModule_6:import5.IonicModule;\n  _IonicPageModule_7:import5.IonicPageModule;\n  _HomePageModule_8:import6.HomePageModule;\n  _AppModule_9:import1.AppModule;\n  __LOCALE_ID_10:any;\n  __NgLocalization_11:import2.NgLocaleLocalization;\n  _ErrorHandler_12:any;\n  _ConfigToken_13:any;\n  _PlatformConfigToken_14:any;\n  _Platform_15:any;\n  _Config_16:any;\n  _DomController_17:import7.DomController;\n  _MenuController_18:import8.MenuController;\n  _App_19:import9.App;\n  _GestureController_20:import10.GestureController;\n  _DeepLinkConfigToken_21:any;\n  _Compiler_22:import0.Compiler;\n  _NgModuleLoader_23:import11.NgModuleLoader;\n  _ModuleLoader_24:any;\n  _APP_INITIALIZER_25:any[];\n  _ApplicationInitStatus_26:import0.ApplicationInitStatus;\n  _\u0275f_27:import0.\u0275f;\n  __ApplicationRef_28:any;\n  __APP_ID_29:any;\n  __IterableDiffers_30:any;\n  __KeyValueDiffers_31:any;\n  __DomSanitizer_32:import3.\u0275e;\n  __Sanitizer_33:any;\n  __HAMMER_GESTURE_CONFIG_34:import3.HammerGestureConfig;\n  __EVENT_MANAGER_PLUGINS_35:any[];\n  __EventManager_36:import3.EventManager;\n  _\u0275DomSharedStylesHost_37:import3.\u0275DomSharedStylesHost;\n  __\u0275DomRendererFactoryV2_38:import3.\u0275DomRendererFactoryV2;\n  __RendererFactoryV2_39:any;\n  __\u0275SharedStylesHost_40:any;\n  __Testability_41:import0.Testability;\n  __Meta_42:import3.Meta;\n  __Title_43:import3.Title;\n  __\u0275i_44:import4.\u0275i;\n  __FormBuilder_45:import4.FormBuilder;\n  __LAZY_LOADED_TOKEN_46:any;\n  __AppRootToken_47:any;\n  __APP_BASE_HREF_48:any;\n  __ActionSheetController_49:import12.ActionSheetController;\n  __AlertController_50:import13.AlertController;\n  __Events_51:import14.Events;\n  __Form_52:import15.Form;\n  __Haptic_53:import16.Haptic;\n  __Keyboard_54:import17.Keyboard;\n  __LoadingController_55:import18.LoadingController;\n  __LocationStrategy_56:any;\n  __Location_57:import2.Location;\n  __UrlSerializer_58:any;\n  __DeepLinker_59:any;\n  __ModalController_60:import19.ModalController;\n  __PickerController_61:import20.PickerController;\n  __PopoverController_62:import21.PopoverController;\n  __TapClick_63:import22.TapClick;\n  __ToastController_64:import23.ToastController;\n  __TransitionController_65:import24.TransitionController;\n  constructor(parent:import0.Injector) {\n    super(parent,[\n      import25.ActionSheetCmpNgFactory,\n      import26.AlertCmpNgFactory,\n      import27.IonicAppNgFactory,\n      import28.LoadingCmpNgFactory,\n      import29.ModalCmpNgFactory,\n      import30.PickerCmpNgFactory,\n      import31.PopoverCmpNgFactory,\n      import32.ToastCmpNgFactory,\n      import33.HomePageNgFactory,\n      import34.MyAppNgFactory\n    ]\n    ,[import27.IonicAppNgFactory]);\n  }\n  get _LOCALE_ID_10():any {\n    if ((this.__LOCALE_ID_10 == null)) { (this.__LOCALE_ID_10 = import0.\u0275o(this.parent.get(import0.LOCALE_ID,(null as any)))); }\n    return this.__LOCALE_ID_10;\n  }\n  get _NgLocalization_11():import2.NgLocaleLocalization {\n    if ((this.__NgLocalization_11 == null)) { (this.__NgLocalization_11 = new import2.NgLocaleLocalization(this._LOCALE_ID_10)); }\n    return this.__NgLocalization_11;\n  }\n  get _ApplicationRef_28():any {\n    if ((this.__ApplicationRef_28 == null)) { (this.__ApplicationRef_28 = this._\u0275f_27); }\n    return this.__ApplicationRef_28;\n  }\n  get _APP_ID_29():any {\n    if ((this.__APP_ID_29 == null)) { (this.__APP_ID_29 = import0.\u0275g()); }\n    return this.__APP_ID_29;\n  }\n  get _IterableDiffers_30():any {\n    if ((this.__IterableDiffers_30 == null)) { (this.__IterableDiffers_30 = import0.\u0275m()); }\n    return this.__IterableDiffers_30;\n  }\n  get _KeyValueDiffers_31():any {\n    if ((this.__KeyValueDiffers_31 == null)) { (this.__KeyValueDiffers_31 = import0.\u0275n()); }\n    return this.__KeyValueDiffers_31;\n  }\n  get _DomSanitizer_32():import3.\u0275e {\n    if ((this.__DomSanitizer_32 == null)) { (this.__DomSanitizer_32 = new import3.\u0275e(this.parent.get(import3.DOCUMENT))); }\n    return this.__DomSanitizer_32;\n  }\n  get _Sanitizer_33():any {\n    if ((this.__Sanitizer_33 == null)) { (this.__Sanitizer_33 = this._DomSanitizer_32); }\n    return this.__Sanitizer_33;\n  }\n  get _HAMMER_GESTURE_CONFIG_34():import3.HammerGestureConfig {\n    if ((this.__HAMMER_GESTURE_CONFIG_34 == null)) { (this.__HAMMER_GESTURE_CONFIG_34 = new import3.HammerGestureConfig()); }\n    return this.__HAMMER_GESTURE_CONFIG_34;\n  }\n  get _EVENT_MANAGER_PLUGINS_35():any[] {\n    if ((this.__EVENT_MANAGER_PLUGINS_35 == null)) { (this.__EVENT_MANAGER_PLUGINS_35 = [\n      new import3.\u0275DomEventsPlugin(this.parent.get(import3.DOCUMENT)),\n      new import3.\u0275KeyEventsPlugin(this.parent.get(import3.DOCUMENT)),\n      new import3.\u0275HammerGesturesPlugin(this.parent.get(import3.DOCUMENT),this._HAMMER_GESTURE_CONFIG_34)\n    ]\n    ); }\n    return this.__EVENT_MANAGER_PLUGINS_35;\n  }\n  get _EventManager_36():import3.EventManager {\n    if ((this.__EventManager_36 == null)) { (this.__EventManager_36 = new import3.EventManager(this._EVENT_MANAGER_PLUGINS_35,this.parent.get(import0.NgZone))); }\n    return this.__EventManager_36;\n  }\n  get _\u0275DomRendererFactoryV2_38():import3.\u0275DomRendererFactoryV2 {\n    if ((this.__\u0275DomRendererFactoryV2_38 == null)) { (this.__\u0275DomRendererFactoryV2_38 = new import3.\u0275DomRendererFactoryV2(this._EventManager_36,this._\u0275DomSharedStylesHost_37)); }\n    return this.__\u0275DomRendererFactoryV2_38;\n  }\n  get _RendererFactoryV2_39():any {\n    if ((this.__RendererFactoryV2_39 == null)) { (this.__RendererFactoryV2_39 = this._\u0275DomRendererFactoryV2_38); }\n    return this.__RendererFactoryV2_39;\n  }\n  get _\u0275SharedStylesHost_40():any {\n    if ((this.__\u0275SharedStylesHost_40 == null)) { (this.__\u0275SharedStylesHost_40 = this._\u0275DomSharedStylesHost_37); }\n    return this.__\u0275SharedStylesHost_40;\n  }\n  get _Testability_41():import0.Testability {\n    if ((this.__Testability_41 == null)) { (this.__Testability_41 = new import0.Testability(this.parent.get(import0.NgZone))); }\n    return this.__Testability_41;\n  }\n  get _Meta_42():import3.Meta {\n    if ((this.__Meta_42 == null)) { (this.__Meta_42 = new import3.Meta(this.parent.get(import3.DOCUMENT))); }\n    return this.__Meta_42;\n  }\n  get _Title_43():import3.Title {\n    if ((this.__Title_43 == null)) { (this.__Title_43 = new import3.Title(this.parent.get(import3.DOCUMENT))); }\n    return this.__Title_43;\n  }\n  get _\u0275i_44():import4.\u0275i {\n    if ((this.__\u0275i_44 == null)) { (this.__\u0275i_44 = new import4.\u0275i()); }\n    return this.__\u0275i_44;\n  }\n  get _FormBuilder_45():import4.FormBuilder {\n    if ((this.__FormBuilder_45 == null)) { (this.__FormBuilder_45 = new import4.FormBuilder()); }\n    return this.__FormBuilder_45;\n  }\n  get _LAZY_LOADED_TOKEN_46():any {\n    if ((this.__LAZY_LOADED_TOKEN_46 == null)) { (this.__LAZY_LOADED_TOKEN_46 = import35.HomePage); }\n    return this.__LAZY_LOADED_TOKEN_46;\n  }\n  get _AppRootToken_47():any {\n    if ((this.__AppRootToken_47 == null)) { (this.__AppRootToken_47 = import36.MyApp); }\n    return this.__AppRootToken_47;\n  }\n  get _APP_BASE_HREF_48():any {\n    if ((this.__APP_BASE_HREF_48 == null)) { (this.__APP_BASE_HREF_48 = '/'); }\n    return this.__APP_BASE_HREF_48;\n  }\n  get _ActionSheetController_49():import12.ActionSheetController {\n    if ((this.__ActionSheetController_49 == null)) { (this.__ActionSheetController_49 = new import12.ActionSheetController(this._App_19,this._Config_16)); }\n    return this.__ActionSheetController_49;\n  }\n  get _AlertController_50():import13.AlertController {\n    if ((this.__AlertController_50 == null)) { (this.__AlertController_50 = new import13.AlertController(this._App_19,this._Config_16)); }\n    return this.__AlertController_50;\n  }\n  get _Events_51():import14.Events {\n    if ((this.__Events_51 == null)) { (this.__Events_51 = new import14.Events()); }\n    return this.__Events_51;\n  }\n  get _Form_52():import15.Form {\n    if ((this.__Form_52 == null)) { (this.__Form_52 = new import15.Form()); }\n    return this.__Form_52;\n  }\n  get _Haptic_53():import16.Haptic {\n    if ((this.__Haptic_53 == null)) { (this.__Haptic_53 = new import16.Haptic(this._Platform_15)); }\n    return this.__Haptic_53;\n  }\n  get _Keyboard_54():import17.Keyboard {\n    if ((this.__Keyboard_54 == null)) { (this.__Keyboard_54 = new import17.Keyboard(this._Config_16,this._Platform_15,this.parent.get(import0.NgZone),this._DomController_17)); }\n    return this.__Keyboard_54;\n  }\n  get _LoadingController_55():import18.LoadingController {\n    if ((this.__LoadingController_55 == null)) { (this.__LoadingController_55 = new import18.LoadingController(this._App_19,this._Config_16)); }\n    return this.__LoadingController_55;\n  }\n  get _LocationStrategy_56():any {\n    if ((this.__LocationStrategy_56 == null)) { (this.__LocationStrategy_56 = import5.provideLocationStrategy(this.parent.get(import2.PlatformLocation),this._APP_BASE_HREF_48,this._Config_16)); }\n    return this.__LocationStrategy_56;\n  }\n  get _Location_57():import2.Location {\n    if ((this.__Location_57 == null)) { (this.__Location_57 = new import2.Location(this._LocationStrategy_56)); }\n    return this.__Location_57;\n  }\n  get _UrlSerializer_58():any {\n    if ((this.__UrlSerializer_58 == null)) { (this.__UrlSerializer_58 = import37.setupUrlSerializer(this._DeepLinkConfigToken_21)); }\n    return this.__UrlSerializer_58;\n  }\n  get _DeepLinker_59():any {\n    if ((this.__DeepLinker_59 == null)) { (this.__DeepLinker_59 = import38.setupDeepLinker(this._App_19,this._UrlSerializer_58,this._Location_57,this._ModuleLoader_24,this)); }\n    return this.__DeepLinker_59;\n  }\n  get _ModalController_60():import19.ModalController {\n    if ((this.__ModalController_60 == null)) { (this.__ModalController_60 = new import19.ModalController(this._App_19,this._Config_16,this._DeepLinker_59)); }\n    return this.__ModalController_60;\n  }\n  get _PickerController_61():import20.PickerController {\n    if ((this.__PickerController_61 == null)) { (this.__PickerController_61 = new import20.PickerController(this._App_19,this._Config_16)); }\n    return this.__PickerController_61;\n  }\n  get _PopoverController_62():import21.PopoverController {\n    if ((this.__PopoverController_62 == null)) { (this.__PopoverController_62 = new import21.PopoverController(this._App_19,this._Config_16,this._DeepLinker_59)); }\n    return this.__PopoverController_62;\n  }\n  get _TapClick_63():import22.TapClick {\n    if ((this.__TapClick_63 == null)) { (this.__TapClick_63 = new import22.TapClick(this._Config_16,this._Platform_15,this._DomController_17,this._App_19,this.parent.get(import0.NgZone),this._GestureController_20)); }\n    return this.__TapClick_63;\n  }\n  get _ToastController_64():import23.ToastController {\n    if ((this.__ToastController_64 == null)) { (this.__ToastController_64 = new import23.ToastController(this._App_19,this._Config_16)); }\n    return this.__ToastController_64;\n  }\n  get _TransitionController_65():import24.TransitionController {\n    if ((this.__TransitionController_65 == null)) { (this.__TransitionController_65 = new import24.TransitionController(this._Platform_15,this._Config_16)); }\n    return this.__TransitionController_65;\n  }\n  createInternal():import1.AppModule {\n    this._CommonModule_0 = new import2.CommonModule();\n    this._ApplicationModule_1 = new import0.ApplicationModule();\n    this._BrowserModule_2 = new import3.BrowserModule(this.parent.get(import3.BrowserModule,(null as any)));\n    this._\u0275ba_3 = new import4.\u0275ba();\n    this._FormsModule_4 = new import4.FormsModule();\n    this._ReactiveFormsModule_5 = new import4.ReactiveFormsModule();\n    this._IonicModule_6 = new import5.IonicModule();\n    this._IonicPageModule_7 = new import5.IonicPageModule();\n    this._HomePageModule_8 = new import6.HomePageModule();\n    this._AppModule_9 = new import1.AppModule();\n    this._ErrorHandler_12 = import3.\u0275a();\n    this._ConfigToken_13 = {};\n    this._PlatformConfigToken_14 = import39.providePlatformConfigs();\n    this._Platform_15 = import40.setupPlatform(this.parent.get(import3.DOCUMENT),this._PlatformConfigToken_14,this.parent.get(import0.NgZone));\n    this._Config_16 = import41.setupConfig(this._ConfigToken_13,this._Platform_15);\n    this._DomController_17 = new import7.DomController(this._Platform_15);\n    this._MenuController_18 = new import8.MenuController();\n    this._App_19 = new import9.App(this._Config_16,this._Platform_15,this._MenuController_18);\n    this._GestureController_20 = new import10.GestureController(this._App_19);\n    this._DeepLinkConfigToken_21 = (null as any);\n    this._Compiler_22 = new import0.Compiler();\n    this._NgModuleLoader_23 = new import11.NgModuleLoader(this._Compiler_22,this.parent.get(import11.NgModuleLoaderConfig,(null as any)));\n    this._ModuleLoader_24 = import42.provideModuleLoader(this._NgModuleLoader_23,this);\n    this._APP_INITIALIZER_25 = [\n      import0.\u0275p,\n      import3.\u0275c(this.parent.get(import3.NgProbeToken,(null as any)),this.parent.get(import0.NgProbeToken,(null as any))),\n      import43.registerModeConfigs(this._Config_16),\n      import14.setupProvideEvents(this._Platform_15,this._DomController_17),\n      import22.setupTapClick(this._Config_16,this._Platform_15,this._DomController_17,this._App_19,this.parent.get(import0.NgZone),this._GestureController_20),\n      import42.setupPreloading(this._Config_16,this._DeepLinkConfigToken_21,this._ModuleLoader_24,this.parent.get(import0.NgZone))\n    ]\n    ;\n    this._ApplicationInitStatus_26 = new import0.ApplicationInitStatus(this._APP_INITIALIZER_25);\n    this._\u0275f_27 = new import0.\u0275f(this.parent.get(import0.NgZone),this.parent.get(import0.\u0275Console),this,this._ErrorHandler_12,this,this._ApplicationInitStatus_26);\n    this._\u0275DomSharedStylesHost_37 = new import3.\u0275DomSharedStylesHost(this.parent.get(import3.DOCUMENT));\n    return this._AppModule_9;\n  }\n  getInternal(token:any,notFoundResult:any):any {\n    if ((token === import2.CommonModule)) { return this._CommonModule_0; }\n    if ((token === import0.ApplicationModule)) { return this._ApplicationModule_1; }\n    if ((token === import3.BrowserModule)) { return this._BrowserModule_2; }\n    if ((token === import4.\u0275ba)) { return this._\u0275ba_3; }\n    if ((token === import4.FormsModule)) { return this._FormsModule_4; }\n    if ((token === import4.ReactiveFormsModule)) { return this._ReactiveFormsModule_5; }\n    if ((token === import5.IonicModule)) { return this._IonicModule_6; }\n    if ((token === import5.IonicPageModule)) { return this._IonicPageModule_7; }\n    if ((token === import6.HomePageModule)) { return this._HomePageModule_8; }\n    if ((token === import1.AppModule)) { return this._AppModule_9; }\n    if ((token === import0.LOCALE_ID)) { return this._LOCALE_ID_10; }\n    if ((token === import2.NgLocalization)) { return this._NgLocalization_11; }\n    if ((token === import0.ErrorHandler)) { return this._ErrorHandler_12; }\n    if ((token === import41.ConfigToken)) { return this._ConfigToken_13; }\n    if ((token === import39.PlatformConfigToken)) { return this._PlatformConfigToken_14; }\n    if ((token === import40.Platform)) { return this._Platform_15; }\n    if ((token === import41.Config)) { return this._Config_16; }\n    if ((token === import7.DomController)) { return this._DomController_17; }\n    if ((token === import8.MenuController)) { return this._MenuController_18; }\n    if ((token === import9.App)) { return this._App_19; }\n    if ((token === import10.GestureController)) { return this._GestureController_20; }\n    if ((token === import37.DeepLinkConfigToken)) { return this._DeepLinkConfigToken_21; }\n    if ((token === import0.Compiler)) { return this._Compiler_22; }\n    if ((token === import11.NgModuleLoader)) { return this._NgModuleLoader_23; }\n    if ((token === import42.ModuleLoader)) { return this._ModuleLoader_24; }\n    if ((token === import0.APP_INITIALIZER)) { return this._APP_INITIALIZER_25; }\n    if ((token === import0.ApplicationInitStatus)) { return this._ApplicationInitStatus_26; }\n    if ((token === import0.\u0275f)) { return this._\u0275f_27; }\n    if ((token === import0.ApplicationRef)) { return this._ApplicationRef_28; }\n    if ((token === import0.APP_ID)) { return this._APP_ID_29; }\n    if ((token === import0.IterableDiffers)) { return this._IterableDiffers_30; }\n    if ((token === import0.KeyValueDiffers)) { return this._KeyValueDiffers_31; }\n    if ((token === import3.DomSanitizer)) { return this._DomSanitizer_32; }\n    if ((token === import0.Sanitizer)) { return this._Sanitizer_33; }\n    if ((token === import3.HAMMER_GESTURE_CONFIG)) { return this._HAMMER_GESTURE_CONFIG_34; }\n    if ((token === import3.EVENT_MANAGER_PLUGINS)) { return this._EVENT_MANAGER_PLUGINS_35; }\n    if ((token === import3.EventManager)) { return this._EventManager_36; }\n    if ((token === import3.\u0275DomSharedStylesHost)) { return this._\u0275DomSharedStylesHost_37; }\n    if ((token === import3.\u0275DomRendererFactoryV2)) { return this._\u0275DomRendererFactoryV2_38; }\n    if ((token === import0.RendererFactoryV2)) { return this._RendererFactoryV2_39; }\n    if ((token === import3.\u0275SharedStylesHost)) { return this._\u0275SharedStylesHost_40; }\n    if ((token === import0.Testability)) { return this._Testability_41; }\n    if ((token === import3.Meta)) { return this._Meta_42; }\n    if ((token === import3.Title)) { return this._Title_43; }\n    if ((token === import4.\u0275i)) { return this._\u0275i_44; }\n    if ((token === import4.FormBuilder)) { return this._FormBuilder_45; }\n    if ((token === import42.LAZY_LOADED_TOKEN)) { return this._LAZY_LOADED_TOKEN_46; }\n    if ((token === import44.AppRootToken)) { return this._AppRootToken_47; }\n    if ((token === import2.APP_BASE_HREF)) { return this._APP_BASE_HREF_48; }\n    if ((token === import12.ActionSheetController)) { return this._ActionSheetController_49; }\n    if ((token === import13.AlertController)) { return this._AlertController_50; }\n    if ((token === import14.Events)) { return this._Events_51; }\n    if ((token === import15.Form)) { return this._Form_52; }\n    if ((token === import16.Haptic)) { return this._Haptic_53; }\n    if ((token === import17.Keyboard)) { return this._Keyboard_54; }\n    if ((token === import18.LoadingController)) { return this._LoadingController_55; }\n    if ((token === import2.LocationStrategy)) { return this._LocationStrategy_56; }\n    if ((token === import2.Location)) { return this._Location_57; }\n    if ((token === import37.UrlSerializer)) { return this._UrlSerializer_58; }\n    if ((token === import38.DeepLinker)) { return this._DeepLinker_59; }\n    if ((token === import19.ModalController)) { return this._ModalController_60; }\n    if ((token === import20.PickerController)) { return this._PickerController_61; }\n    if ((token === import21.PopoverController)) { return this._PopoverController_62; }\n    if ((token === import22.TapClick)) { return this._TapClick_63; }\n    if ((token === import23.ToastController)) { return this._ToastController_64; }\n    if ((token === import24.TransitionController)) { return this._TransitionController_65; }\n    return notFoundResult;\n  }\n  destroyInternal():void {\n    this._\u0275f_27.ngOnDestroy();\n    this._\u0275DomSharedStylesHost_37.ngOnDestroy();\n  }\n}\nexport const AppModuleNgFactory:import0.NgModuleFactory<import1.AppModule> = new import0.NgModuleFactory<any>(AppModuleInjector,import1.AppModule);\n      ";
            var knownAppNgModulePath = path_1.join(process.cwd(), 'myApp', 'src', 'app.module.ts');
            var knownAppNgModuleFactoryPath = helpers.changeExtension(knownAppNgModulePath, '.ngfactory.ts');
            fileCache.set(knownAppNgModulePath, { path: knownAppNgModulePath, content: ngModuleContent });
            fileCache.set(knownAppNgModuleFactoryPath, { path: knownAppNgModuleFactoryPath, content: knownNgFactoryContent });
            spyOn(helpers, helpers.getStringPropertyValue.name).and.returnValue(knownAppNgModulePath);
            spyOn(fileCache, 'get').and.callThrough();
            spyOn(transpile, transpile.transpileTsString.name).and.callFake(function (context, filePath, contentToTranspile) {
                return {
                    sourceMapText: 'sourceMapText',
                    outputText: contentToTranspile
                };
            });
            var changedFiles = [];
            util.updateAppNgModuleAndFactoryWithDeepLinkConfig(knownContext, knownDeepLinkString, changedFiles, true);
            expect(fileCache.getAll().length).toEqual(6);
            expect(fileCache.get(knownAppNgModulePath).content.indexOf(knownDeepLinkString)).toBeGreaterThanOrEqual(0);
            expect(fileCache.get(helpers.changeExtension(knownAppNgModulePath, '.js')).content.indexOf(knownDeepLinkString)).toBeGreaterThanOrEqual(0);
            expect(fileCache.get(helpers.changeExtension(knownAppNgModulePath, '.js.map')).content).toEqual('sourceMapText');
            expect(fileCache.get(knownAppNgModuleFactoryPath)).toBeTruthy();
            expect(fileCache.get(helpers.changeExtension(knownAppNgModuleFactoryPath, '.js'))).toBeTruthy();
            expect(fileCache.get(helpers.changeExtension(knownAppNgModuleFactoryPath, '.js.map'))).toBeTruthy();
            expect(changedFiles.length).toEqual(2);
            expect(changedFiles[0].event).toEqual('change');
            expect(changedFiles[0].ext).toEqual('.ts');
            expect(changedFiles[0].filePath).toEqual(knownAppNgModulePath);
            expect(changedFiles[1].event).toEqual('change');
            expect(changedFiles[1].ext).toEqual('.ts');
            expect(changedFiles[1].filePath).toEqual(knownAppNgModuleFactoryPath);
        });
    });
});
