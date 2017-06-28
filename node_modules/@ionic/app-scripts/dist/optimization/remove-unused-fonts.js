"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var logger_1 = require("../logger/logger");
var helpers_1 = require("../util/helpers");
var glob = require("glob");
function removeUnusedFonts(context) {
    // For webapps, we pretty much need all fonts to be available because
    // the web server deployment never knows which browser/platform is
    // opening the app. Additionally, webapps will request fonts on-demand,
    // so having them all sit in the www/assets/fonts directory doesn’t
    // hurt anything if it’s never being requested.
    // However, with Cordova, the entire directory gets bundled and
    // shipped in the ipa/apk, but we also know exactly which platform
    // is opening the webapp. For this reason we can safely delete font
    // files we know would never be opened by the platform. So app-scripts
    // will continue to copy all font files over, but the cordova build
    // process would delete those we know are useless and just taking up
    // space. End goal is that the Cordova ipa/apk filesize is smaller.
    // Font Format Support:
    // ttf: http://caniuse.com/#feat=ttf
    // woff: http://caniuse.com/#feat=woff
    // woff2: http://caniuse.com/#feat=woff2
    if (context.target === 'cordova') {
        var fontsRemoved = [];
        // all cordova builds should remove .eot, .svg, .ttf, and .scss files
        fontsRemoved.push('*.eot');
        fontsRemoved.push('*.ttf');
        fontsRemoved.push('*.svg');
        fontsRemoved.push('*.scss');
        // all cordova builds should remove Noto-Sans
        // Only windows would use Noto-Sans, and it already comes with
        // a system font so it wouldn't need our own copy.
        fontsRemoved.push('noto-sans*');
        if (context.platform === 'android') {
            // Remove all Roboto fonts. Android already comes with Roboto system
            // fonts so shipping our own is unnecessary. Including roboto fonts
            // is only useful for PWAs and during development.
            fontsRemoved.push('roboto*');
        }
        else if (context.platform === 'ios') {
            // Keep Roboto for now. Apps built for iOS may still use Material Design,
            // so in that case Roboto should be available. Later we can improve the
            // CLI to be smarter and read the user’s ionic config. Also, the roboto
            // fonts themselves are pretty small.
        }
        var filesToDelete_1 = [];
        var promises = fontsRemoved.map(function (pattern) {
            return new Promise(function (resolve) {
                var searchPattern = path_1.join(context.wwwDir, 'assets', 'fonts', pattern);
                glob(searchPattern, function (err, files) {
                    if (err) {
                        logger_1.Logger.error("removeUnusedFonts: " + err);
                    }
                    else {
                        files.forEach(function (f) {
                            if (filesToDelete_1.indexOf(f) === -1) {
                                filesToDelete_1.push(f);
                            }
                        });
                    }
                    resolve();
                });
            });
        });
        return Promise.all(promises).then(function () {
            return helpers_1.unlinkAsync(filesToDelete_1).then(function () {
                if (filesToDelete_1.length) {
                    logger_1.Logger.info("removed unused font files");
                    return true;
                }
                return false;
            });
        });
    }
    // nothing to do here, carry on
    return Promise.resolve();
}
exports.removeUnusedFonts = removeUnusedFonts;
