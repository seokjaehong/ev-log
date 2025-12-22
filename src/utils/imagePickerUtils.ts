import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * 카메라로 사진 촬영
 */
export const pickImageFromCamera = async (): Promise<string | null> => {
  try {
    // 카메라 권한 요청
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      console.log('카메라 권한이 거부되었습니다.');
      return null;
    }

    // 카메라 실행
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled) {
      return null;
    }

    // 이미지 압축 및 최적화
    const optimizedUri = await optimizeImage(result.assets[0].uri);
    return optimizedUri;
  } catch (error) {
    console.error('카메라 촬영 오류:', error);
    return null;
  }
};

/**
 * 갤러리에서 사진 선택
 */
export const pickImageFromLibrary = async (): Promise<string | null> => {
  try {
    // 갤러리 권한 요청
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      console.log('갤러리 접근 권한이 거부되었습니다.');
      return null;
    }

    // 갤러리 열기
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled) {
      return null;
    }

    // 이미지 압축 및 최적화
    const optimizedUri = await optimizeImage(result.assets[0].uri);
    return optimizedUri;
  } catch (error) {
    console.error('갤러리 선택 오류:', error);
    return null;
  }
};

/**
 * 이미지 최적화 (크기 조정 및 압축)
 * OCR 정확도 향상 및 전송 속도 개선을 위해 이미지 크기를 제한
 */
const optimizeImage = async (uri: string): Promise<string> => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        // 최대 너비 1024px로 제한 (OCR에 충분하고 전송 속도 빠름)
        { resize: { width: 1024 } },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipulatedImage.uri;
  } catch (error) {
    console.error('이미지 최적화 오류:', error);
    // 최적화 실패 시 원본 URI 반환
    return uri;
  }
};
