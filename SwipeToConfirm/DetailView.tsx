import ButtonAction from '@features/components/ButtonAction';
import OperationTimeList from '@features/components/OperationTimeList';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Text } from '@rneui/themed';
import { FITTING_TYPE_KEY } from '@shared/constants/database';
import React, { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import GroupButton from '../components/GroupButton';
import { useDeviceControlStore } from '../stores/useDeviceControlStore';
import { useDoorStore } from '../stores/useDoorStore';
import { styles } from './styles';
import { spacing } from '@common/theme/metrics';
import SlideToConfirm from '../components/overlay/SlideToConfirm';

type DoorManualParams = {
  fittingName?: string;
  fittingType?: number;
};

function DoorManualView() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, DoorManualParams>, string>>();
  const { t } = useTranslation();

  const data = route.params;

  const { isPoweredOn, turnOn, turnOff } = useDeviceControlStore();

  const { setDoorInfo } = useDoorStore();

  useLayoutEffect(() => {
    const { fittingName, fittingType } = data;
    let titleText = fittingName ?? '';

    setDoorInfo({
      type: fittingType === FITTING_TYPE_KEY.SHUTTER ? 'shutter' : 'door',
    });

    switch (fittingType) {
      case FITTING_TYPE_KEY.SHUTTER:
        titleText += ' shutter';
        break;

      case FITTING_TYPE_KEY.DOOR_AUTO_LOCK:
      case FITTING_TYPE_KEY.DOOR_WITHOUT_AUTO_LOCK:
        titleText += ' door';
        break;
    }

    navigation.setOptions({ title: titleText });
  }, []);

  return <SlideToConfirm />;

  return (
    <View style={styles.container}>
      <Text style={styles.titleList}>time</Text>

      <View style={{ justifyContent: 'space-between' }}>
        {/* List data */}
        <View style={styles.list}>
          <OperationTimeList />
          <ButtonAction
            iconName="power-settings-new"
            containerStyle={styles.btnPower}
            isActivated={isPoweredOn}
            onPress={isPoweredOn ? turnOff : turnOn}
          />
        </View>

        <GroupButton />
      </View>
    </View>
  );
}

export default React.memo(DoorManualView);
