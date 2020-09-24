import AliOSS from 'ali-oss';
export declare class OSS {
    private client;
    private debug;
    /**
     * @param options
     * @param debug 开启调试模式不会真正和oss交互, 而是mock, 用于调试配置是否正确, 默认开启
     */
    constructor(options: AliOSS.Options, debug?: boolean);
    private printFile;
    /**
     * 判断对象是否已存在
     * @param name string
     */
    exists: (name: string) => Promise<boolean>;
    /**
     * 上传一个对象到bucket
     * @param name string
     * @param file
     * @param options
     */
    put: (name: string, file: any, options?: AliOSS.PutObjectOptions | undefined) => Promise<AliOSS.PutObjectResult>;
    /**
     * 上传所有匹配的文件
     * @param files glob匹配
     * @param ossBase oss上要存放的根目录
     * @param localBase 本地根目录
     * @param ignore 忽略的文件glob
     */
    upload: (patterns: string | readonly string[], ossBase: string, { localBase, ignore }?: {
        localBase?: string | undefined;
        ignore?: string | readonly string[] | undefined;
    }) => Promise<void>;
}
