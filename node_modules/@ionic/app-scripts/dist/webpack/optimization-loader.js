"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var optimization_loader_impl_1 = require("./optimization-loader-impl");
module.exports = function loader(source, map) {
    optimization_loader_impl_1.optimizationLoader(source, map, this);
};
