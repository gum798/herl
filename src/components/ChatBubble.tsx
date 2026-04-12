import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.time}>
        {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#e94560',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#e0e0e0',
  },
  time: {
    color: '#666688',
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 4,
  },
});
