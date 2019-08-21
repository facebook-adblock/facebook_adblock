module.exports = function(api) {
  api.cache.forever();

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: {
            version: 3,
            proposals: true,
          },
          debug: true,
        },
      ],
    ],
  };
};
