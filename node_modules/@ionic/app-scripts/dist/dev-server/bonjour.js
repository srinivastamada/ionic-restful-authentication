"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../logger/logger");
var ionic_project_1 = require("../util/ionic-project");
function createBonjourService(config) {
    if (!config.bonjour) {
        return;
    }
    ionic_project_1.getProjectJson()
        .then(function (project) { return project.name; })
        .catch(function () { return 'ionic-app-scripts'; })
        .then(function (projectName) {
        logger_1.Logger.info("publishing bonjour service");
        var bonjour = require('bonjour')();
        bonjour.publish({
            name: projectName,
            type: 'ionicdev',
            port: config.httpPort
        });
        var unpublish = function () {
            bonjour.unpublishAll();
            bonjour.destroy();
        };
        process.on('exit', unpublish);
        process.on('SIGINT', unpublish);
    });
}
exports.createBonjourService = createBonjourService;
