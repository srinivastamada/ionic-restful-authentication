import { BuildContext, Diagnostic } from '../util/interfaces';
export declare function runTsLintDiagnostics(context: BuildContext, failures: RuleFailure[]): Diagnostic[];
export interface RuleFailure {
    sourceFile: any;
    failure: string;
    ruleName: string;
    fix: any;
    fileName: string;
    startPosition: any;
    endPosition: any;
}
export interface RuleFailurePosition {
    character: number;
    line: number;
    position: number;
}
