// jest.config.js
module.exports = {
  testEnvironment: "jsdom", // ブラウザ環境でのテスト
  transform: {
    "^.+\\.tsx?$": "ts-jest", // TypeScriptファイルをトランスフォーム
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"], // テスト対象ファイルの拡張子
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // テスト環境のセットアップ
};
