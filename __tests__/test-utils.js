import React from 'react';
import TestRenderer from 'react-test-renderer';

const { act } = TestRenderer;

// Improved render function that wraps in act() and keeps the renderer mounted
export function simpleRender(component) {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(component);
  });
  return renderer;
}

// Simplified query helpers that work with test renderer
export function getByTestId(instance, testID) {
  const results = instance.root.findAll((node) => node.props && node.props.testID === testID);
  if (results.length === 0) {
    throw new Error(`Could not find element with testID: ${testID}`);
  }
  return results[0];
}

export function queryByTestId(instance, testID) {
  try {
    return getByTestId(instance, testID);
  } catch (e) {
    return null;
  }
}

// Create fireEvent mock with act() wrapping
export const fireEvent = {
  press: (element) => {
    if (element.props.onPress) {
      act(() => {
        element.props.onPress();
      });
    }
  },
  // Add a more flexible method that takes arbitrary event name and payload
  fire: (element, eventName, eventData) => {
    if (element.props[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`]) {
      const handler = element.props[`on${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`];
      act(() => {
        handler(eventData);
      });
    }
  },
};

// Export act for other async operations
export { act };

// Basic test to validate utility functions
describe('Test utilities', () => {
  it('should export required testing utilities', () => {
    expect(simpleRender).toBeDefined();
    expect(getByTestId).toBeDefined();
    expect(queryByTestId).toBeDefined();
    expect(fireEvent).toBeDefined();
    expect(act).toBeDefined();
  });

  it('should render a simple component', () => {
    const TestComponent = () => React.createElement('div', { testID: 'test' }, 'Hello');
    const renderer = simpleRender(React.createElement(TestComponent));
    expect(renderer).toBeDefined();
    expect(renderer.toJSON()).toBeTruthy();
  });
});
