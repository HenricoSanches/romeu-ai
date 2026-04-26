import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types';
import { Colors, Typography, Spacing, Radii } from '../styles/theme';
import RomeuAvatar from './RomeuAvatar';

interface Props {
  message: ChatMessage;
}

const formatTime = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const ChatBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.text}</Text>
          <Text style={styles.timeUser}>{formatTime(message.createdAt)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.romeuRow}>
      <RomeuAvatar size={32} />
      <View style={styles.romeuBubble}>
        <Text style={styles.romeuText}>{message.text}</Text>
        <Text style={styles.timeRomeu}>{formatTime(message.createdAt)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ─── User ────────────────────────────────────────────────────────────────────
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
    paddingLeft: 60,
  },
  userBubble: {
    backgroundColor: Colors.bubbleUser,
    borderRadius: Radii.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    maxWidth: '85%',
  },
  userText: {
    color: Colors.white,
    fontSize: Typography.fontSizeMD,
    lineHeight: 22,
  },
  timeUser: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Typography.fontSizeXS,
    marginTop: 4,
    textAlign: 'right',
  },

  // ─── Romeu ───────────────────────────────────────────────────────────────────
  romeuRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    paddingRight: 60,
    gap: Spacing.sm,
  },
  romeuBubble: {
    backgroundColor: Colors.bubbleRomeu,
    borderRadius: Radii.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  romeuText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeMD,
    lineHeight: 22,
  },
  timeRomeu: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    marginTop: 4,
  },
});

export default ChatBubble;
