import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useModelStore } from '@/src/stores/modelStore';
import { SUPPORTED_LOCALES } from '@/src/i18n';

export default function SettingsScreen() {
  const { companionName, locale, updateSetting } = useSettingsStore();
  const { deviceCapability, llmStatus, whisperStatus } = useModelStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Companion Settings */}
      <Text style={styles.sectionTitle}>동반자</Text>
      <View style={styles.card}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={companionName}
          onChangeText={(text) => updateSetting('companionName', text)}
          placeholder="동반자 이름 입력"
          placeholderTextColor="#666"
        />
      </View>

      {/* Language */}
      <Text style={styles.sectionTitle}>언어</Text>
      <View style={styles.card}>
        {SUPPORTED_LOCALES.map((loc) => (
          <Pressable
            key={loc.code}
            style={styles.localeRow}
            onPress={() => updateSetting('locale', loc.code)}
          >
            <Text style={styles.infoLabel}>{loc.label}</Text>
            <View style={[styles.radio, locale === loc.code && styles.radioActive]} />
          </Pressable>
        ))}
      </View>

      {/* Device Info */}
      <Text style={styles.sectionTitle}>디바이스</Text>
      <View style={styles.card}>
        <InfoRow label="성능 등급" value={deviceCapability.tier.toUpperCase()} />
        <InfoRow label="LLM 모델" value={deviceCapability.modelId} />
        <InfoRow label="음성 인식" value={deviceCapability.whisperModel} />
      </View>

      {/* Model Status */}
      <Text style={styles.sectionTitle}>모델</Text>
      <View style={styles.card}>
        <InfoRow label="LLM" value={llmStatus} />
        <InfoRow label="Whisper" value={whisperStatus} />
      </View>

      {/* App Info */}
      <Text style={styles.sectionTitle}>정보</Text>
      <View style={styles.card}>
        <InfoRow label="버전" value="0.1.0 (MVP)" />
        <InfoRow label="HERL" value="당신의 AI 동반자" />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    color: '#8888aa',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    color: '#ffffff',
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  infoLabel: {
    color: '#8888aa',
    fontSize: 14,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  localeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444466',
  },
  radioActive: {
    borderColor: '#e94560',
    backgroundColor: '#e94560',
  },
});
