import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyText}>No conversations yet.</Text>
      <Text style={styles.emptySubtext}>
        Start chatting with HERL to see your conversation history here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8888aa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
