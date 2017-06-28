import * as Linter from 'tslint';
import { Program } from 'typescript';
export declare function getLinter(filePath: string, fileContent: string, program: Program): Linter;
export declare function createProgram(configFilePath: string, sourceDir: string): Program;
export declare function getFileNames(program: Program): string[];
