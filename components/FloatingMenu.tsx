import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { HelpCircle, Accessibility, Menu, Navigation } from 'lucide-react-native';

const FloatingMenu = ({ onRecenter, onHelp, onToggleAccessibility }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ alignItems: 'center' }}>
      {open && (
        <View style={{ marginBottom: 8, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              onRecenter?.();
              setOpen(false);
            }}
            style={{ marginVertical: 6 }}
            accessibilityLabel="Recenter map"
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#4F8EF7',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 8,
              }}
            >
              <Navigation color="#fff" size={22} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onHelp?.();
              setOpen(false);
            }}
            style={{ marginVertical: 6 }}
            accessibilityLabel="Help"
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#F7B500',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 8,
              }}
            >
              <HelpCircle color="#fff" size={22} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              onToggleAccessibility?.();
              setOpen(false);
            }}
            style={{ marginVertical: 6 }}
            accessibilityLabel="Toggle accessibility mode"
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#98DDA1',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 8,
              }}
            >
              <Accessibility color="#fff" size={22} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => setOpen((o) => !o)} accessibilityLabel="Open menu">
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#2D3748',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 12,
          }}
        >
          <Menu color="#fff" size={28} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingMenu;
