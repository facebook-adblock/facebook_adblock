module.exports = function(api) {
  api.cache.forever();

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          debug: true,
          corejs: 3
        },
      ],
    ],
  };
};
