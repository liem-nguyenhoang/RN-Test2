import React from 'react';
import { Button, View } from 'react-native';
import { exportDatabase } from '../utils/exportDatabase';

export const DebugScreen = () => {
  return (
    <View style={{ marginTop: 80 }}>
      <Button title="📤 Export Database" onPress={exportDatabase} />
    </View>
  );
};
