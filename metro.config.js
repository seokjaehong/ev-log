const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ONNX 모델 파일을 asset으로 처리
config.resolver.assetExts.push('onnx');

module.exports = config;
