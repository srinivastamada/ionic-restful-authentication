import { BuildContext } from '../util/interfaces';
export declare function updateIndexHtml(context: BuildContext): Promise<string>;
export declare function injectCoreScripts(context: BuildContext, indexHtml: string): string;
export declare function injectCoreHtml(indexHtml: string, inject: string): string;
