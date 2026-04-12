import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import type { VoiceState } from '../types';

interface VoiceButtonProps {
  voiceState: VoiceState;
  onPress: () => void;
}

export function VoiceButton({ voiceState, onPress }: VoiceButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  const isActive = voiceState === 'recording';

  useEffect(() => {
    if (isActive) {
      scale.value = withRepeat(withTiming(1.3, { duration: 800 }), -1, true);
      opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true);
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(0.3, { duration: 200 });
    }
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconName = (() => {
    switch (voiceState) {
      case 'recording': return 'microphone' as const;
      case 'transcribing': return 'spinner' as const;
      case 'thinking': return 'ellipsis-h' as const;
      case 'speaking': return 'volume-up' as const;
      default: return 'microphone' as const;
    }
  })();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <View style={[styles.button, isActive && styles.buttonActive]}>
        <FontAwesome name={iconName} size={20} color="#ffffff" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pulse: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e94560',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#ff6b6b',
  },
});
