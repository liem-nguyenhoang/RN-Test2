import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Easing,
  Alert,
  Text,
} from 'react-native';
import Svg, {
  Polygon,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  ClipPath,
  Rect,
  Circle,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

export const ArrowFillSwipeSvg = ({ direction = 'up', length = 300 }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Ánh sáng lướt dọc
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Sóng lan tỏa
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  // Fill animation
  React.useEffect(() => {
    progress.addListener(({ value }) => {
      Animated.timing(fillAnim, {
        toValue: value,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
    return () => progress.removeAllListeners();
  }, []);

  // Gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        let dy = direction === 'down' ? gesture.dy : -gesture.dy;
        dy = Math.max(0, Math.min(length, dy));
        progress.setValue(dy);
        setPercent(Math.round((dy / length) * 100));

        if (dy >= length && !done) {
          setDone(true);
          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(flashAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(flashAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ]).start();

          setTimeout(() => {
            Alert.alert('🎉 Thành công!', 'Bạn đã kéo đầy mũi tên!');
            setTimeout(() => {
              setDone(false);
              Animated.timing(progress, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
              }).start();
              setPercent(0);
            }, 1000);
          }, 300);
        }
      },
      onPanResponderRelease: () => {
        if (!done) {
          Animated.timing(progress, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }).start();
          setPercent(0);
        }
      },
    }),
  ).current;

  const clipHeight = fillAnim.interpolate({
    inputRange: [0, length],
    outputRange: [0, length],
    extrapolate: 'clamp',
  });

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  const waveOffset = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  const flashY = direction === 'up' ? 0 : length - 200;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vuốt để làm đầy mũi tên</Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <Svg height={length} width={150} viewBox="0 0 100 200">
          <Defs>
            {/* Fill chính */}
            <SvgGradient id="baseFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#00E5FF" />
              <Stop offset="0.5" stopColor="#00C853" />
              <Stop offset="1" stopColor="#76FF03" />
            </SvgGradient>

            {/* Sóng năng lượng */}
            <SvgGradient id="waveFill" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <Stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </SvgGradient>

            {/* Clip vùng đầy */}
            <ClipPath id="clipPath">
              <AnimatedRect
                y={direction === 'down' ? 0 : 200 - clipHeight}
                height={clipHeight}
                width="100%"
              />
            </ClipPath>
          </Defs>

          {/* Khung viền */}
          <Polygon
            points="50,0 100,70 70,70 70,200 30,200 30,70 0,70"
            fill="#E3F2FD"
            stroke="#1565C0"
            strokeWidth="2"
          />

          {/* Fill tĩnh */}
          <Polygon
            points="50,0 100,70 70,70 70,200 30,200 30,70 0,70"
            fill="url(#baseFill)"
            clipPath="url(#clipPath)"
          />

          {/* Fill lan tỏa năng lượng */}
          <AnimatedPolygon
            points="50,0 100,70 70,70 70,200 30,200 30,70 0,70"
            fill="url(#waveFill)"
            clipPath="url(#clipPath)"
            style={{
              transform: [{ translateX: waveOffset }],
            }}
          />

          {/* Flash nổ sáng */}
          <AnimatedCircle
            cx="50"
            cy={flashY + 20}
            r={flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 40],
            })}
            fill="rgba(255,255,255,0.8)"
            opacity={flashAnim}
          />
        </Svg>

        {/* Ánh sáng lướt dọc */}
        <Animated.View
          style={[
            styles.shine,
            {
              transform: [{ translateY: shineTranslate }],
              opacity: 0.4,
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* Phần trăm */}
        <View style={styles.percentContainer}>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>
      </Animated.View>

      <Text style={styles.tip}>
        Vuốt {direction === 'down' ? 'xuống dưới' : 'lên trên'} để làm đầy mũi
        tên
      </Text>
    </View>
  );
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D47A1',
    marginBottom: 30,
  },
  shine: {
    position: 'absolute',
    height: 120,
    width: 150,
    bottom: 0,
  },
  percentContainer: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
  },
  percentText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#004D40',
  },
  tip: {
    marginTop: 25,
    fontSize: 16,
    color: '#555',
  },
});
