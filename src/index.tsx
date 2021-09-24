import { NativeModules } from 'react-native';

type FlareLaneType = {
  multiply(a: number, b: number): Promise<number>;
};

const { FlareLane } = NativeModules;

export default FlareLane as FlareLaneType;
