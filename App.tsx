import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { OpenCodeProvider, useOpenCode, Session } from './src/providers/OpenCodeProvider';
import { useTheme } from './src/hooks/useTheme';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { Icon } from './src/components/Icon';
import { spacing } from './src/theme';

type Tab = 'sessions' | 'settings';

function AppContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { theme, colors: c } = useTheme();
  
  const {
    connected,
    connecting,
    error,
    serverUrl,
    connect,
    disconnect,
    setServerUrl,
    sessions,
    sessionsLoading,
    sessionsRefreshing,
    refreshSessions,
    getSessionMessages,
    isSessionMessagesLoading,
    isSessionMessagesRefreshing,
    refreshSessionMessages,
    subscribeToSession,
    unsubscribeFromSession,
  } = useOpenCode();

  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);

  // Auto-connect on mount
  useEffect(() => {
    if (!autoConnectAttempted) {
      setAutoConnectAttempted(true);
      connect();
    }
  }, [autoConnectAttempted, connect]);

  const handleConnect = useCallback(() => {
    connect(serverUrl);
  }, [connect, serverUrl]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setSelectedSession(null);
  }, [disconnect]);

  const handleSelectSession = useCallback((session: Session) => {
    setSelectedSession(session);
    subscribeToSession(session.id);
  }, [subscribeToSession]);

  const handleBackFromChat = useCallback(() => {
    unsubscribeFromSession();
    setSelectedSession(null);
  }, [unsubscribeFromSession]);

  // Show connect screen if not connected
  if (!connected) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ConnectScreen
          serverUrl={serverUrl}
          onServerUrlChange={setServerUrl}
          onConnect={handleConnect}
          connecting={connecting}
          error={error}
        />
      </>
    );
  }

  // Show chat screen if session is selected
  if (selectedSession) {
    const messages = getSessionMessages(selectedSession.id);
    const loading = isSessionMessagesLoading(selectedSession.id);
    const refreshing = isSessionMessagesRefreshing(selectedSession.id);
    
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ChatScreen
          session={selectedSession}
          messages={messages}
          loading={loading}
          refreshing={refreshing}
          onRefresh={() => refreshSessionMessages(selectedSession.id)}
          onBack={handleBackFromChat}
        />
      </>
    );
  }

  // Main tabbed interface
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={theme.container}>
        {activeTab === 'sessions' ? (
          <SessionsScreen
            sessions={sessions}
            loading={sessionsLoading}
            refreshing={sessionsRefreshing}
            onRefresh={refreshSessions}
            onSelectSession={handleSelectSession}
          />
        ) : (
          <SettingsScreen
            serverUrl={serverUrl}
            onDisconnect={handleDisconnect}
          />
        )}

        {/* Tab Bar */}
        <View style={styles.tabBarContainer}>
          <BlurView
            intensity={isDark ? 60 : 80}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.tabBarBlur, { borderTopColor: c.border }]}
          >
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('sessions')}
              activeOpacity={0.7}
            >
              <Icon 
                name="message-square" 
                size={22} 
                color={activeTab === 'sessions' ? c.accent : c.textMuted} 
              />
              <Text style={[
                styles.tabLabel,
                { color: activeTab === 'sessions' ? c.accent : c.textMuted }
              ]}>
                Sessions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('settings')}
              activeOpacity={0.7}
            >
              <Icon 
                name="settings" 
                size={22} 
                color={activeTab === 'settings' ? c.accent : c.textMuted} 
              />
              <Text style={[
                styles.tabLabel,
                { color: activeTab === 'settings' ? c.accent : c.textMuted }
              ]}>
                Settings
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    </>
  );
}

export default function App() {
  return (
    <OpenCodeProvider>
      <AppContent />
    </OpenCodeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBlur: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
