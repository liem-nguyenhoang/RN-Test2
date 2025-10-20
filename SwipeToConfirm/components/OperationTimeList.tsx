import { Text } from '@rneui/themed';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing, windowWidth } from './ButtonAction';

function OperationTimeList() {
  return (
    <View style={styles.container}>
      <Text>OperationTimeList</Text>
    </View>
  );
}

export default React.memo(OperationTimeList);

const styles = StyleSheet.create({
  container: {
    width: windowWidth - spacing(15),
    paddingVertical: spacing(1),
    backgroundColor: 'red',
  },
});
