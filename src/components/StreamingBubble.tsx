import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface StreamingBubbleProps {
  text: string;
  isThinking: boolean;
}

/**
 * Shows the assistant's response as it streams in,
 * with a blinking cursor effect.
 */
export function StreamingBubble({ text, isThinking }: StreamingBubbleProps) {
  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withTiming(0, { duration: 500 }),
      -1,
      true
    );
  }, []);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  if (!text && !isThinking) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        {isThinking && !text ? (
          <View style={styles.thinkingDots}>
            <ThinkingDot delay={0} />
            <ThinkingDot delay={200} />
            <ThinkingDot delay={400} />
          </View>
        ) : (
          <View style={styles.textRow}>
            <Text style={styles.text}>{text}</Text>
            <Animated.View style={[styles.cursor, cursorStyle]} />
          </View>
        )}
      </View>
    </View>
  );
}

function ThinkingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    marginVertical: 4,
  },
  bubble: {
    backgroundColor: '#16213e',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  text: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
  cursor: {
    width: 2,
    height: 16,
    backgroundColor: '#e94560',
    marginLeft: 2,
    marginBottom: 2,
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e94560',
  },
});
