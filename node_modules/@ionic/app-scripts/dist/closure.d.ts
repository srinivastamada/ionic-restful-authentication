import { BuildContext } from './util/interfaces';
export declare function closure(context: BuildContext, configFile?: string): Promise<void>;
export declare function closureWorker(context: BuildContext, configFile: string): Promise<any>;
export declare function isClosureSupported(context: BuildContext): Promise<boolean>;
export interface ClosureConfig {
    pathToJavaExecutable: string;
    pathToClosureJar: string;
    optimization: string;
    languageOut: string;
    languageIn: string;
    debug: boolean;
}
