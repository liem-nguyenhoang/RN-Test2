import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Alert,
  StyleSheet,
  Easing,
  Text,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { height } = Dimensions.get('window');

type ArrowSwipeProgressProps = {
  direction?: 'up' | 'down';
  length?: number;
};

export const ArrowSwipeProgress: React.FC<ArrowSwipeProgressProps> = ({
  direction = 'down',
  length = 250,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        let dy = gesture.dy;
        if (direction === 'down') {
          dy = Math.max(0, Math.min(dy, length));
          progress.setValue(dy);
        } else {
          dy = Math.max(-length, Math.min(dy, 0));
          progress.setValue(-dy);
        }

        const percent = (dy / length) * 100;
        if (percent >= 95 && !done) {
          setDone(true);
          Animated.timing(progress, {
            toValue: length,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            Alert.alert('🎉 Hoàn thành', 'Bạn đã vuốt hết mũi tên!');
            setTimeout(() => {
              setDone(false);
              Animated.timing(progress, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }).start();
            }, 1200);
          });
        }
      },
      onPanResponderRelease: () => {
        if (!done) {
          Animated.timing(progress, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const arrowTranslate = progress.interpolate({
    inputRange: [0, length],
    outputRange: [0, direction === 'down' ? length : -length],
    extrapolate: 'clamp',
  });

  const progressHeight = progress.interpolate({
    inputRange: [0, length],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const progressColor = progress.interpolate({
    inputRange: [0, length],
    outputRange: ['#6CC3FF', '#00E676'], // chuyển từ xanh dương → xanh lá
    extrapolate: 'clamp',
  });

  return (
    <LinearGradient colors={['#f8fbff', '#e3f2fd']} style={styles.background}>
      <Text style={styles.title}>Vuốt theo hướng mũi tên</Text>

      <View
        style={[
          styles.track,
          {
            height: length + 40,
            flexDirection: direction === 'down' ? 'column' : 'column-reverse',
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Thanh tiến trình */}
        <Animated.View
          style={[
            styles.progressFill,
            {
              height: progressHeight,
              backgroundColor: progressColor as any,
            },
          ]}
        />

        {/* Mũi tên di chuyển */}
        <Animated.View
          style={[
            styles.arrowContainer,
            {
              transform: [{ translateY: arrowTranslate }],
            },
          ]}
        >
          <View style={styles.arrowCircle}>
            <Icon
              name={direction === 'down' ? 'arrow-down' : 'arrow-up'}
              size={42}
              color={done ? '#00E676' : '#333'}
            />
          </View>
        </Animated.View>
      </View>

      <Text style={styles.tipText}>
        Kéo mũi tên {direction === 'down' ? 'xuống dưới' : 'lên trên'} để hoàn
        tất
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
    color: '#0d47a1',
  },
  track: {
    width: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 40,
  },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tipText: {
    marginTop: 25,
    fontSize: 16,
    color: '#555',
  },
});
