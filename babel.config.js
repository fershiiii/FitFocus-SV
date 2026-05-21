module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [], // ⬅️ Dejamos los plugins completamente vacíos para saltarnos el error de Reanimated
  };
};
