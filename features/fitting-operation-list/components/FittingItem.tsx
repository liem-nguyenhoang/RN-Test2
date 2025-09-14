import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  showCheckbox: boolean; // hiện checkbox khi multiSelectMode = true
  onLongPress: (id: string) => void; // nhấn giữ để bật chọn nhiều
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

  const extraFieldMap: Record<string, string> = {
    fittingPermissionName: `Permission: ${item.fittingPermissionName}`,
    stationBuildingName: `Building: ${item.stationBuildingName}`,
    detailLocation: `Location: ${item.detailLocation}`,
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
          // setExpanded(!expanded);
          // TODO: navigate to detail
        }
      }}
    >
      <View style={styles.header}>
        {/* Checkbox */}
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

        {/* Bookmark */}
        <TouchableOpacity onPress={() => onToggleFavorite(item.deviceId)}>
          <Icon
            name={item.isfavorite ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={item.isfavorite ? 'orange' : '#999'}
          />
        </TouchableOpacity>

        {/* Expand/Collapse */}
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      {/* Always show deviceId + fittingId */}
      <Text style={styles.title}>
        DeviceID: {item.deviceId} | FittingID: {item.fittingId}
      </Text>

      {/* Show sort field */}
      {sortField && (
        <Text style={styles.sortFieldText}>{extraFieldMap[sortField]}</Text>
      )}

      {/* Expanded info */}
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
  checkbox: {
    marginRight: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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
