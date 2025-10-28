/* eslint-disable react-native/no-inline-styles */
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
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { FittingItem } from './features/fitting-operation-list/components/FittingItem';
import { DropdownSelect } from './features/fitting-operation-list/components/DropdownSelect';
import data from './features/fitting-operation-list/mocks/list-operation.json';
import { Fitting } from './features/fitting-operation-list/types/fitting';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://9a513dbf5edec2ff6f0c66fa6be33970@o4510233943277568.ingest.us.sentry.io/4510233944653824',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const { width, height } = Dimensions.get('window');

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
  const [company, setCompany] = useState<string>('株式会社さくら');
  const companyOptions = useMemo(
    () => ['株式会社さくら', '管理会社 1', '管理会社 2', '管理会社 3'],
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
    () => <Text style={styles.headerTitle}>{selectedIds.size} 件選択中</Text>,
    [selectedIds.size],
  );

  const renderHeaderRightSelect = useCallback(
    () => (
      <View style={styles.headerRight}>
        <Text style={styles.headerTitle}>{selectedIds.size} 件選択中</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={exitSelection} style={styles.headerBtn}>
            <Text style={styles.dangerText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={selectAllOnPage}
            style={[styles.headerBtn, { margin: 12 }]}
          >
            <Text style={styles.primaryText}>すべて選択</Text>
          </TouchableOpacity>
          {selectedIds.size > 0 && (
            <TouchableOpacity
              onPress={() => setMoreMenuVisible(true)}
              style={{ padding: 12 }}
            >
              <Icon name="more-vert" size={24} color="#333" />
            </TouchableOpacity>
          )}
        </View>
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
        headerTitle: () => null,
        headerRight: renderHeaderRightSelect,
      });
    } else {
      navigation.setOptions({
        headerTitle: null,
        headerRight: null,
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
    <View style={[styles.container, { padding: 0 }]}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: 12,
        }}
      >
        <DropdownSelect
          label=""
          options={companyOptions}
          value={company}
          onChange={setCompany}
          style={{ width: 300, marginBottom: 0 }}
        />

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
      </View>
      <FlatList
        style={{ paddingHorizontal: 12 }}
        ref={listRef}
        data={visibleData}
        keyExtractor={item => item.deviceId}
        renderItem={renderListItem}
        ItemSeparatorComponent={renderSeparator}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<View style={{ height: 8 }} />}
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

  const [typeFitting, setTypeFitting] = useState<string>('建具全て');
  const [conditionFitting, setConditionFitting] = useState<string>('全開');

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView
            style={{
              display: 'flex',
              flex: 1,
              height: '80%',
              padding: 12,
            }}
          >
            <Text style={styles.modalTitle}>ソートオプション</Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <DropdownSelect
                label="並び替え基準"
                options={['無し', '駅/建物名', 'エリア', '詳細場所']}
                value={tempSortField ?? '無し'}
                onChange={val => {
                  setTempSortField(val === '無し' ? null : (val as SortField));
                  setTempSortOrder(null);
                }}
                style={{ width: '50%' }}
              />
              <DropdownSelect
                label="並び順"
                options={['無し', '昇順', '降順']}
                value={tempSortOrder ?? '無し'}
                onChange={val =>
                  setTempSortOrder(val === '無し' ? null : (val as SortOrder))
                }
                style={{ width: '40%' }}
              />
            </View>

            <Text style={styles.modalTitle}>フィルターオプション</Text>

            <View style={styles.modalInputContainer}>
              <Text style={styles.label}>建具ID</Text>
              <TextInput
                placeholder="検索キーワードを入力"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.label}>建具記号</Text>
              <TextInput
                placeholder="検索キーワードを入力"
                style={styles.modalInput}
              />
            </View>

            <DropdownSelect
              value={typeFitting}
              onChange={setTypeFitting}
              label="建具種類"
              options={[
                '建具全て',
                'シャッター',
                'ドア(自動施錠あり)',
                'ドア(自動施錠なし)',
              ]}
            />

            <View style={styles.modalInputContainer}>
              <Text style={styles.label}>通信機ID</Text>
              <TextInput
                placeholder="検索キーワードを入力"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.label}>駅/建物名</Text>
              <TextInput
                placeholder="検索キーワードを入力"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.label}>エリア</Text>
              <TextInput
                placeholder="検索キーワードを入力"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.label}>詳細場所</Text>
              <TextInput
                placeholder="検索キーワードを入力"
                style={styles.modalInput}
              />
            </View>

            <DropdownSelect
              value={conditionFitting}
              onChange={setConditionFitting}
              label="建具状態"
              options={['全開', '全閉', '中間', '解錠', '施錠', '建具状態']}
            />

            <View
              style={[
                styles.actions,
                { justifyContent: 'space-between', alignItems: 'center' },
              ]}
            >
              <TouchableOpacity onPress={resetTempFilters}>
                <Text style={styles.actionText}>リセット</Text>
              </TouchableOpacity>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  style={[styles.actionCancel, { marginHorizontal: 12 }]}
                  onPress={onClose}
                >
                  <Text style={[styles.actionText, { color: 'red' }]}>
                    キャンセル
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionApply} onPress={onApply}>
                  <Text style={styles.actionTextApply}>確認</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  separator: { height: 12 },
  footerLoading: { margin: 20 },

  // Header
  headerTitle: { fontSize: 16, fontWeight: '600' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width - 44,
  },
  headerBtn: {},
  dangerText: { color: 'red' },
  primaryText: { color: '#007BFF' },

  // Filter button
  filterBtn: { padding: 8, borderRadius: 6, backgroundColor: '#eee' },
  filterBtnActive: { backgroundColor: '#d1c7aa' },

  // Scroll to top
  scrollTopBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#d1c7aa',
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
    elevation: 5,
    height: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: { fontSize: 16, marginRight: 10 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginBottom: 32,
  },
  actionCancel: {
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionApply: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: { fontSize: 16, color: '#333' },
  actionTextApply: { fontSize: 16, color: '#007BFF', fontWeight: 600 },

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
  modalInputContainer: { display: 'flex', gap: 8 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1c7aa',
    borderRadius: 6,
  },
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
  initialRouteName: 'List',
});
const Navigation = createStaticNavigation(Drawer);

export default Sentry.wrap(function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Navigation />
      <Toast />
    </>
  );
});
