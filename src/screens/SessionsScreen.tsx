import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Icon } from '../components/Icon';
import { spacing, typography } from '../theme';
import type { Session, SessionWithPreview } from '../providers/OpenCodeProvider';

interface SessionsScreenProps {
  sessions: SessionWithPreview[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onSelectSession: (session: Session) => void;
}

export function SessionsScreen({
  sessions,
  loading,
  refreshing,
  onRefresh,
  onSelectSession,
}: SessionsScreenProps) {
  const { theme, colors: c } = useTheme();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const renderSession = ({ item }: { item: SessionWithPreview }) => (
    <TouchableOpacity
      style={[styles.sessionItem, { borderBottomColor: c.divider }]}
      onPress={() => onSelectSession(item)}
      activeOpacity={0.7}
    >
      <View style={styles.sessionContent}>
        <View style={styles.sessionHeader}>
          <Text style={[styles.sessionTitle, { color: c.text }]} numberOfLines={1}>
            {item.title || 'Untitled Session'}
          </Text>
          <Text style={[styles.sessionTime, { color: c.textMuted }]}>
            {formatDate(item.updatedAt || item.createdAt)}
          </Text>
        </View>
        {item.preview && (
          <Text style={[styles.sessionPreview, { color: c.textSecondary }]} numberOfLines={1}>
            {item.preview}
          </Text>
        )}
      </View>
      
      <Icon name="chevron-right" size={18} color={c.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={theme.container}>
      {/* Header */}
      <View style={[theme.header]}>
        <View>
          <Text style={theme.title}>Sessions</Text>
          <Text style={[theme.small, theme.textSecondary]}>
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.accent}
          />
        }
        contentContainerStyle={[
          styles.list,
          sessions.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="inbox" size={48} color={c.textMuted} />
            <Text style={[theme.subtitle, { marginTop: spacing.lg, color: c.text }]}>
              {loading ? 'Loading...' : 'No Sessions'}
            </Text>
            <Text style={[theme.body, theme.textSecondary, styles.emptyText]}>
              {loading 
                ? 'Fetching your sessions' 
                : 'Start a conversation in OpenCode to see it here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  sessionContent: {
    flex: 1,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sessionTitle: {
    ...typography.bodyMedium,
    flex: 1,
  },
  sessionTime: {
    ...typography.caption,
  },
  sessionPreview: {
    ...typography.small,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
