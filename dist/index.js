Object.defineProperty(exports, "__esModule", { value: true });
exports.OSS = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const ali_oss_1 = tslib_1.__importDefault(require("ali-oss"));
const glob_1 = tslib_1.__importDefault(require("glob"));
const utils_1 = require("./utils");
// eslint-disable-next-line import/prefer-default-export
class OSS {
    /**
     * @param options
     * @param debug 开启调试模式不会真正和oss交互, 而是mock, 用于调试配置是否正确, 默认开启
     */
    constructor(options, debug = true) {
        this.debug = true;
        /**
         * 判断对象是否已存在
         * @param name string
         */
        this.exists = (name) => {
            if (this.debug) {
                return Promise.resolve(!!Math.floor(Math.random() * 2));
            }
            return this.client
                .get(name)
                .then(result => {
                if (result.res.status === 200) {
                    return true;
                }
                return Promise.reject(result);
            })
                .catch(e => {
                if (e.code === 'NoSuchKey') {
                    return false;
                }
                return Promise.reject(e);
            });
        };
        /**
         * 上传一个对象到bucket
         * @param name string
         * @param file
         * @param options
         */
        this.put = (name, file, options) => {
            if (this.debug) {
                return Promise.resolve({
                    name,
                    url: '',
                    data: {},
                    res: {
                        status: 200,
                        headers: {
                            date: 'Tue, 17 Feb 2015 13:28:17 GMT',
                            'content-length': '0',
                            connection: 'close',
                            etag: '"BF7A03DA01440845BC5D487B369BC168"',
                            server: 'AliyunOSS',
                            'x-oss-request-id': '54E341F1707AA0275E829244',
                        },
                        size: 0,
                        rt: 92,
                    },
                });
            }
            return this.client.put(name, file, options);
        };
        /**
         * 上传所有匹配的文件
         * @param files glob匹配
         * @param ossBase oss上要存放的根目录
         * @param localBase 本地根目录
         * @param ignore 忽略的文件glob
         */
        this.upload = (patterns, ossBase, { localBase = '', ignore } = {
            localBase: '',
        }) => {
            const _patterns = (Array.isArray(patterns) ? patterns : [patterns])
                .map(pattern => path_1.posix.join(localBase, pattern))
                .join(',');
            const ig = ignore
                ? (Array.isArray(ignore) ? ignore : [ignore])
                    .map(pattern => path_1.posix.join(localBase, pattern))
                    .join(',')
                : '';
            return new Promise((resolve, reject) => {
                glob_1.default(_patterns, {
                    ignore: ig,
                    nodir: true,
                }, (error, files) => {
                    if (error) {
                        return reject(error);
                    }
                    // eslint-disable-next-line no-param-reassign
                    files = files.map(file => {
                        if (file.startsWith('./')) {
                            return file.slice(2);
                        }
                        return file;
                    });
                    let task = Promise.resolve();
                    utils_1.sortFiles(files).forEach((file, index) => {
                        const relative = file.slice(localBase.length + 1);
                        const ossName = path_1.posix.join(ossBase, relative);
                        task = task
                            .then(() => {
                            return this.exists(ossName);
                        })
                            .then(exists => {
                            if (!exists) {
                                return this.put(ossName, file).then(() => this.printFile(files, index, 'success'));
                            }
                            this.printFile(files, index, 'exists');
                            return Promise.resolve();
                        })
                            .catch(e => {
                            utils_1.printError('上传失败!');
                            utils_1.printError(e);
                            process.exit(1);
                        });
                    });
                    return task.then(resolve);
                });
            });
        };
        this.client = new ali_oss_1.default(options);
        this.debug = debug;
    }
    // eslint-disable-next-line class-methods-use-this
    printFile(files, index, theme) {
        const print = theme === 'success' ? utils_1.printSuccess : utils_1.printExists;
        const current = files[index];
        const previous = files[index - 1] || '';
        const next = files[index + 1] || '';
        const segmentsCurrent = current.split('/');
        const segmentsPrevious = previous.split('/');
        const segmentsNext = next.split('/');
        let prefix = '├──';
        if (!next || segmentsCurrent.slice(1, -1).join('/') !== segmentsNext.slice(1, -1).join('/')) {
            prefix = '└──';
        }
        const commonSegments = [];
        const minLength = Math.min(segmentsCurrent.length, segmentsPrevious.length);
        for (let i = 0; i < minLength; i += 1) {
            if (segmentsCurrent[i] !== segmentsPrevious[i]) {
                break;
            }
            commonSegments.push(segmentsCurrent[i]);
        }
        for (let i = commonSegments.length; i < segmentsCurrent.length - 1; i += 1) {
            console.log(`${utils_1.repeat(' ', i * 4)}├──`, segmentsCurrent[i]);
        }
        print(utils_1.repeat(' ', (segmentsCurrent.length - 1) * 4) + prefix, segmentsCurrent[segmentsCurrent.length - 1]);
    }
}
exports.OSS = OSS;
