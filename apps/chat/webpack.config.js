const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { merge } = require('webpack-merge');

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

const EXTERNALS_SCRIPTS = [];

// ELECTRON: Add the Electron renderer script to the Nx plugins for webpack.
if (process.env.BUILD_TARGET && process.env.BUILD_TARGET === 'electron') {
  console.log('Electron renderer script added to the Nx plugins for webpack.');
  EXTERNALS_SCRIPTS.push({
    input: 'src/assets/electron-renderer.js',
    bundleName: 'electron-renderer.js',
    lazy: true,
    inject: 'body'
  })
}

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    optimization: true,
    namedChunks: true,
    index: 'index.html',
    generateIndexHtml: true,
    scripts: EXTERNALS_SCRIPTS
  }),
  withReact({
    // Uncomment this line if you don't want to use SVGR
    // See: https://react-svgr.com/
    // svgr: false
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    config.plugins = config.plugins || [];
    config.plugins.push(new NodePolyfillPlugin());

    config.resolve = config.resolve || {};
    config.resolve.fallback = { "fs": false };

    return merge(config, {
      ignoreWarnings: [/Failed to parse source map/]
    });
  },
);
