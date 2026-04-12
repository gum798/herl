import { useState, useCallback, useRef } from 'react';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { imageToBase64, cleanupTempImage } from '../services/camera';

/**
 * Hook for camera capture and multimodal LLM integration.
 */
export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [lastCaptureUri, setLastCaptureUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const hasPermission = permission?.granted ?? false;

  /**
   * Open the camera view.
   */
  const openCamera = useCallback(async () => {
    if (!hasPermission) {
      const result = await requestPermission();
      if (!result.granted) {
        console.error('Camera permission denied');
        return;
      }
    }
    setIsCameraOpen(true);
  }, [hasPermission, requestPermission]);

  /**
   * Close the camera view.
   */
  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  /**
   * Toggle between front and back camera.
   */
  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  /**
   * Capture a photo and return its URI + base64 data.
   */
  const capturePhoto = useCallback(async (): Promise<{
    uri: string;
    base64: string;
  } | null> => {
    if (!cameraRef.current) {
      console.error('Camera ref not available');
      return null;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!photo) return null;

      setLastCaptureUri(photo.uri);

      return {
        uri: photo.uri,
        base64: photo.base64 || '',
      };
    } catch (error) {
      console.error('Failed to capture photo:', error);
      return null;
    }
  }, []);

  /**
   * Capture photo and close camera in one action.
   */
  const captureAndClose = useCallback(async () => {
    const result = await capturePhoto();
    setIsCameraOpen(false);
    return result;
  }, [capturePhoto]);

  /**
   * Cleanup last captured image.
   */
  const cleanup = useCallback(() => {
    if (lastCaptureUri) {
      cleanupTempImage(lastCaptureUri);
      setLastCaptureUri(null);
    }
  }, [lastCaptureUri]);

  return {
    cameraRef,
    isCameraOpen,
    facing,
    hasPermission,
    openCamera,
    closeCamera,
    toggleFacing,
    capturePhoto,
    captureAndClose,
    cleanup,
  };
}
