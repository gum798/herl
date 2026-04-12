import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView } from 'react-native';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useModelStore } from '@/src/stores/modelStore';

export default function SettingsScreen() {
  const { companionName, updateSetting } = useSettingsStore();
  const { deviceCapability, llmStatus, whisperStatus } = useModelStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Companion Settings */}
      <Text style={styles.sectionTitle}>Companion</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={companionName}
          onChangeText={(text) => updateSetting('companionName', text)}
          placeholder="Enter companion name"
          placeholderTextColor="#666"
        />
      </View>

      {/* Device Info */}
      <Text style={styles.sectionTitle}>Device</Text>
      <View style={styles.card}>
        <InfoRow label="Tier" value={deviceCapability.tier.toUpperCase()} />
        <InfoRow label="LLM Model" value={deviceCapability.modelId} />
        <InfoRow label="Whisper" value={deviceCapability.whisperModel} />
      </View>

      {/* Model Status */}
      <Text style={styles.sectionTitle}>Models</Text>
      <View style={styles.card}>
        <InfoRow label="LLM" value={llmStatus} />
        <InfoRow label="Whisper" value={whisperStatus} />
      </View>

      {/* App Info */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <InfoRow label="Version" value="0.1.0 (MVP)" />
        <InfoRow label="HERL" value="Your AI Companion" />
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
    textTransform: 'uppercase',
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
});
