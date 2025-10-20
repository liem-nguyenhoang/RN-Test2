import React from 'react';
import { StyleSheet, View } from 'react-native';
import ButtonAction from './ButtonAction';
import { useDoorStore } from '../stores/useDoorStore';
import { useDeviceControlStore } from '../stores/useDeviceControlStore';

function GroupButton() {
  const {
    isPoweredOn,
    isRunning,
    isOpen,
    position,
    open,
    close,
    moveUp,
    moveDown,
    stop,
  } = useDeviceControlStore();

  const { type } = useDoorStore();

  if (!isPoweredOn || !type) return;

  if (type === 'shutter') {
    return (
      <View style={styles.groupBtnShutter}>
        <ButtonAction
          iconName="arrow-drop-up"
          title={'up'}
          onPress={moveUp}
          isActivated={isRunning && position === 'up'}
        />
        <ButtonAction
          iconName="stop"
          title={'stop'}
          onPress={stop}
          isActivated={!isRunning}
        />
        <ButtonAction
          iconName="arrow-drop-down"
          title={'down'}
          onPress={moveDown}
          isActivated={isRunning && position === 'down'}
        />
      </View>
    );
  }

  if (type === 'door') {
    return (
      <View style={styles.groupBtnDoor}>
        <ButtonAction
          iconName="door-open"
          title={'open'}
          onPress={open}
          isActivated={isRunning && isOpen}
        />
        <ButtonAction
          iconName="stop"
          title={'close'}
          onPress={close}
          isActivated={!isRunning && !isOpen}
        />
      </View>
    );
  }
}

export default React.memo(GroupButton);

const styles = StyleSheet.create({
  groupBtnShutter: {
    justifyContent: 'space-between',
    marginHorizontal: 'auto',
    minHeight: '32%',
    height: '32%',
  },
  groupBtnDoor: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 'auto',
    alignItems: 'center',
    width: '100%',
    minHeight: '32%',
    height: '32%',
  },
});
