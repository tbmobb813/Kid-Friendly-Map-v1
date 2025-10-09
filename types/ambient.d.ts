// Ambient type declarations for modules lacking TypeScript types in this project
declare module '@gorhom/bottom-sheet' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface BottomSheetProps extends ViewProps {
    index?: number;
    snapPoints?: (string | number)[];
    onChange?: (index: number) => void;
    enablePanDownToClose?: boolean;
    children?: React.ReactNode;
  }

  export interface BottomSheetHandleProps {
    children?: React.ReactNode;
  }

  export interface BottomSheetScrollViewProps extends ViewProps {
    children?: React.ReactNode;
  }

  export default class BottomSheet extends React.Component<BottomSheetProps> {}
  export const BottomSheetScrollView: React.ComponentType<BottomSheetScrollViewProps>;
  export const BottomSheetHandle: React.ComponentType<BottomSheetHandleProps>;
}
