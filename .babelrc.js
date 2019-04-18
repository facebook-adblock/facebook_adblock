module.exports = function(api) {
  api.cache.forever();

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3,
          debug: true,
        },
      ],
    ],
  };
};
