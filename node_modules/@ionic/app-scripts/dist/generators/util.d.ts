import { BuildContext } from '../util/interfaces';
import { GlobResult } from '../util/glob-util';
export declare function hydrateRequest(context: BuildContext, request: GeneratorRequest): HydratedGeneratorRequest;
export declare function hydrateTabRequest(context: BuildContext, request: GeneratorTabRequest): HydratedGeneratorRequest;
export declare function readTemplates(pathToRead: string): Promise<Map<string, string>>;
export declare function filterOutTemplates(request: HydratedGeneratorRequest, templates: Map<string, string>): Map<string, string>;
export declare function applyTemplates(request: HydratedGeneratorRequest, templates: Map<string, string>): Map<string, string>;
export declare function writeGeneratedFiles(request: HydratedGeneratorRequest, processedTemplates: Map<string, string>): Promise<string[]>;
export declare function getNgModules(context: BuildContext, types: string[]): Promise<GlobResult[]>;
export declare function getDirToWriteToByType(context: BuildContext, type: string): string;
export declare function nonPageFileManipulation(context: BuildContext, name: string, ngModulePath: string, type: string): Promise<string[]>;
export declare function tabsModuleManipulation(tabs: string[][], hydratedRequest: HydratedGeneratorRequest, tabHydratedRequests: HydratedGeneratorRequest[]): Promise<any>;
export declare function generateTemplates(context: BuildContext, request: HydratedGeneratorRequest): Promise<string[]>;
export interface GeneratorOption {
    type: string;
    multiple: boolean;
}
export interface GeneratorRequest {
    type?: string;
    name?: string;
    includeSpec?: boolean;
    includeNgModule?: boolean;
}
export interface GeneratorTabRequest extends GeneratorRequest {
    tabs?: HydratedGeneratorRequest[];
}
export interface HydratedGeneratorRequest extends GeneratorRequest {
    fileName?: string;
    className?: string;
    tabContent?: string;
    tabVariables?: string;
    dirToRead?: string;
    dirToWrite?: string;
}
