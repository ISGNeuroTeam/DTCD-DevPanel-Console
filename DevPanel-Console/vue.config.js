const path = require('path');
const ESMWebpackPlugin = require('@purtuga/esm-webpack-plugin');

const isDev = process.env.IS_DEV === 'true';
const plugins = [];

if (isDev) {
  plugins.push(...[
    new ESMWebpackPlugin(),
  ]);
}

const outputDirPath = isDev ? './../../DTCD/server/plugins' : './build';

module.exports = {
  filenameHashing: false,
  productionSourceMap: false,
  outputDir: path.resolve(__dirname, outputDirPath),
  css: {
    extract: false,
  },
  configureWebpack: {
    entry: './src/Plugin.js',
    output: {
      filename: 'DevPanel-Console.js',
      library: 'DevPanel_Console',
      libraryTarget: 'var',
    },
    externals: {
      vue: 'Vue',
    },
    plugins: [...plugins],
  },
  chainWebpack: config => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.optimization.delete('splitChunks');
  },
};
