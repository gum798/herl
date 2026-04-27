import React from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useModelStore } from '../stores/modelStore';
import { MODEL_INFO, isSimulator } from '../utils/deviceCapability';

interface ModelDownloadBannerProps {
  onDownload: () => void;
}

export function ModelDownloadBanner({ onDownload }: ModelDownloadBannerProps) {
  const { llmStatus, llmProgress, deviceCapability } = useModelStore();

  if (llmStatus === 'ready') return null;

  // Simulator has no real GGUF runtime — show a mock-mode banner instead of download prompt.
  const simulator = isSimulator();

  const getStatusContent = () => {
    if (simulator && llmStatus === 'not_downloaded') {
      return {
        icon: 'flask' as const,
        title: '시뮬레이터 모드',
        subtitle: '페르소나 목업 응답으로 동작 (실기기에서 실제 LLM)',
        showButton: false,
      };
    }
    switch (llmStatus) {
      case 'not_downloaded': {
        const info = MODEL_INFO[deviceCapability.modelId];
        return {
          icon: 'download' as const,
          title: 'AI 모델 필요',
          subtitle: info
            ? `${info.name} (${info.sizeGB}GB) - ${info.desc}`
            : `${deviceCapability.modelId}`,
          showButton: true,
        };
      }
      case 'downloading':
        return {
          icon: 'cloud-download' as const,
          title: `다운로드 중... ${llmProgress}%`,
          subtitle: '앱을 열어두세요',
          showButton: false,
        };
      case 'loading':
        return {
          icon: 'cog' as const,
          title: '모델 로딩 중...',
          subtitle: `초기화 ${llmProgress}%`,
          showButton: false,
        };
      case 'error':
        return {
          icon: 'exclamation-triangle' as const,
          title: '모델 오류',
          subtitle: '탭하여 다시 다운로드',
          showButton: true,
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  return (
    <Pressable
      style={styles.container}
      onPress={content.showButton ? onDownload : undefined}
      disabled={!content.showButton}
    >
      <View style={styles.iconContainer}>
        {llmStatus === 'downloading' || llmStatus === 'loading' ? (
          <ActivityIndicator color="#e94560" size="small" />
        ) : (
          <FontAwesome name={content.icon} size={20} color="#e94560" />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
      </View>
      {content.showButton && (
        <FontAwesome name="chevron-right" size={14} color="#666688" />
      )}
      {llmStatus === 'downloading' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${llmProgress}%` }]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(233, 69, 96, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#8888aa',
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2a2a4e',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
  },
});
