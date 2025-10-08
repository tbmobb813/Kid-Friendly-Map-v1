import React from 'react';
import { View, Text } from 'react-native';
import { simpleRender } from './test-utils';

test('sanity view', () => {
  const r = simpleRender(
    <View>
      <Text>ok</Text>
    </View>,
  );

  // Ensure 'r' is defined and has the correct type
  expect(r && r.root && r.root.findByType(Text).props.children).toBe('ok'); // Add check for r.root
});
