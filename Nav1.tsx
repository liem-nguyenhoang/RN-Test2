import React, {
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
} from 'react';
import {
  Button,
  Text,
  View,
  StatusBar,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Pressable,
  Animated,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const HEADER_HEIGHT = 60;

// ---------- Context để quản lý menu global ----------
const MenuContext = createContext<any>(null);
const useMenu = () => useContext(MenuContext);

// ----------- CUSTOM HEADER -----------
function CustomHeader({
  navigation,
  route,
  options,
  back,
}: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const title = options.title ?? route.name;
  const { toggleMenu } = useMenu();

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
      ]}
    >
      <View style={styles.headerContent}>
        {back ? (
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.headerButton}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        ) : navigation.toggleDrawer ? (
          <TouchableOpacity
            onPress={navigation.toggleDrawer}
            style={styles.headerButton}
          >
            <Icon name="menu" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        {route.name === 'ListCard' ? (
          <TouchableOpacity onPress={toggleMenu} style={styles.headerButton}>
            <Icon name="more-vert" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>
    </View>
  );
}

// ----------- MENU OVERLAY (global) -----------
function MenuOverlay({ navigation }: any) {
  const { menuVisible, closeMenu, menuAnim } = useMenu();
  const insets = useSafeAreaInsets();

  if (!menuVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
        onPress={closeMenu}
      />
      <Animated.View
        style={[
          styles.dropdownMenu,
          {
            opacity: menuAnim,
            transform: [
              {
                translateY: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              },
            ],
            position: 'absolute',
            top: HEADER_HEIGHT + insets.top - 10,
            right: 12,
            zIndex: 200,
          },
        ]}
      >
        <Pressable
          android_ripple={{ color: '#ddd' }}
          style={styles.menuItem}
          onPress={() => {
            closeMenu();
            navigation.navigate('Profile');
          }}
        >
          <Text style={styles.menuText}>Go to Profile</Text>
        </Pressable>
        <Pressable
          android_ripple={{ color: '#ddd' }}
          style={styles.menuItem}
          onPress={() => {
            closeMenu();
            navigation.navigate('Setting');
          }}
        >
          <Text style={styles.menuText}>Go to Setting</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ------- Hook chặn thoát ở Drawer root -------
function useBlockBackOnDrawerRoot(navigation: any) {
  const { menuVisible, closeMenu } = useMenu();
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (menuVisible) {
          closeMenu();
          return true;
        }
        if (isDrawerOpen) {
          navigation.closeDrawer();
          return true;
        }
        return true; // chặn thoát app
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [menuVisible, closeMenu, isDrawerOpen, navigation]),
  );
}

// ----------- SCREENS -----------

// ✅ Login có nhấn 2 lần để thoát
function LoginScreen({ navigation }) {
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        } else {
          setBackPressedOnce(true);
          ToastAndroid.show('Nhấn lần nữa để thoát', ToastAndroid.SHORT);
          setTimeout(() => setBackPressedOnce(false), 2000);
          return true;
        }
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [backPressedOnce]),
  );

  return (
    <View style={styles.center}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={() => navigation.replace('TwoFA')} />
    </View>
  );
}

// ✅ TwoFA: back về Login
function TwoFAScreen({ navigation }) {
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        navigation.replace('Login'); // luôn quay về Login
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [navigation]),
  );

  return (
    <View style={styles.center}>
      <Text>TwoFA Screen</Text>
      <Button title="Verify" onPress={() => navigation.replace('AppDrawer')} />
    </View>
  );
}

function TermsScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text>Terms & Conditions</Text>
      <Button title="Accept" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

function HomeScreen({ navigation }: any) {
  const { menuVisible, closeMenu } = useMenu();
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (menuVisible) {
          closeMenu();
          return true;
        }
        if (isDrawerOpen) {
          navigation.closeDrawer();
          return true;
        }

        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        } else {
          setBackPressedOnce(true);
          ToastAndroid.show('Nhấn lần nữa để thoát', ToastAndroid.SHORT);
          setTimeout(() => setBackPressedOnce(false), 2000);
          return true;
        }
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [menuVisible, closeMenu, isDrawerOpen, backPressedOnce, navigation]),
  );

  return (
    <View style={styles.center}>
      <Text>Home Screen</Text>
    </View>
  );
}

