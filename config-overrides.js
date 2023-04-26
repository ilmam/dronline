const {
  override,
  fixBabelImports,
  addDecoratorsLegacy,
  addLessLoader,
  disableEsLint,
  addBundleVisualizer,
} = require('customize-cra');

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        '@primary-color': '#34d698',
        '@font-family': 'Inter',
      },
    },
  }),
  addDecoratorsLegacy(),
  disableEsLint(),
  (config) =>
    process.env.BUNDLE_VISUALIZE === 1 ? addBundleVisualizer()(config) : config
);
