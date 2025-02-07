import {
  View,
  Text,
  StyleSheet,
  type ViewProps,
  type TextStyle,
} from 'react-native';

interface IButton extends ViewProps {
  title: string;
  varient: 'primary' | 'secondary';
  tintColor: string;
  textStyle?: TextStyle;
}

const Button = (props: IButton) => {
  const { title, varient, tintColor, style, textStyle } = props;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: varient === 'primary' ? tintColor : 'white',
          borderWidth: varient === 'secondary' ? 1 : 0,
          borderColor: tintColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: varient === 'primary' ? 'white' : tintColor,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingVertical: 10,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '500',
  },
});
