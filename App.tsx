import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { FittingItem } from './features/fitting-operation-list/components/FittingItem';
import { DropdownSelect } from './features/fitting-operation-list/components/DropdownSelect';
import data from './features/fitting-operation-list/mocks/list-operation.json';
import { Fitting } from './features/fitting-operation-list/types/fitting';

/* =========================
 * Types
 * =======================*/
export type SortField =
  | 'fittingPermissionName'
  | 'stationBuildingName'
  | 'detailLocation'
  | null;
export type SortOrder = 'asc' | 'desc' | null;

/* =========================
 * Main Screen
 * =======================*/
export const FittingListScreen = () => {
  const navigation = useNavigation<any>();

  /** ---------- Filter & Sort State ---------- */
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

  /** ---------- Company (display-only) ---------- */
  const [company, setCompany] = useState<string>('Company A');
  const companyOptions = useMemo(
    () => ['Company A', 'Company B', 'Company C'],
    [],
  );

  /** ---------- Filter Modal (temp state) ---------- */
  const [modalVisible, setModalVisible] = useState(false);
  const [tempShowFavorites, setTempShowFavorites] = useState(showFavorites);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);
  const [tempAreaFilter, setTempAreaFilter] = useState(areaFilter);
  const [tempBuildingFilter, setTempBuildingFilter] = useState(buildingFilter);
  const [tempFittingTypeFilter, setTempFittingTypeFilter] =
    useState(fittingTypeFilter);
  const [tempSortField, setTempSortField] = useState<SortField>(sortField);
  const [tempSortOrder, setTempSortOrder] = useState<SortOrder>(sortOrder);

  /** ---------- Selection (long-press) ---------- */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const startSelection = (id: string) => {
    setSelectedIds(new Set([id]));
    setSelectionMode(true);
  };

  /** ---------- Derived Data (filter + sort) ---------- */
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
    if (!sortField || !sortOrder) return filteredData;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const A = (a[sortField] ?? '') as string;
      const B = (b[sortField] ?? '') as string;
      if (A < B) return sortOrder === 'asc' ? -1 : 1;
      if (A > B) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredData, sortField, sortOrder]);

  /** ---------- Lazy Load ---------- */
  const PAGE_SIZE = 10;
  const [visibleData, setVisibleData] = useState<Fitting[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const selectAllOnPage = useCallback(() => {
    setSelectedIds(
      selectedIds.size === visibleData.length
        ? new Set()
        : new Set(visibleData.map(f => f.deviceId)),
    );
  }, [selectedIds.size, visibleData]);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    setMoreMenuVisible(false);
  }, []);

  useEffect(() => {
    setPage(1);
    setVisibleData(sortedData.slice(0, PAGE_SIZE));
  }, [sortedData]);

  const loadMore = () => {
    if (loadingMore || visibleData.length >= sortedData.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      setVisibleData(sortedData.slice(0, nextPage * PAGE_SIZE));
      setPage(nextPage);
      setLoadingMore(false);
    }, 600);
  };

  /** ---------- Toggle Favorite ---------- */
  const toggleFavorite = (id: string) => {
    setVisibleData(prev =>
      prev.map(item =>
        item.deviceId === id
          ? { ...item, isfavorite: item.isfavorite ? 0 : 1 }
          : item,
      ),
    );
  };

  /** ---------- Pull to Refresh ---------- */
  const [refreshing, setRefreshing] = useState(false);
  const resetFilters = () => {
    setShowFavorites(false);
    setStatusFilter('All');
    setAreaFilter('All');
    setBuildingFilter('All');
    setFittingTypeFilter('All');
    setSortField(null);
    setSortOrder(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    resetFilters();
    setTimeout(() => {
      setPage(1);
      setVisibleData(data.slice(0, PAGE_SIZE));
      setRefreshing(false);
    }, 1000);
  };

  /** ---------- Apply Modal ---------- */
  const applyModal = () => {
    setShowFavorites(tempShowFavorites);
    setStatusFilter(tempStatusFilter);
    setAreaFilter(tempAreaFilter);
    setBuildingFilter(tempBuildingFilter);
    setFittingTypeFilter(tempFittingTypeFilter);
    setSortField(tempSortField);
    setSortOrder(tempSortOrder);
    setModalVisible(false);
  };

  const syncTempFromMain = useCallback(() => {
    setTempShowFavorites(showFavorites);
    setTempStatusFilter(statusFilter);
    setTempAreaFilter(areaFilter);
    setTempBuildingFilter(buildingFilter);
    setTempFittingTypeFilter(fittingTypeFilter);
    setTempSortField(sortField);
    setTempSortOrder(sortOrder);
  }, [
    areaFilter,
    buildingFilter,
    fittingTypeFilter,
    showFavorites,
    sortField,
    sortOrder,
    statusFilter,
  ]);

  /** ---------- Scroll To Top ---------- */
  const listRef = useRef<FlatList<Fitting>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const onScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    Animated.timing(fadeAnim, {
      toValue: y > 200 ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  /** ---------- Header Config ---------- */
  const hasFilterApplied =
    showFavorites ||
    statusFilter !== 'All' ||
    areaFilter !== 'All' ||
    buildingFilter !== 'All' ||
    fittingTypeFilter !== 'All' ||
    sortField !== null;

  const renderHeaderTitleSelect = useCallback(
    () => <Text style={styles.headerTitle}>{selectedIds.size} selected</Text>,
    [selectedIds.size],
  );

  const renderHeaderRightSelect = useCallback(
    () => (
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={exitSelection} style={styles.headerBtn}>
          <Text style={styles.dangerText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={selectAllOnPage} style={styles.headerBtn}>
          <Text style={styles.primaryText}>Select All</Text>
        </TouchableOpacity>
        {selectedIds.size > 0 && (
          <TouchableOpacity onPress={() => setMoreMenuVisible(true)}>
            <Icon name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    ),
    [exitSelection, selectAllOnPage, selectedIds.size],
  );

  const renderHeaderTitle = useCallback(
    () => (
      <DropdownSelect
        label=""
        options={companyOptions}
        value={company}
        onChange={setCompany}
        style={{ width: 120 }}
      />
    ),
    [company, companyOptions],
  );

  const renderHeaderRight = useCallback(
    () => (
      <TouchableOpacity
        onPress={() => {
          syncTempFromMain();
          setModalVisible(true);
        }}
        style={[styles.filterBtn, hasFilterApplied && styles.filterBtnActive]}
      >
        <Icon
          name="filter-list"
          size={24}
          color={hasFilterApplied ? '#fff' : '#333'}
        />
      </TouchableOpacity>
    ),
    [syncTempFromMain, hasFilterApplied],
  );
  useLayoutEffect(() => {
    if (selectionMode) {
      navigation.setOptions({
        headerTitle: renderHeaderTitleSelect,
        headerRight: renderHeaderRightSelect,
      });
    } else {
      navigation.setOptions({
        headerTitle: renderHeaderTitle,
        headerRight: renderHeaderRight,
      });
    }
  }, [
    selectionMode,
    navigation,
    renderHeaderTitleSelect,
    renderHeaderRightSelect,
    renderHeaderTitle,
    renderHeaderRight,
  ]);

  /** ---------- Render Helpers ---------- */
  const renderListItem = ({ item }: { item: Fitting }) => (
    <FittingItem
      item={item}
      sortField={sortField}
      selected={selectedIds.has(item.deviceId)}
      showCheckbox={selectionMode}
      onSelect={toggleSelect}
      onToggleFavorite={toggleFavorite}
      onLongPress={startSelection}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={visibleData}
        keyExtractor={item => item.deviceId}
        renderItem={renderListItem}
        ItemSeparatorComponent={renderSeparator}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={styles.footerLoading}
            />
          ) : null
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Scroll-to-top FAB */}
      <Animated.View style={[styles.scrollTopBtn, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() =>
            listRef.current?.scrollToOffset({ offset: 0, animated: true })
          }
        >
          <Icon name="arrow-upward" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* ✅ Modal Components tách ra ngoài */}
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={applyModal}
        tempShowFavorites={tempShowFavorites}
        setTempShowFavorites={setTempShowFavorites}
        tempStatusFilter={tempStatusFilter}
        setTempStatusFilter={setTempStatusFilter}
        tempAreaFilter={tempAreaFilter}
        setTempAreaFilter={setTempAreaFilter}
        tempBuildingFilter={tempBuildingFilter}
        setTempBuildingFilter={setTempBuildingFilter}
        tempFittingTypeFilter={tempFittingTypeFilter}
        setTempFittingTypeFilter={setTempFittingTypeFilter}
        tempSortField={tempSortField}
        setTempSortField={setTempSortField}
        tempSortOrder={tempSortOrder}
        setTempSortOrder={setTempSortOrder}
        resetTempFilters={resetFilters}
      />

      <MoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        navigation={navigation}
        selectedIds={selectedIds}
      />
    </View>
  );
};

/* =========================
 * FilterModal Component
 * =======================*/
type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  tempShowFavorites: boolean;
  setTempShowFavorites: (v: boolean) => void;
  tempStatusFilter: string;
  setTempStatusFilter: (v: any) => void;
  tempAreaFilter: string;
  setTempAreaFilter: (v: any) => void;
  tempBuildingFilter: string;
  setTempBuildingFilter: (v: any) => void;
  tempFittingTypeFilter: string | number;
  setTempFittingTypeFilter: (v: any) => void;
  tempSortField: SortField;
  setTempSortField: (v: SortField | null) => void;
  tempSortOrder: SortOrder;
  setTempSortOrder: (v: SortOrder | null) => void;
  resetTempFilters: () => void;
};

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  tempShowFavorites,
  setTempShowFavorites,
  tempStatusFilter,
  setTempStatusFilter,
  tempAreaFilter,
  setTempAreaFilter,
  tempBuildingFilter,
  setTempBuildingFilter,
  tempFittingTypeFilter,
  setTempFittingTypeFilter,
  tempSortField,
  setTempSortField,
  tempSortOrder,
  setTempSortOrder,
  resetTempFilters,
}) => {
  const areaOptions = ['All', ...Array.from(new Set(data.map(f => f.area)))];
  const buildingOptions = [
    'All',
    ...Array.from(new Set(data.map(f => f.stationBuildingName))),
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Options</Text>

          <FlatList
            data={[
              'favorites',
              'status',
              'area',
              'building',
              'fittingType',
              'sort',
            ]}
            keyExtractor={(key, idx) => `${key}-${idx}`}
            renderItem={({ item: key }) => {
              switch (key) {
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
                        onChange={val =>
                          setTempSortOrder(
                            val === 'None' ? null : (val as SortOrder),
                          )
                        }
                      />
                    </>
                  );
                default:
                  return null; // ✅ fix: luôn trả về null
              }
            }}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionCancel} onPress={onClose}>
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionCancel, { marginRight: 15 }]}
              onPress={resetTempFilters}
            >
              <Text style={[styles.actionText, { color: 'red' }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionApply} onPress={onApply}>
              <Text style={styles.actionTextApply}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =========================
 * MoreMenu Component
 * =======================*/
type MoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  selectedIds: Set<string>;
};

