import chalk from 'chalk';

/**
 * repeat('ab', 2)
 * // => 'abab'
 * repeat('ab', 2, 3)
 * // => 'aba'
 */
export function repeat(str: string, times: number, maxLen?: number): string {
  let result = '';
  if (!str || times < 1) {
    return result;
  }
  for (let i = 0; i < times; i += 1) {
    result += str;
  }
  if (maxLen && maxLen < result.length) {
    return result.slice(0, maxLen);
  }
  return result;
}

/**
 * 排序文件列表, 按文件夹在上，文件在下，字母表顺序排序
 * @param {array} files
 */
export function sortFiles(files: string[]): string[] {
  return files.sort((a, b) => {
    const aSegments = a.split('/');
    const bSegments = b.split('/');
    const minLength = Math.min(aSegments.length, bSegments.length);
    for (let i = 0; i < minLength; i += 1) {
      if (aSegments[i] !== bSegments[i]) {
        if (i === aSegments.length - 1 && i !== bSegments.length - 1) {
          return 1;
        }
        if (i !== aSegments.length - 1 && i === bSegments.length - 1) {
          return -1;
        }
        return aSegments[i].toLowerCase() > bSegments[i].toLowerCase() ? 1 : -1;
      }
    }
    return aSegments.length - bSegments.length;
  });
}

export function printSuccess(...params: any): void {
  console.info(chalk.hex('#66ab48')(...params));
}

export function printError(...params: any): void {
  console.info(chalk.red(...params));
}

export function printExists(...params: any): void {
  console.info(chalk.gray(...params));
}
