module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ubike-map/'
    : '/',
  outputDir: 'docs',
};
