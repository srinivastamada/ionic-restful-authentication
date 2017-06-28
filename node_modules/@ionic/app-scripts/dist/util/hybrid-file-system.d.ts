/// <reference types="node" />
import { FileSystem, VirtualFileSystem } from './interfaces';
import { FileCache } from './file-cache';
import { VirtualDirStats, VirtualFileStats } from './virtual-file-utils';
export declare class HybridFileSystem implements FileSystem, VirtualFileSystem {
    private fileCache;
    private filesStats;
    private directoryStats;
    private originalFileSystem;
    constructor(fileCache: FileCache);
    setFileSystem(fs: FileSystem): void;
    isSync(): boolean;
    stat(path: string, callback: Function): any;
    readdir(path: string, callback: Function): any;
    readJson(path: string, callback: Function): any;
    readlink(path: string, callback: Function): any;
    purge(pathsToPurge: string[]): void;
    readFile(path: string, callback: Function): any;
    addVirtualFile(filePath: string, fileContent: string): void;
    getFileContent(filePath: string): string;
    getDirectoryStats(path: string): VirtualDirStats;
    getSubDirs(directoryPath: string): string[];
    getFileNamesInDirectory(directoryPath: string): string[];
    getAllFileStats(): {
        [filePath: string]: VirtualFileStats;
    };
    getAllDirStats(): {
        [filePath: string]: VirtualDirStats;
    };
    mkdirp(filePath: string, callback: Function): void;
    join(dirPath: string, fileName: string): string;
    writeFile(filePath: string, fileContent: Buffer, callback: Function): void;
}
