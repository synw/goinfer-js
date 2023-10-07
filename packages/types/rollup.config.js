import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

//const isProduction = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/interfaces.ts',
  output: [
    {
      file: 'dist/interfaces.es.js',
      format: 'esm'
    }
  ],
  plugins: [
    typescript(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
  ],
};