import { Program } from 'typescript';
import { BuildContext } from '../util/interfaces';
export declare function isMpegFile(file: string): boolean;
export declare function lintFile(context: BuildContext, program: Program, filePath: string): Promise<LintResult>;
export declare function processLintResults(context: BuildContext, lintResults: LintResult[]): void;
export declare function generateFormattedErrorMsg(failingFiles: string[]): string;
export interface LintResult {
    failures: any[];
    filePath: string;
}
