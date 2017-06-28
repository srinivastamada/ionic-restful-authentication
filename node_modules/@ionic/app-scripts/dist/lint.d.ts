import { BuildContext, ChangedFile } from './util/interfaces';
import * as ts from 'typescript';
export declare function lint(context: BuildContext, configFile?: string): Promise<void>;
export declare function lintWorker(context: BuildContext, configFile: string): Promise<void>;
export declare function lintUpdate(changedFiles: ChangedFile[], context: BuildContext): Promise<{}>;
export declare function lintUpdateWorker(context: BuildContext, workerConfig: LintWorkerConfig): Promise<void>;
export declare function lintFiles(context: BuildContext, program: ts.Program, filePaths: string[]): Promise<void>;
export interface LintWorkerConfig {
    configFile: string;
    filePaths: string[];
}
