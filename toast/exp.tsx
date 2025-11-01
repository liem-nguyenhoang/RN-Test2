import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useToastStore } from './useToastStore';
import { ScanToast } from './ScanToast';

export const App = () => {
  const { show, hide } = useToastStore();

  const handleStartScan = () => {
    show('🔍 Đang quét thiết bị...');
    setTimeout(() => hide(), 4000); // giả lập scan xong sau 4s
  };

  return (
    <View style={styles.container}>
      <Button title="Bắt đầu quét" onPress={handleStartScan} />
      <ScanToast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
