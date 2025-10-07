module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets/plugin',
    [
      '@babel/plugin-proposal-decorators',
      { legacy: true }, // 👈 cần thiết cho TypeORM
    ],
    [
      '@babel/plugin-proposal-class-properties',
      { loose: true }, // 👈 để hỗ trợ class property của TypeORM entity
    ],
  ],
};
