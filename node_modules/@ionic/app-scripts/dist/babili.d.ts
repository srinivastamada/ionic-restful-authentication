import { BuildContext, TaskInfo } from './util/interfaces';
export declare function babili(context: BuildContext, configFile?: string): Promise<void | Error>;
export declare function babiliWorker(context: BuildContext, configFile: string): Promise<{}>;
export declare function runBabili(context: BuildContext): Promise<{}>;
export declare const taskInfo: TaskInfo;
export interface BabiliConfig {
    sourceFile: string;
    destFileName: string;
}
