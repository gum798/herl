import React from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { useModelStore } from '@/src/stores/modelStore';
import { SUPPORTED_LOCALES, useTranslation } from '@/src/i18n';
import { PERSONA_PRESETS, PERSONA_ORDER } from '@/src/services/personas';
import type { PersonaPresetId } from '@/src/types';

export default function SettingsScreen() {
  const {
    companionName,
    locale,
    personaPresetId,
    personaCustomPrompt,
    updateSetting,
  } = useSettingsStore();
  const { deviceCapability, llmStatus, whisperStatus } = useModelStore();
  const { t, locale: currentLocale } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Companion Settings */}
      <Text style={styles.sectionTitle}>{t('settingsCompanion')}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>{t('settingsName')}</Text>
        <TextInput
          style={styles.input}
          value={companionName}
          onChangeText={(text) => updateSetting('companionName', text)}
          placeholder="동반자 이름 입력"
          placeholderTextColor="#666"
        />
      </View>

      {/* Persona */}
      <Text style={styles.sectionTitle}>{t('settingsPersona')}</Text>
      <Text style={styles.sectionHint}>{t('settingsPersonaHint')}</Text>
      <View style={styles.card}>
        {PERSONA_ORDER.map((id, idx) => {
          const isCustom = id === 'custom';
          const preset = isCustom ? null : PERSONA_PRESETS[id as Exclude<PersonaPresetId, 'custom'>];
          const label = isCustom
            ? t('settingsPersonaCustomLabel')
            : currentLocale === 'en' ? preset!.labelEn : preset!.labelKo;
          const description = isCustom
            ? null
            : currentLocale === 'en' ? preset!.descriptionEn : preset!.descriptionKo;
          const active = personaPresetId === id;
          const isLast = idx === PERSONA_ORDER.length - 1;
          return (
            <Pressable
              key={id}
              style={[styles.personaRow, isLast && styles.personaRowLast]}
              onPress={() => updateSetting('personaPresetId', id)}
            >
              <View style={styles.personaTextWrap}>
                <Text style={styles.personaLabel}>{label}</Text>
                {description && <Text style={styles.personaDescription}>{description}</Text>}
              </View>
              <View style={[styles.radio, active && styles.radioActive]} />
            </Pressable>
          );
        })}

        {personaPresetId === 'custom' && (
          <View style={styles.customPromptWrap}>
            <TextInput
              style={styles.customPromptInput}
              value={personaCustomPrompt}
              onChangeText={(text) => updateSetting('personaCustomPrompt', text)}
              placeholder={t('settingsPersonaCustomPlaceholder')}
              placeholderTextColor="#555"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.customPromptHint}>{t('settingsPersonaCustomHint')}</Text>
          </View>
        )}
      </View>

      {/* Language */}
      <Text style={styles.sectionTitle}>{t('settingsLanguage')}</Text>
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
      <Text style={styles.sectionTitle}>{t('settingsDevice')}</Text>
      <View style={styles.card}>
        <InfoRow label={t('settingsTier')} value={deviceCapability.tier.toUpperCase()} />
        <InfoRow label={t('settingsLlmModel')} value={deviceCapability.modelId} />
        <InfoRow label={t('settingsWhisper')} value={deviceCapability.whisperModel} />
      </View>

      {/* Model Status */}
      <Text style={styles.sectionTitle}>{t('settingsModels')}</Text>
      <View style={styles.card}>
        <InfoRow label={t('settingsLlm')} value={llmStatus} />
        <InfoRow label="Whisper" value={whisperStatus} />
      </View>

      {/* App Info */}
      <Text style={styles.sectionTitle}>{t('settingsAbout')}</Text>
      <View style={styles.card}>
        <InfoRow label={t('settingsVersion')} value="0.2.0" />
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
  sectionHint: {
    color: '#8888aa',
    fontSize: 12,
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
  personaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4e',
  },
  personaRowLast: {
    borderBottomWidth: 0,
  },
  personaTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  personaLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  personaDescription: {
    color: '#8888aa',
    fontSize: 12,
    marginTop: 2,
  },
  customPromptWrap: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  customPromptInput: {
    color: '#ffffff',
    fontSize: 14,
    backgroundColor: '#0f1830',
    borderRadius: 8,
    padding: 12,
    minHeight: 110,
  },
  customPromptHint: {
    color: '#666688',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
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
