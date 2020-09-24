/**
 * repeat('ab', 2)
 * // => 'abab'
 * repeat('ab', 2, 3)
 * // => 'aba'
 */
export declare function repeat(str: string, times: number, maxLen?: number): string;
/**
 * 排序文件列表, 按文件夹在上，文件在下，字母表顺序排序
 * @param {array} files
 */
export declare function sortFiles(files: string[]): string[];
export declare function printSuccess(...params: any): void;
export declare function printError(...params: any): void;
export declare function printExists(...params: any): void;
