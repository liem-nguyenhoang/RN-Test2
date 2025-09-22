import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';

/* ==============================
 * Modal component
 * ============================== */
const ConfirmOpenLinkModal = ({
  visible,
  url,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  url: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Mở liên kết</Text>
          <Text style={styles.message}>{url}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okBtn} onPress={onConfirm}>
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ==============================
 * Custom hook
 * ============================== */
export function useConfirmLink() {
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const confirmOpenLink = useCallback((link: string) => {
    setUrl(link);
    setVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setVisible(false);
    setUrl(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.warn('Không thể mở link:', url, err);
      }
    }
    setVisible(false);
    setUrl(null);
  }, [url]);

  const modal = (
    <ConfirmOpenLinkModal
      visible={visible}
      url={url}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );

  return { confirmOpenLink, modal };
}

/* ==============================
 * Demo App
 * ============================== */
export default function App() {
  const { confirmOpenLink, modal } = useConfirmLink();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#007bff',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={() => confirmOpenLink('https://www.google.com')}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Mở link Google</Text>
      </TouchableOpacity>

      {/* Modal được inject từ hook */}
      {modal}
    </View>
  );
}

/* ==============================
 * Styles
 * ============================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  cancelText: { fontSize: 16, color: '#666' },
  okBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  okText: { fontSize: 16, color: '#007bff', fontWeight: 'bold' },
});
