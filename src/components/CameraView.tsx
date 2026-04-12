import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { CameraView as ExpoCameraView, type CameraType } from 'expo-camera';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface CameraViewProps {
  cameraRef: React.RefObject<ExpoCameraView | null>;
  facing: CameraType;
  onCapture: () => void;
  onClose: () => void;
  onFlip: () => void;
}

export function CameraViewComponent({
  cameraRef,
  facing,
  onCapture,
  onClose,
  onFlip,
}: CameraViewProps) {
  return (
    <View style={styles.container}>
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <FontAwesome name="times" size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.title}>What do you see?</Text>
          <Pressable onPress={onFlip} style={styles.iconButton}>
            <FontAwesome name="refresh" size={20} color="#ffffff" />
          </Pressable>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={onCapture}
            style={({ pressed }) => [
              styles.captureButton,
              pressed && styles.captureButtonPressed,
            ]}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 100,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 50,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonPressed: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#e94560',
  },
});
