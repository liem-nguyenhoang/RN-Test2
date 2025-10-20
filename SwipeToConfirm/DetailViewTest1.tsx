import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SlideToConfirm } from './components/overlay/SlideToConfirmOverlay';
import { useDoorControlStore } from './stores/useDoorControlStore';

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
        onPress={() => handleOpenModal('open')}
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
