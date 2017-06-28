"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transpile_loader_impl_1 = require("./transpile-loader-impl");
module.exports = function loader(source, map) {
    transpile_loader_impl_1.transpileLoader(source, map, this);
};
