import { BuildContext } from '../util/interfaces';
export declare const PLUGIN_NAME = "ion-rollup-resolver";
export declare function ionicRollupResolverPlugin(context: BuildContext): {
    name: string;
    transform(sourceText: string, sourcePath: string): any;
    resolveId(importee: string, importer: string): any;
    load(sourcePath: string): string;
};
export declare function resolveId(importee: string, importer: string, context: BuildContext): string;
