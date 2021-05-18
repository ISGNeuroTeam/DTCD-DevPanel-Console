import alias from '@rollup/plugin-alias';
import vue from 'rollup-plugin-vue';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

import styles from 'rollup-plugin-styles';
import replace from '@rollup/plugin-replace';
import path from 'path';

const pluginName = 'DevPanelConsole';
const watch = Boolean(process.env.ROLLUP_WATCH);
const fileDest = watch
  ? `./../../DTCD/server/plugins/DTCD-${pluginName}/${pluginName}.js`
  : `./build/${pluginName}.js`;

const plugins = [
  resolve({
    jsnext: true,
    preferBuiltins: true,
    browser: true,
    dedupe: ['vue'],
    extensions: ['.mjs', '.js', '.json', '.node', '.vue'],
  }),
  commonjs(),
  vue({
    preprocessStyles: true,
  }),
  alias({
    entries: {
      '@': path.resolve(__dirname, 'src'),
    },
  }),
  styles({
    mode: 'inject',
    modules: true,
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VUE_ENV': JSON.stringify('browser'),
  }),
];

export default {
  plugins,
  input: 'src/Plugin.js',
  output: {
    file: fileDest,
    format: 'esm',
    sourcemap: false,
  },
  watch: {
    include: ['./src/**'],
  },
};
