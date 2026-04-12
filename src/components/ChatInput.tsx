import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSend(trimmed);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
        placeholderTextColor="#666688"
        multiline
        maxLength={2000}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />
      <Pressable
        onPress={handleSend}
        style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
        disabled={!text.trim()}
      >
        <FontAwesome
          name="send"
          size={16}
          color={text.trim() ? '#e94560' : '#444466'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#0f3460',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 4,
    marginRight: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPressed: {
    opacity: 0.6,
  },
});
