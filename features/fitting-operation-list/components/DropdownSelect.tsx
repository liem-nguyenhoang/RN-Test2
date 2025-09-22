import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props<T> = {
  label?: string;
  options: T[];
  value: T;
  onChange: (val: T) => void;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
};

export function DropdownSelect<T extends string | number>({
  label,
  options,
  value,
  onChange,
  maxHeight = 250,
  style,
}: Props<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[{ marginBottom: 15 }, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Ô hiển thị */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.valueText}>{String(value)}</Text>
        <Icon name="arrow-drop-down" size={24} color="#333" />
      </TouchableOpacity>

      {/* Modal hiển thị danh sách */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight }]}>
            <FlatList
              data={options}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionActive]}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextActive,
                    ]}
                  >
                    {String(item)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, marginBottom: 6 },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1c7aa',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  valueText: { fontSize: 14, color: '#333' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '100%',
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionActive: { backgroundColor: '#007BFF22' },
  optionText: { fontSize: 14, color: '#333' },
  optionTextActive: { fontWeight: '600', color: '#007BFF' },
  closeBtn: { padding: 10, alignItems: 'center' },
  closeText: { color: 'red', fontSize: 16 },
});