const MoreMenu: React.FC<MoreMenuProps> = ({
  visible,
  onClose,
  navigation,
  selectedIds,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.moreOverlay} onPress={onClose}>
        <View style={styles.moreMenu}>
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => {
              onClose();
              navigation.navigate('Detail', { ids: [...selectedIds] });
            }}
          >
            <Text style={styles.moreText}>Go to Detail</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreItem}
            onPress={() => {
              onClose();
              navigation.navigate('History', { ids: [...selectedIds] });
            }}
          >
            <Text style={styles.moreText}>Go to History</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

/* =========================
 * Styles
 * =======================*/
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 10 },
  separator: { height: 10 },
  footerLoading: { margin: 20 },

  // Header
  headerTitle: { fontSize: 16, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { marginRight: 15 },
  dangerText: { color: 'red' },
  primaryText: { color: '#007BFF' },

  // Filter button
  filterBtn: { padding: 8, borderRadius: 6, backgroundColor: '#eee' },
  filterBtnActive: { backgroundColor: '#007BFF' },

  // Scroll to top
  scrollTopBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },

  // Modal common
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

  // More menu
  moreOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  moreMenu: {
    marginTop: 50,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  moreItem: { paddingHorizontal: 20, paddingVertical: 12 },
  moreText: { fontSize: 16, color: '#333' },
});

/* =========================
 * Other Screens & Navigation
 * =======================*/
function HomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button onPress={() => navigation.navigate('List')}>Go to List</Button>
    </View>
  );
}

function DetailScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Detail Screen</Text>
    </View>
  );
}

function HistoryScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>History Screen</Text>
    </View>
  );
}

const Drawer = createDrawerNavigator({
  screens: {
    Home: HomeScreen,
    List: FittingListScreen,
    Detail: DetailScreen,
    History: HistoryScreen,
  },
});
const Navigation = createStaticNavigation(Drawer);

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
