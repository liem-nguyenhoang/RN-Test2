import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { Fitting } from '../types/fitting';

type SortField =
  | 'fittingPermissionName'
  | 'stationBuildingName'
  | 'detailLocation'
  | null;

type Props = {
  item: Fitting;
  onSelect: (id: string) => void;
  selected: boolean;
  onToggleFavorite: (id: string) => void;
  sortField: SortField;
  showCheckbox: boolean;
  onLongPress: (id: string) => void;
};

export const FittingItem = ({
  item,
  onSelect,
  selected,
  onToggleFavorite,
  sortField,
  showCheckbox,
  onLongPress,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const extraFieldMap: Record<string, string> = {
    fittingPermissionName: `Permission: ${item.fittingPermissionName}`,
    stationBuildingName: `Building: ${item.stationBuildingName}`,
    detailLocation: `Location: ${item.detailLocation}`,
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);

    // Hiện toast
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: `DeviceID ${text} đã được copy vào clipboard.`,
      position: 'bottom',
      visibilityTime: 1500,
    });

    // Reset icon sau 1.5s
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onLongPress={() => onLongPress(item.deviceId)}
      onPress={() => {
        if (showCheckbox) {
          onSelect(item.deviceId);
        } else {
          // TODO: navigate to detail
        }
      }}
    >
      <View style={styles.header}>
        {showCheckbox && (
          <TouchableOpacity
            onPress={() => onSelect(item.deviceId)}
            style={styles.checkbox}
          >
            <Icon
              name={selected ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={selected ? '#007BFF' : '#999'}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => onToggleFavorite(item.deviceId)}>
          <Icon
            name={item.isfavorite ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={item.isfavorite ? 'orange' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* DeviceID + copy icon */}
      <View style={styles.row}>
        <Text style={styles.title}>
          DeviceID: {item.deviceId} | FittingID: {item.fittingId}
        </Text>
        <TouchableOpacity onPress={() => handleCopy(item.deviceId)}>
          <Icon
            name={copied ? 'check' : 'content-copy'}
            size={20}
            color={copied ? 'green' : '#555'}
            style={styles.copyIcon}
          />
        </TouchableOpacity>
      </View>

      {sortField && (
        <Text style={styles.sortFieldText}>{extraFieldMap[sortField]}</Text>
      )}

      {expanded && (
        <>
          <Text>名前: {item.fittingName}</Text>
          <Text>エリア: {item.area}</Text>
          <Text>位置: {item.detailLocation}</Text>
          <Text>建物: {item.stationBuildingName}</Text>
          <Text
            style={item.status === 'Opening' ? styles.opening : styles.closing}
          >
            ステータス: {item.status}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIcon: {
    marginLeft: 8,
  },
  checkbox: {
    marginRight: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sortFieldText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  opening: {
    color: 'green',
    fontWeight: '600',
  },
  closing: {
    color: 'red',
    fontWeight: '600',
  },
});
