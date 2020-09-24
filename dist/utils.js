Object.defineProperty(exports, "__esModule", { value: true });
exports.printExists = exports.printError = exports.printSuccess = exports.sortFiles = exports.repeat = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
/**
 * repeat('ab', 2)
 * // => 'abab'
 * repeat('ab', 2, 3)
 * // => 'aba'
 */
function repeat(str, times, maxLen) {
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
exports.repeat = repeat;
/**
 * 排序文件列表, 按文件夹在上，文件在下，字母表顺序排序
 * @param {array} files
 */
function sortFiles(files) {
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
exports.sortFiles = sortFiles;
function printSuccess(...params) {
    console.info(chalk_1.default.hex('#66ab48')(...params));
}
exports.printSuccess = printSuccess;
function printError(...params) {
    console.info(chalk_1.default.red(...params));
}
exports.printError = printError;
function printExists(...params) {
    console.info(chalk_1.default.gray(...params));
}
exports.printExists = printExists;
