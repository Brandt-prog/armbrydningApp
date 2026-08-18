import { Keyboard, TouchableWithoutFeedback, View, type ViewProps } from 'react-native'

export function DismissKeyboardView({ children, style, ...rest }: ViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1 }, style]} {...rest}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  )
}