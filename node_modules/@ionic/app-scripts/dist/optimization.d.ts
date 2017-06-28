import { BuildContext } from './util/interfaces';
import { WebpackConfig } from './webpack';
export declare function optimization(context: BuildContext, configFile: string): Promise<any>;
export declare function purgeGeneratedFiles(context: BuildContext, fileNameSuffix: string): void;
export declare function doOptimizations(context: BuildContext, dependencyMap: Map<string, Set<string>>): Map<string, Set<string>>;
export declare function getConfig(context: BuildContext, configFile: string): WebpackConfig;
