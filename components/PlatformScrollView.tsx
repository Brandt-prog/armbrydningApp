import { Platform, ScrollView, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

/**
 * On native (iOS/Android), uses KeyboardAwareScrollView so the keyboard
 * never covers the field you're typing in. On web, the browser already
 * handles this — using KeyboardAwareScrollView there causes issues, so
 * we fall back to a plain ScrollView.
 */
export function PlatformScrollView(props: ScrollViewProps & { extraScrollHeight?: number; enableOnAndroid?: boolean }) {
  if (Platform.OS === 'web') {
    const { extraScrollHeight, enableOnAndroid, ...rest } = props
    return <ScrollView {...rest} />
  }
  return <KeyboardAwareScrollView {...props} />
}