import { Button, Text } from '@rneui/themed';
import React from 'react';
import {
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Dimensions } from 'react-native';

export const spacing = (n: number = 1) => n * 8;

export const windowWidth = Dimensions.get('window').width;

export const windowHeight = Dimensions.get('window').height;

export const colors = {
  primary: '#0033cc',
  secondary: '#cc0033',
  text: '#393535',
  background: '#ffffff',
};

interface IProps {
  title?: string | null;
  iconName: string;
  iconSize?: number | null;
  containerStyle?: StyleProp<ViewStyle> | null;
  isActivated: boolean;
  onPress?: ((event: GestureResponderEvent) => void) | undefined;
}

function ButtonAction(props: IProps) {
  const {
    title,
    iconName,
    containerStyle,
    iconSize = spacing(6),
    isActivated = false,
    onPress,
  } = props;

  return (
    <Button
      onPress={onPress}
      type="clear"
      iconRight={false}
      containerStyle={[
        styles.containerBtnStyle,
        {
          backgroundColor: isActivated ? colors.primary : colors.background,
          width: title ? spacing(16) : spacing(10),
          height: title ? spacing(6) : spacing(10),
        },
        containerStyle,
      ]}
      buttonStyle={[
        styles.buttonStyle,
        {
          height: title ? spacing(20) : spacing(10),
          width: title ? spacing(16) : spacing(10),
          justifyContent: title ? 'space-evenly' : 'center',
        },
      ]}
    >
      <Icon
        name={iconName}
        size={iconSize as number}
        color={isActivated ? colors.background : colors.text}
      />
      {title ? (
        <Text
          style={[
            styles.text,
            {
              color: isActivated ? colors.background : colors.text,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
    </Button>
  );
}

export default React.memo(ButtonAction);

const styles = StyleSheet.create({
  containerBtnStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.text,
    borderWidth: spacing(0.1),
    borderRadius: spacing(5),
  },
  buttonStyle: {
    display: 'flex',
    flexDirection: 'row',
  },
  text: {
    width: spacing(8),
    textAlign: 'center',
    marginLeft: -spacing(1),
  },
});
