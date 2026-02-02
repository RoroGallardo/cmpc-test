const { composePlugins, withNx } = require('@nx/webpack');
const path = require('path');

module.exports = composePlugins(withNx(), (config) => {
  // Configurar alias para @cmpc-test/shared
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@cmpc-test/shared': path.resolve(__dirname, '../../libs/shared/src'),
  };
  
  return config;
});
