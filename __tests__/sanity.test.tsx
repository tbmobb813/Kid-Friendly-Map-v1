import React from 'react';
import { View, Text } from 'react-native';
import { simpleRender } from './test-utils';

test('sanity view', () => {
  const r = simpleRender(
    <View>
      <Text>ok</Text>
    </View>,
  ) as any; // assert as any so TS recognizes .root

  expect(r.root.findByType(Text).props.children).toBe('ok');
});
