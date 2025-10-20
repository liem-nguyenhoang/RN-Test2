import { Button } from '@rneui/themed';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDoorControlStore } from '../../stores/useDoorControlStore';
import IncompleteOverlay from './IncompleteOverlay';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
type SlideToConfirmProps = {
  direction?: 'down' | 'up';
  length?: number;
  onSuccess: () => void;
  onIncomplete?: () => void;
};

export const SlideToConfirm: React.FC<SlideToConfirmProps> = ({
  direction = 'down',
  length = 250,
  onSuccess,
  onIncomplete,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const currentProgress = useRef(0);
  const doneRef = useRef(false);

  const [showIncompleteOverlay, setShowIncompleteOverlay] = useState(false);
  const { setShowActionModal } = useDoorControlStore();

  /** 🧠 Theo dõi giá trị progress */
  useEffect(() => {
    const id = progress.addListener(
      ({ value }) => (currentProgress.current = value),
    );
    return () => progress.removeListener(id);
  }, [progress]);

  /** 🧹 Reset thanh trượt */
  const resetSlider = () => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => (doneRef.current = false));
  };

  /** ✨ Hiệu ứng flash xanh khi hoàn thành */
  const playFlashEffect = (callback: () => void) => {
    flashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  /** 👆 Gesture logic */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const dy =
          direction === 'down'
            ? Math.max(0, Math.min(gesture.dy, length))
            : Math.max(-length, Math.min(gesture.dy, 0));

        progress.setValue(direction === 'down' ? dy : -dy);

        if (Math.abs(dy) >= length && !doneRef.current) {
          doneRef.current = true;
        }
      },
      onPanResponderRelease: () => {
        if (currentProgress.current >= length) {
          playFlashEffect(() => {
            onSuccess?.();
            setShowActionModal(null);
          });
        } else {
          onIncomplete?.();
          setShowIncompleteOverlay(true);
          resetSlider();
        }
      },
    }),
  ).current;

  /** 🔁 Animation mapping */
  const arrowTranslate = progress.interpolate({
    inputRange: [0, length],
    outputRange: [0, direction === 'down' ? length : -length],
    extrapolate: 'clamp',
  });

  const progressHeight = progress.interpolate({
    inputRange: [0, length],
    outputRange: ['0%', '100%'],
  });

  const progressColor = progress.interpolate({
    inputRange: [0, length],
    outputRange: ['#90caf9', '#1565c0'],
  });

  const iconColor = progress.interpolate({
    inputRange: [0, length],
    outputRange: ['#444', '#1565c0'],
  });

  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  /** 🖼 UI */
  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <Text style={styles.title}>Vuốt theo hướng mũi tên</Text>

      {/* Thanh slider */}
      <View
        style={[
          styles.track,
          {
            height: length + 80,
            flexDirection: direction === 'down' ? 'column-reverse' : 'column',
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
              ...(direction === 'down' ? { top: 0 } : { bottom: 0 }),
            },
          ]}
        />

        {/* Mũi tên */}
        <Animated.View
          style={[
            styles.arrowContainer,
            { transform: [{ translateY: arrowTranslate }] },
          ]}
        >
          <View style={styles.arrowCircle}>
            <AnimatedIcon
              name={direction === 'down' ? 'arrow-down' : 'arrow-up'}
              size={42}
              color={iconColor}
            />
          </View>
        </Animated.View>

        {/* Hiệu ứng flash xanh */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.flashOverlay,
            { opacity: flashOpacity },
          ]}
        />
      </View>

      <Text style={styles.tipText}>
        Kéo mũi tên {direction === 'down' ? 'xuống dưới' : 'lên trên'} để xác
        nhận
      </Text>

      <Button
        title="Cancel"
        onPress={() => setShowActionModal(null)}
        buttonStyle={styles.cancelButton}
      />

      {/* Overlay khi vuốt chưa đủ */}
      <IncompleteOverlay
        isVisible={showIncompleteOverlay}
        onClose={() => setShowIncompleteOverlay(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
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
  },
  progressFill: { position: 'absolute', width: '100%', borderRadius: 40 },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  arrowCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  flashOverlay: {
    backgroundColor: '#00e676',
    borderRadius: 40,
  },
  tipText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#757575',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});
