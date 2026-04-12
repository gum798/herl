import { File, Paths } from 'expo-file-system';

/**
 * Convert an image file to base64 for LLM multimodal input.
 */
export async function imageToBase64(imageUri: string): Promise<string> {
  const file = new File(imageUri);
  if (!file.exists) {
    throw new Error(`Image file not found: ${imageUri}`);
  }
  return await file.base64();
}

/**
 * Get a temporary file path for camera capture.
 */
export function getTempImagePath(): string {
  const tempFile = new File(Paths.cache, `herl-capture-${Date.now()}.jpg`);
  return tempFile.uri;
}

/**
 * Clean up temporary image files.
 */
export function cleanupTempImage(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Ignore cleanup errors
  }
}
