import { BuildContext, ChangedFile } from './util/interfaces';
export declare function rollup(context: BuildContext, configFile: string): Promise<any>;
export declare function rollupUpdate(changedFiles: ChangedFile[], context: BuildContext): Promise<any>;
export declare function rollupWorker(context: BuildContext, configFile: string): Promise<any>;
export declare function getRollupConfig(context: BuildContext, configFile: string): RollupConfig;
export declare function getOutputDest(context: BuildContext, rollupConfig: RollupConfig): string;
export declare function invalidateCache(): void;
export interface RollupConfig {
    entry?: string;
    sourceMap?: boolean;
    plugins?: any[];
    format?: string;
    dest?: string;
    cache?: RollupBundle;
    onwarn?: Function;
}
export interface RollupBundle {
    write?: Function;
    modules: RollupModule[];
    generate: (config: RollupConfig) => RollupBundleOutput;
}
export interface RollupBundleOutput {
    code: string;
    map: string;
}
export interface RollupModule {
    id: string;
}
export interface RollupWarning {
    code: string;
    message: string;
    url: string;
    pos: number;
    loc: RollupLocationInfo;
}
export interface RollupLocationInfo {
    file: string;
    line: number;
    column: number;
}
