import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SlideToConfirm } from './components/overlay/SlideToConfirmOverlay';
import { useDoorControlStore } from './stores/useDoorControlStore';
import Config from 'react-native-config';

Config.API_URL; // 'https://myapi.com'
Config.GOOGLE_MAPS_API_KEY; // 'abcdefgh'

import * as Sentry from '@sentry/react-native';
import { logDebug, logError, logInfo, logWarn } from '../logger/logger';
import { useNavigation } from '@react-navigation/native';
Sentry.init({
  dsn: 'https://9a513dbf5edec2ff6f0c66fa6be33970@o4510233943277568.ingest.us.sentry.io/4510233944653824',
  environment: 'staging',
  // enableAutoSessionTracking: true,
  // debug: Config.ENV === 'staging',
  // debug: true,
  // tracesSampleRate: 1.0,
  enableLogs: true,
  // beforeSend(event) {
  //   if (__DEV__) return null;
  //   return event;
  // },
});

export const DoorControlScreen = () => {
  const { activeAction, setActiveAction, showActionModal, setShowActionModal } =
    useDoorControlStore();

  const handleConfirmSuccess = () => {
    if (showActionModal) {
      setActiveAction(showActionModal);
      setShowActionModal(null);
    }
  };

  const handleIncomplete = () => {
    console.log('❌ Vuốt chưa đủ!');
  };

  const handleOpenModal = (action: 'open' | 'close') => {
    setShowActionModal(action);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Điều khiển cửa</Text>

      <Button
        title="Open"
        color="#43a047"
        // onPress={() => handleOpenModal('open')}
        onPress={() => {
          try {
            logInfo('Log Info');
            logWarn('Log Warring');
            logDebug('Log debug');
            useNavigation().dispatch(() => {});
          } catch (error) {
            logError(error.message, { error });
          }
        }}
      />
      <View style={styles.spacing} />
      <Button
        title="Close"
        color="#e53935"
        onPress={() => handleOpenModal('close')}
      />

      <Text style={styles.statusText}>
        Trạng thái hiện tại:{' '}
        {activeAction ? activeAction.toUpperCase() : 'Chưa chọn'}
      </Text>

      {/* Overlay Modal */}
      {showActionModal && (
        <View style={StyleSheet.absoluteFill} pointerEvents="auto">
          <SlideToConfirm
            direction={showActionModal === 'open' ? 'down' : 'up'}
            onSuccess={handleConfirmSuccess}
            onIncomplete={handleIncomplete}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 40,
  },
  spacing: { height: 10 },
  statusText: {
    marginTop: 40,
    fontSize: 18,
    color: '#333',
  },
});

export default DoorControlScreen;
