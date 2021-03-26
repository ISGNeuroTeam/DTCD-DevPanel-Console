import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import styles from 'rollup-plugin-styles';
import vue from 'rollup-plugin-vue2';

import path from 'path';
import pluginMeta from './src/Plugin.Meta';

const pluginName = pluginMeta.name;
const watch = Boolean(process.env.ROLLUP_WATCH);
const fileDest = watch ? `./../../DTCD/server/plugins/${pluginName}.js` : `./../build/${pluginName}.js`;

const plugins = [
  vue(),
  commonjs(),
  alias({
    entries: {
      '@': path.resolve(__dirname, 'src'),
    },
  }),
  styles({
    mode: 'inject',
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
