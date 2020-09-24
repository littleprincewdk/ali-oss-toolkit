const { OSS } = require('../dist/index');

const oss = new OSS(
  {
    accessKeyId: 'test',
    accessKeySecret: 'test',
    bucket: 'xngstatic',
    endpoint: 'oss-cn-shenzhen.aliyuncs.com',
  },
  true,
);

oss.upload('**/*', 'ali-oss-toolkit-test', {
  localBase: 'test/dist',
  ignore: 'index.html',
});
