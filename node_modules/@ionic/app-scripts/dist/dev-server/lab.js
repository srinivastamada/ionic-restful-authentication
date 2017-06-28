"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var cordova_config_1 = require("../util/cordova-config");
/**
 * Main Lab app view
 */
exports.LabAppView = function (req, res) {
    return res.sendFile('index.html', { root: path.join(__dirname, '..', '..', 'lab') });
};
exports.ApiCordovaProject = function (req, res) {
    var cordovaContext = cordova_config_1.buildCordovaConfig(function (err) {
        res.status(400).json({ status: 'error', message: 'Unable to load config.xml' });
    }, function (config) {
        res.json(config);
    });
};
