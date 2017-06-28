import { BuildContext, DeepLinkConfigEntry } from '../util/interfaces';
export declare class IonicEnvironmentPlugin {
    private context;
    constructor(context: BuildContext);
    apply(compiler: any): void;
    private initializeWebpackFileSystemCaches(webpackFileSystem);
}
export declare function convertDeepLinkConfigToWebpackFormat(parsedDeepLinkConfigs: DeepLinkConfigEntry[]): {
    [index: string]: string;
};
