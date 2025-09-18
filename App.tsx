import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createStaticNavigation,
  useNavigation,
} from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Toast from 'react-native-toast-message';
import {
  StatusBar,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Text,
  Modal,
  Switch,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { FittingItem } from './features/fitting-operation-list/components/FittingItem';
import { DropdownSelect } from './features/fitting-operation-list/components/DropdownSelect';
import data from './features/fitting-operation-list/mocks/list-operation.json';
import { Fitting } from './features/fitting-operation-list/types/fitting';

type SortField =
  | 'fittingPermissionName'
  | 'stationBuildingName'
  | 'detailLocation'
  | null;
type SortOrder = 'asc' | 'desc' | null;

export const FittingListScreen = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  /** FILTER + SORT STATE */
  const [showFavorites, setShowFavorites] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Opening' | 'Closing'
  >('All');
  const [areaFilter, setAreaFilter] = useState<'All' | string>('All');
  const [buildingFilter, setBuildingFilter] = useState<'All' | string>('All');
  const [fittingTypeFilter, setFittingTypeFilter] = useState<'All' | 1 | 2>(
    'All',
  );
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  /** COMPANY (chỉ hiển thị, không filter) */
  const [company, setCompany] = useState<string>('Company A');
  const companyOptions = ['Company A', 'Company B', 'Company C'];

  // temp state (modal)
  const [tempShowFavorites, setTempShowFavorites] = useState(showFavorites);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);
  const [tempAreaFilter, setTempAreaFilter] = useState(areaFilter);
  const [tempBuildingFilter, setTempBuildingFilter] = useState(buildingFilter);
  const [tempFittingTypeFilter, setTempFittingTypeFilter] =
    useState(fittingTypeFilter);
  const [tempSortField, setTempSortField] = useState<SortField>(sortField);
  const [tempSortOrder, setTempSortOrder] = useState<SortOrder>(sortOrder);

  /** MULTI-SELECT STATE */
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setSelectAll(false);
  };

  const handleLongPress = (id: string) => {
    if (!multiSelectMode) {
      setMultiSelectMode(true);
      setSelectedIds(new Set([id]));
      setSelectAll(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(visibleData.map(f => f.deviceId)));
      setSelectAll(true);
    }
  };

  const exitMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedIds(new Set());
    setSelectAll(false);
  };

  /** FILTER + SORT DATA */
  const filteredData = useMemo(() => {
    return data.filter(f => {
      if (showFavorites && f.isfavorite !== 1) return false;
      if (statusFilter !== 'All' && f.status !== statusFilter) return false;
      if (areaFilter !== 'All' && f.area !== areaFilter) return false;
      if (buildingFilter !== 'All' && f.stationBuildingName !== buildingFilter)
        return false;
      if (fittingTypeFilter !== 'All' && f.fittingType !== fittingTypeFilter)
        return false;
      return true;
    });
  }, [
    showFavorites,
    statusFilter,
    areaFilter,
    buildingFilter,
    fittingTypeFilter,
  ]);

  const sortedData = useMemo(() => {
    let result = [...filteredData];
    if (sortField && sortOrder) {
      result.sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [filteredData, sortField, sortOrder]);

  /** LAZY LOAD */
  const [visibleData, setVisibleData] = useState<Fitting[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setVisibleData(sortedData.slice(0, 10));
  }, [sortedData]);

  const loadMore = () => {
    if (loadingMore || visibleData.length >= sortedData.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      setVisibleData(sortedData.slice(0, nextPage * 10));
      setPage(nextPage);
      setLoadingMore(false);
    }, 600);
  };

  /** PULL TO REFRESH */
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);

    setShowFavorites(false);
    setStatusFilter('All');
    setAreaFilter('All');
    setBuildingFilter('All');
    setFittingTypeFilter('All');
    setSortField(null);
    setSortOrder(null);

    setTimeout(() => {
      setPage(1);
      setVisibleData(data.slice(0, 10));
      setRefreshing(false);
    }, 1000);
  };

  /** MODAL APPLY */
  const handleApply = () => {
    setShowFavorites(tempShowFavorites);
    setStatusFilter(tempStatusFilter);
    setAreaFilter(tempAreaFilter);
    setBuildingFilter(tempBuildingFilter);
    setFittingTypeFilter(tempFittingTypeFilter);
    setSortField(tempSortField);
    setSortOrder(tempSortOrder);
    setModalVisible(false);
  };

  const resetTemp = () => {
    setTempShowFavorites(showFavorites);
    setTempStatusFilter(statusFilter);
    setTempAreaFilter(areaFilter);
    setTempBuildingFilter(buildingFilter);
    setTempFittingTypeFilter(fittingTypeFilter);
    setTempSortField(sortField);
    setTempSortOrder(sortOrder);
  };

  const areaOptions = ['All', ...Array.from(new Set(data.map(f => f.area)))];
  const buildingOptions = [
    'All',
    ...Array.from(new Set(data.map(f => f.stationBuildingName))),
  ];

  /** SCROLL TO TOP */
  const listRef = useRef<FlatList<Fitting>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    Animated.timing(fadeAnim, {
      toValue: y > 200 ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hasFilter =
    showFavorites ||
    statusFilter !== 'All' ||
    areaFilter !== 'All' ||
    buildingFilter !== 'All' ||
    fittingTypeFilter !== 'All' ||
    sortField !== null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Dropdown chọn Company (chỉ hiển thị) */}
        <DropdownSelect
          label=""
          options={companyOptions}
          value={company}
          onChange={setCompany}
          style={{ flex: 1, marginRight: 10 }}
        />

        {multiSelectMode ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={toggleSelectAll}
              style={{ marginRight: 15 }}
            >
              <Icon
                name={selectAll ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color="#007BFF"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={exitMultiSelect}>
              <Text style={{ color: 'red' }}>Cancel ({selectedIds.size})</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              resetTemp();
              setModalVisible(true);
            }}
            style={[
              styles.filterButton,
              hasFilter && styles.filterButtonActive,
            ]}
          >
            <Icon
              name="filter-list"
              size={24}
              color={hasFilter ? '#fff' : '#333'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        ref={listRef}
        data={visibleData}
        keyExtractor={item => item.deviceId}
        renderItem={({ item }) => (
          <FittingItem
            item={item}
            sortField={sortField}
            selected={selectedIds.has(item.deviceId)}
            showCheckbox={multiSelectMode}
            onSelect={handleSelect}
            onToggleFavorite={() => {}}
            onLongPress={handleLongPress}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={{ margin: 20 }}
            />
          ) : null
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Scroll To Top */}
      <Animated.View style={[styles.scrollTopButton, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
        >
          <Icon name="arrow-upward" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal Filter */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Options</Text>

            <FlatList
              data={[
                { type: 'favorites' },
                { type: 'status' },
                { type: 'area' },
                { type: 'building' },
                { type: 'fittingType' },
                { type: 'sort' },
              ]}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => {
                switch (item.type) {
                  case 'favorites':
                    return (
                      <View style={styles.row}>
                        <Text style={styles.label}>Only Favorites</Text>
                        <Switch
                          value={tempShowFavorites}
                          onValueChange={setTempShowFavorites}
                        />
                      </View>
                    );
                  case 'status':
                    return (
                      <DropdownSelect
                        label="Status"
                        options={['All', 'Opening', 'Closing']}
                        value={tempStatusFilter}
                        onChange={setTempStatusFilter}
                      />
                    );
                  case 'area':
                    return (
                      <DropdownSelect
                        label="Area"
                        options={areaOptions}
                        value={tempAreaFilter}
                        onChange={setTempAreaFilter}
                      />
                    );
                  case 'building':
                    return (
                      <DropdownSelect
                        label="Building"
                        options={buildingOptions}
                        value={tempBuildingFilter}
                        onChange={setTempBuildingFilter}
                      />
                    );
                  case 'fittingType':
                    return (
                      <DropdownSelect
                        label="Fitting Type"
                        options={['All', 1, 2]}
                        value={tempFittingTypeFilter}
                        onChange={setTempFittingTypeFilter}
                      />
                    );
                  case 'sort':
                    return (
                      <>
                        <Text style={[styles.modalTitle, { marginTop: 10 }]}>
                          Sort Options
                        </Text>
                        <DropdownSelect
                          label="Sort By"
                          options={[
                            'None',
                            'fittingPermissionName',
                            'stationBuildingName',
                            'detailLocation',
                          ]}
                          value={tempSortField ?? 'None'}
                          onChange={val => {
                            setTempSortField(
                              val === 'None' ? null : (val as SortField),
                            );
                            setTempSortOrder(null);
                          }}
                        />
                        <DropdownSelect
                          label="Order"
                          options={['None', 'asc', 'desc']}
                          value={tempSortOrder ?? 'None'}
                          onChange={val => {
                            setTempSortOrder(
                              val === 'None' ? null : (val as SortOrder),
                            );
                          }}
                        />
                      </>
                    );
                }
              }}
            />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionApply}
                onPress={handleApply}
              >
                <Text style={styles.actionTextApply}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButton: { padding: 8, borderRadius: 6, backgroundColor: '#eee' },
  filterButtonActive: { backgroundColor: '#007BFF' },
  separator: { height: 10 },
  scrollTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: { fontSize: 16, marginRight: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionCancel: { marginRight: 15 },
  actionApply: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: { fontSize: 16, color: '#333' },
  actionTextApply: { fontSize: 16, color: '#fff', fontWeight: '600' },
});

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button onPress={() => navigation.navigate('List')}>Go to List</Button>
    </View>
  );
}

const MyDrawer = createDrawerNavigator({
  screens: {
    Home: HomeScreen,
    List: FittingListScreen,
  },
});

const Navigation = createStaticNavigation(MyDrawer);

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Navigation />
      <Toast />
    </>
  );
}
