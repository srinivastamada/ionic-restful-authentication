import { BuildContext, ChangedFile } from './util/interfaces';
import * as ts from 'typescript';
export declare function transpile(context: BuildContext): Promise<void>;
export declare function transpileUpdate(changedFiles: ChangedFile[], context: BuildContext): Promise<void>;
/**
 * The full TS build for all app files.
 */
export declare function transpileWorker(context: BuildContext, workerConfig: TranspileWorkerConfig): Promise<{}>;
export declare function canRunTranspileUpdate(event: string, filePath: string, context: BuildContext): boolean;
export declare function transpileDiagnosticsOnly(context: BuildContext): Promise<{}>;
export interface TranspileWorkerMessage {
    rootDir?: string;
    buildDir?: string;
    configFile?: string;
    transpileSuccess?: boolean;
}
export declare function getTsConfigAsync(context: BuildContext, tsConfigPath?: string): Promise<TsConfig>;
export declare function getTsConfig(context: BuildContext, tsConfigPath?: string): TsConfig;
export declare function transpileTsString(context: BuildContext, filePath: string, stringToTranspile: string): ts.TranspileOutput;
export declare function getTsConfigPath(context: BuildContext): any;
export interface TsConfig {
    options: ts.CompilerOptions;
    fileNames: string[];
    raw: any;
}
export interface TranspileWorkerConfig {
    configFile: string;
    writeInMemory: boolean;
    sourceMaps: boolean;
    cache: boolean;
    inlineTemplate: boolean;
}
