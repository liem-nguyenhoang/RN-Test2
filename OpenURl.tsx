import React from 'react';
import { SafeAreaView } from 'react-native';
import { ArrowSwipeProgress } from './ArrowSwipeProgress';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ArrowSwipeProgress direction="up" length={300} />
    </SafeAreaView>
  );
}
