import { posix as path } from 'path';
import AliOSS from 'ali-oss';
import glob from 'glob';
import { repeat, sortFiles, printError, printSuccess, printExists } from './utils';

// eslint-disable-next-line import/prefer-default-export
export class OSS {
  private client: AliOSS;

  private debug = true;

  /**
   * @param options
   * @param debug 开启调试模式不会真正和oss交互, 而是mock, 用于调试配置是否正确, 默认开启
   */
  constructor(options: AliOSS.Options, debug = true) {
    this.client = new AliOSS(options);
    this.debug = debug;
  }

  // eslint-disable-next-line class-methods-use-this
  private printFile(files: string[], index: number, theme: 'success' | 'exists'): void {
    const print = theme === 'success' ? printSuccess : printExists;
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

    const commonSegments: string[] = [];
    const minLength = Math.min(segmentsCurrent.length, segmentsPrevious.length);
    for (let i = 0; i < minLength; i += 1) {
      if (segmentsCurrent[i] !== segmentsPrevious[i]) {
        break;
      }
      commonSegments.push(segmentsCurrent[i]);
    }

    for (let i = commonSegments.length; i < segmentsCurrent.length - 1; i += 1) {
      console.log(`${repeat(' ', i * 4)}├──`, segmentsCurrent[i]);
    }

    print(
      repeat(' ', (segmentsCurrent.length - 1) * 4) + prefix,
      segmentsCurrent[segmentsCurrent.length - 1],
    );
  }

  /**
   * 判断对象是否已存在
   * @param name string
   */
  public exists = (name: string): Promise<boolean> => {
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
  public put = (
    name: string,
    file: any,
    options?: AliOSS.PutObjectOptions,
  ): Promise<AliOSS.PutObjectResult> => {
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
  public upload = (
    patterns: string | readonly string[],
    ossBase: string,
    { localBase = '', ignore }: { localBase?: string; ignore?: string | readonly string[] } = {
      localBase: '',
    },
  ): Promise<void> => {
    const _patterns = (Array.isArray(patterns) ? patterns : [patterns])
      .map(pattern => path.join(localBase, pattern))
      .join(',');
    const ig = ignore
      ? (Array.isArray(ignore) ? ignore : [ignore])
          .map(pattern => path.join(localBase, pattern))
          .join(',')
      : '';

    return new Promise((resolve, reject) => {
      glob(
        _patterns,
        {
          ignore: ig,
          nodir: true,
          // dot: true,
        },
        (error: any, files: string[]) => {
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
          sortFiles(files).forEach((file, index) => {
            const relative = file.slice(localBase.length + 1);
            const ossName = path.join(ossBase, relative);
            task = task
              .then(() => {
                return this.exists(ossName);
              })
              .then(exists => {
                if (!exists) {
                  return this.put(ossName, file).then(() =>
                    this.printFile(files, index, 'success'),
                  );
                }
                this.printFile(files, index, 'exists');
                return Promise.resolve();
              })
              .catch(e => {
                printError('上传失败!');
                printError(e);
                process.exit(1);
              });
          });
          return task.then(resolve);
        },
      );
    });
  };
}
