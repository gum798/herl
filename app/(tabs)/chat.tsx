import React, { useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  Pressable,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';

import { ChatBubble } from '@/src/components/ChatBubble';
import { VoiceButton } from '@/src/components/VoiceButton';
import { ChatInput } from '@/src/components/ChatInput';
import { StreamingBubble } from '@/src/components/StreamingBubble';
import { ModelDownloadBanner } from '@/src/components/ModelDownloadBanner';
import { useLLM } from '@/src/hooks/useLLM';
import { useVoiceRecorder } from '@/src/hooks/useVoiceRecorder';
import { useCamera } from '@/src/hooks/useCamera';
import { CameraViewComponent } from '@/src/components/CameraView';
import { useChatStore } from '@/src/stores/chatStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useTranslation } from '@/src/i18n';
import type { ChatMessage } from '@/src/types';

export default function ChatScreen() {
  const { messages } = useChatStore();
  const { companionName } = useSettingsStore();
  const { t } = useTranslation();
  const { sendMessage, stop, streamingText, isGenerating } = useLLM();
  const { voiceState, toggleRecording } = useVoiceRecorder();
  const {
    cameraRef, isCameraOpen, facing,
    openCamera, closeCamera, toggleFacing, captureAndClose,
  } = useCamera();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0 || streamingText) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, streamingText]);

  const handleSendText = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  const handleModelDownload = useCallback(() => {
    console.log('Model download requested');
  }, []);

  const handleCameraCapture = useCallback(async () => {
    const result = await captureAndClose();
    if (result) {
      // Send image with a prompt to LLM
      sendMessage('이 사진에 대해 설명해줘', result.uri);
    }
  }, [captureAndClose, sendMessage]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble message={item} />
  );

  const renderFooter = () => {
    if (!isGenerating) return null;
    return (
      <StreamingBubble
        text={streamingText}
        isThinking={isGenerating && !streamingText}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Camera overlay */}
      {isCameraOpen && (
        <CameraViewComponent
          cameraRef={cameraRef}
          facing={facing}
          onCapture={handleCameraCapture}
          onClose={closeCamera}
          onFlip={toggleFacing}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerDot} />
        <Text style={styles.headerTitle}>{companionName}</Text>
      </View>

      {/* Model download banner */}
      <ModelDownloadBanner onDownload={handleModelDownload} />

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>{'  '}</Text>
            <Text style={styles.emptyTitle}>{t('chatEmpty', { name: companionName })}</Text>
            <Text style={styles.emptySubtext}>
              {t('chatEmptySubtext')}
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputArea}>
          <VoiceButton
            voiceState={voiceState}
            onPress={() => {
              if (isGenerating) {
                stop();
                return;
              }
              toggleRecording();
            }}
          />
          <ChatInput onSend={handleSendText} />
          <Pressable onPress={openCamera} style={styles.cameraButton}>
            <FontAwesome name="camera" size={18} color="#8888aa" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  headerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e94560',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    backgroundColor: '#16213e',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8888aa',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
