import { BuildContext, ChangedFile } from './util/interfaces';
export declare function bundle(context: BuildContext, configFile?: string): Promise<any>;
export declare function bundleUpdate(changedFiles: ChangedFile[], context: BuildContext): Promise<any>;
export declare function buildJsSourceMaps(context: BuildContext): boolean;
export declare function getJsOutputDest(context: BuildContext): string;
