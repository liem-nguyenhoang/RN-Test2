/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { Fitting } from '../types/fitting';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(true);
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
    // Toast.show({
    //   type: 'success',
    //   text1: 'Copied!',
    //   text2: `DeviceID ${text} đã được copy vào clipboard.`,
    //   position: 'bottom',
    //   visibilityTime: 1500,
    // });

    // Reset icon sau 1.5s
    setTimeout(() => setCopied(false), 1500);
  };

  const permissions = ['フルコントロール', '権限付与', '開閉のみ'];

  const fittingType = [
    'シャッター',
    'ドア(自動施錠あり)',
    'ドア(自動施錠なし)',
  ];

  const fittingStatus = ['全開', '全閉', '中間', '開錠', '施錠'];
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
          // navigation.navigate('Detail');
        }
      }}
    >
      <View style={[styles.header, { justifyContent: 'space-between' }]}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
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
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 4,
            }}
          >
            <Text style={[styles.title, { fontSize: 18 }]}>
              {item.fittingId}
            </Text>
            <TouchableOpacity onPress={() => handleCopy(item.deviceId)}>
              <Icon
                name={copied ? 'check' : 'content-copy'}
                size={16}
                color={copied ? 'green' : '#555'}
                style={styles.copyIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              styles.title,
              { fontSize: 12, marginRight: 4, color: '#007BFF' },
            ]}
          >
            {permissions[item.fittingPermissionName] ?? permissions[0]}
          </Text>
          <TouchableOpacity onPress={() => onToggleFavorite(item.deviceId)}>
            <Icon
              name={item.isfavorite ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={item.isfavorite ? 'orange' : '#999'}
            />
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#333"
          />
        </TouchableOpacity> */}
      </View>

      {/* DeviceID + copy icon */}
      {/* <View style={styles.row}>
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
      </View> */}

      {sortField && (
        <Text style={styles.sortFieldText}>{extraFieldMap[sortField]}</Text>
      )}

      {expanded && (
        <View style={{}}>
          <View style={styles.rowText}>
            <Text>建具記号</Text>
            <Text>{item.fittingName}</Text>
          </View>
          <View style={styles.rowText}>
            <Text>建具種類</Text>
            <Text>{fittingType[item.fittingType]}</Text>
          </View>
          <View style={styles.rowText}>
            <Text>通信機ID</Text>
            <Text>{item.deviceId}</Text>
          </View>
          <View style={styles.rowText}>
            <Text>建物名</Text>
            <Text>{item.stationBuildingName}</Text>
          </View>
          <View style={styles.rowText}>
            <Text>エリア</Text>
            <Text>{item.area}</Text>
          </View>
          <View style={styles.rowText}>
            <Text>詳細場所</Text>
            <Text>{item.detailLocation}</Text>
          </View>
          <View style={styles.rowText}>
            <Text>建具状態</Text>
            <Text>{fittingStatus[item.status]}</Text>
          </View>

          {/* <Text
            style={item.status === 'Opening' ? styles.opening : styles.closing}
          >
            ステータス: {item.status}
          </Text> */}
        </View>
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
  rowText: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
