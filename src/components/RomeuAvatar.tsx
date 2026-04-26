import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors, Radii } from '../styles/theme';

interface Props {
  size?: number;
}

const RomeuAvatar: React.FC<Props> = ({ size = 36 }) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Image
        source={require('../assets/romeuSmiling.png')}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});

export default RomeuAvatar;