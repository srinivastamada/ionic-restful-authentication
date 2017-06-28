import 'reflect-metadata';
import { ParsedCommandLine } from 'typescript';
import AngularCompilerOptions from '@angular/tsc-wrapped/src/options';
import { BuildContext } from '../util/interfaces';
export declare class AotCompiler {
    private context;
    private options;
    private tsConfig;
    private angularCompilerOptions;
    private program;
    private compilerHost;
    private fileSystem;
    private lazyLoadedModuleDictionary;
    constructor(context: BuildContext, options: AotOptions);
    compile(): Promise<any>;
}
export interface AotOptions {
    tsConfigPath: string;
    rootDir: string;
    entryPoint: string;
    appNgModulePath: string;
    appNgModuleClass: string;
}
export declare function getNgcConfig(context: BuildContext, tsConfigPath?: string): ParsedTsConfig;
export interface ParsedTsConfig {
    parsed: ParsedCommandLine;
    ngOptions: AngularCompilerOptions;
}