function ListCardScreen({ navigation }: any) {
  useBlockBackOnDrawerRoot(navigation);
  return (
    <View style={styles.center}>
      <Text>List Card Screen</Text>
      <Button
        title="Go to Detail"
        onPress={() => navigation.navigate('DetailCard')}
      />
    </View>
  );
}

function PolicyScreen({ navigation }: any) {
  useBlockBackOnDrawerRoot(navigation);
  return (
    <View style={styles.center}>
      <Text>Policy Screen</Text>
    </View>
  );
}

function DetailCardScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text>Detail Card Screen</Text>
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const route = useRoute();
  const from = (route as any).params?.from;
  return (
    <View style={styles.center}>
      <Text>Profile Screen</Text>
      <Button
        title="Back"
        onPress={() =>
          from ? navigation.navigate(from as never) : navigation.goBack()
        }
      />
    </View>
  );
}

function SettingScreen({ navigation }) {
  const route = useRoute();
  const from = (route as any).params?.from;
  return (
    <View style={styles.center}>
      <Text>Setting Screen</Text>
      <Button
        title="Back"
        onPress={() =>
          from ? navigation.navigate(from as never) : navigation.goBack()
        }
      />
    </View>
  );
}

// ----------- DRAWER -----------
function CustomDrawerContent(props: any) {
  const { navigation, state } = props;
  const insets = useSafeAreaInsets();
  const currentRoute = state.routeNames[state.index];

  const DrawerItem = ({ label, icon, routeName, onPress }: any) => {
    const active = currentRoute === routeName;
    return (
      <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
        <Icon name={icon} size={22} color={active ? '#007bff' : '#333'} />
        <Text
          style={[styles.drawerText, { color: active ? '#007bff' : '#333' }]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: insets.top + 10 }}
    >
      <DrawerItem
        label="Home"
        icon="home"
        routeName="Home"
        onPress={() => navigation.navigate('Home')}
      />
      <DrawerItem
        label="List Card"
        icon="list"
        routeName="ListCard"
        onPress={() => navigation.navigate('ListCard')}
      />
      <DrawerItem
        label="Policy"
        icon="gavel"
        routeName="Policy"
        onPress={() => navigation.navigate('Policy')}
      />
      <DrawerItem
        label="Terms"
        icon="description"
        routeName="Terms"
        onPress={() => navigation.navigate('Terms')}
      />
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => navigation.replace('Login')}
      >
        <Icon name="logout" size={22} color="red" />
        <Text style={[styles.drawerText, { color: 'red' }]}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

function AppDrawerScreen({ navigation }: any) {
  return (
    <>
      <Drawer.Navigator
        screenOptions={{ header: props => <CustomHeader {...props} /> }}
        drawerContent={props => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="ListCard" component={ListCardScreen} />
        <Drawer.Screen name="Policy" component={PolicyScreen} />
        <Drawer.Screen name="Terms" component={TermsScreen} />
      </Drawer.Navigator>
      <MenuOverlay navigation={navigation} />
    </>
  );
}

// ----------- ROOT STACK + PROVIDER -----------
export default function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigationRef = useNavigationContainerRef();

  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  const closeMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };
  const toggleMenu = () => (menuVisible ? closeMenu() : openMenu());

  return (
    <SafeAreaProvider>
      <MenuContext.Provider
        value={{ menuVisible, openMenu, closeMenu, toggleMenu, menuAnim }}
      >
        <NavigationContainer ref={navigationRef}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator
            screenOptions={{ header: props => <CustomHeader {...props} /> }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen
              name="TwoFA"
              component={TwoFAScreen}
              options={{ title: 'TwoFA' }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ title: 'Terms' }}
            />
            <Stack.Screen
              name="AppDrawer"
              component={AppDrawerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DetailCard"
              component={DetailCardScreen}
              options={{ title: 'Detail' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profile' }}
            />
            <Stack.Screen
              name="Setting"
              component={SettingScreen}
              options={{ title: 'Setting' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </MenuContext.Provider>
    </SafeAreaProvider>
  );
}

// ----------- STYLES -----------
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    backgroundColor: '#f8f8f8',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
      },
      android: { elevation: 4 },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerButton: { width: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 6,
    width: 160,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  menuItem: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 4 },
  menuText: { fontSize: 16, color: '#333' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  drawerText: { fontSize: 16, marginLeft: 10, color: '#333' },
});
