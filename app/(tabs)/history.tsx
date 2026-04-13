import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { fetchConversations } from '@/src/services/sync';

interface ConversationItem {
  id: string;
  summary: string;
  mood: string;
  startedAt: string;
  messageCount: number;
}

const MOOD_COLORS: Record<string, string> = {
  default: '#8888aa',
};

export default function HistoryScreen() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadConversations = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchConversations(20, 0);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: ConversationItem }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => {
        // TODO: Navigate to conversation detail
        console.log('Open conversation:', item.id);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
        {item.mood && item.mood !== 'unknown' && (
          <View style={styles.moodBadge}>
            <Text style={styles.moodText}>{item.mood}</Text>
          </View>
        )}
      </View>
      <Text style={styles.summary} numberOfLines={2}>
        {item.summary}
      </Text>
      <View style={styles.cardFooter}>
        <FontAwesome name="comment-o" size={12} color="#666688" />
        <Text style={styles.messageCount}>{item.messageCount} messages</Text>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color="#e94560" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadConversations(true)}
            tintColor="#e94560"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="clock-o" size={48} color="#333355" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start chatting with HERL to see your{'\n'}conversation history here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: '#8888aa',
    fontSize: 13,
    fontWeight: '500',
  },
  moodBadge: {
    backgroundColor: 'rgba(233, 69, 96, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  moodText: {
    color: '#e94560',
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageCount: {
    color: '#666688',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8888aa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
