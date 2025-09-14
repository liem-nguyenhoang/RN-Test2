import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

type Props<T> = {
  label?: string;
  options: T[];
  value: T;
  onChange: (val: T) => void;
  maxHeight?: number;
};

export function SelectList<T extends string | number>({
  label,
  options,
  value,
  onChange,
  maxHeight = 200,
}: Props<T>) {
  return (
    <View style={{ marginBottom: 15 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={{ maxHeight }}>
        <FlatList
          data={options}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionButton,
                value === item && styles.optionButtonActive,
              ]}
              onPress={() => onChange(item)}
            >
              <Text
                style={[
                  styles.optionText,
                  value === item && styles.optionTextActive,
                ]}
              >
                {String(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, marginBottom: 8 },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 4,
  },
  optionButtonActive: { backgroundColor: '#007BFF', borderColor: '#007BFF' },
  optionText: { fontSize: 14, color: '#333' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
});
