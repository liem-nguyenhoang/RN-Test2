import { Button, Overlay, Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

function IncompleteOverlay({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) {
  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.incompleteBox}
    >
      <View style={{ alignItems: 'center' }}>
        <Icon name="alert-circle" size={50} color="#f44336" />
        <Text style={styles.incompleteTitle}>Vuốt chưa đủ!</Text>
        <Text style={styles.incompleteDesc}>
          Vui lòng vuốt hết thanh để xác nhận hành động.
        </Text>
        <Button
          title="Thử lại"
          onPress={onClose}
          buttonStyle={styles.retryButton}
        />
      </View>
    </Overlay>
  );
}

export default IncompleteOverlay;

const styles = StyleSheet.create({
  incompleteBox: {
    width: 280,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  incompleteTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f',
  },
  incompleteDesc: {
    marginTop: 6,
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
  },

  retryButton: {
    marginTop: 15,
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
