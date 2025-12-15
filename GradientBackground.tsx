import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  children: ReactNode;
};

export function GradientBackground({ children }: Props) {
  return (
    <LinearGradient
      colors={['#a855f7', '#6366f1']} // top purple → bottom indigo
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Layered water‑style waves at the bottom using only Views */}
      <View style={styles.waveLayerBack} />
      <View style={styles.waveLayerMid} />
      <View style={styles.waveLayerFront} />

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  waveLayerBack: {
    position: 'absolute',
    left: -80,
    right: -80,
    bottom: -30,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    transform: [{ scaleX: 1.2 }],
  },
  waveLayerMid: {
    position: 'absolute',
    left: -90,
    right: -90,
    bottom: -45,
    height: 250,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopLeftRadius: 250,
    borderTopRightRadius: 250,
    transform: [{ scaleX: 1.3 }],
  },
  waveLayerFront: {
    position: 'absolute',
    left: -100,
    right: -100,
    bottom: -70,
    height: 280,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 280,
    borderTopRightRadius: 280,
    transform: [{ scaleX: 1.4 }],
  },
});