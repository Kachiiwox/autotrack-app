import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { useSyncStatus } from './SyncStatusContext';

export default function SyncIndicator() {
  const { isOnline, pendingWritesCount, timeSinceLastPendingWrite } = useSyncStatus();
  const [pulse] = useState(new Animated.Value(1));
  const [warningLevel, setWarningLevel] = useState<'normal' | 'warn' | 'critical'>('normal');

  useEffect(() => {
    // Pulse animation when syncing
    if (isOnline && pendingWritesCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.5, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulse.setValue(1);
      pulse.stopAnimation();
    }
  }, [isOnline, pendingWritesCount]);

  useEffect(() => {
    if (pendingWritesCount === 0 || !timeSinceLastPendingWrite) {
      setWarningLevel('normal');
      return;
    }

    const interval = setInterval(() => {
      const offlineDuration = Date.now() - timeSinceLastPendingWrite;
      if (offlineDuration > 60 * 1000) { // 1 minute
        setWarningLevel('critical');
      } else if (offlineDuration > 30 * 1000) { // 30 seconds
        setWarningLevel('warn');
      } else {
        setWarningLevel('normal');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pendingWritesCount, timeSinceLastPendingWrite]);

  if (pendingWritesCount === 0) {
    return (
      <View style={[styles.container, styles.synced]}>
        <Text style={styles.text}>✓ Synced</Text>
      </View>
    );
  }

  if (isOnline) {
    return (
      <Animated.View style={[styles.container, styles.syncing, { opacity: pulse }]}>
        <Text style={styles.text}>↻ Syncing {pendingWritesCount} changes...</Text>
      </Animated.View>
    );
  }

  if (warningLevel === 'critical' && Platform.OS !== 'web') {
    return (
      <View style={[styles.container, styles.critical]}>
        <Text style={styles.boldText}>⚠️ {pendingWritesCount} Unsynced Changes</Text>
        <Text style={styles.subText}>DO NOT FORCE CLOSE APP</Text>
        <Text style={styles.subText}>Please reconnect to internet to save data.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, warningLevel === 'warn' ? styles.warn : styles.offline]}>
      <Text style={styles.text}>
        {warningLevel === 'warn' ? '⚠️ ' : '⬇️ '}{pendingWritesCount} changes pending
      </Text>
      {Platform.OS !== 'web' && warningLevel === 'warn' && (
        <Text style={styles.subText}>Reconnect soon to prevent data loss</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  synced: {
    backgroundColor: '#e6f4ea',
  },
  syncing: {
    backgroundColor: '#e8f0fe',
  },
  offline: {
    backgroundColor: '#fef7e0',
  },
  warn: {
    backgroundColor: '#fce8e6',
  },
  critical: {
    backgroundColor: '#d93025',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  boldText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  }
});
