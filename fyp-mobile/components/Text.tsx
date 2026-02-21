import { useThemeColor } from "@/hooks/useThemeColour";
import { useMemo } from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  center?: boolean;
  bold?: boolean;
  color?: string;
  flex?: boolean;
  header?: boolean;
  heading1?: boolean;
  heading2?: boolean;
  emphasis?: boolean;
  paragraph?: boolean;
  subtitle?: boolean;
  label?: boolean;
  semibold?: boolean;
}

const Text = ({
  children,
  center,
  bold,
  color,
  header,
  heading1,
  heading2,
  emphasis,
  paragraph,
  subtitle,
  label,
  semibold,
  ...props
}: TextProps) => {
  const textColor = useThemeColor({}, "text");

  const TextStyle = useMemo(() => {
    return StyleSheet.flatten([
      { color: color ?? textColor },
      styles.default,
      center && styles.center,
      bold && styles.bold,
      header && styles.header,
      heading1 && styles.heading1,
      heading2 && styles.heading2,
      emphasis && styles.emphasis,
      paragraph && styles.paragraph,
      subtitle && styles.subtitle,
      label && styles.label,
      semibold && styles.semibold,
    ]);
  }, [
    color,
    textColor,
    center,
    bold,
    header,
    heading1,
    heading2,
    emphasis,
    paragraph,
    subtitle,
    label,
    semibold,
  ]);

  return (
    <RNText style={TextStyle} {...props}>
      {children}
    </RNText>
  );
};

export default Text;

const styles = StyleSheet.create({
  default: {
    fontFamily: "Akatav-Black",
  },
  header: {
    fontSize: 24,
    lineHeight: 28,
  },
  heading1: {
    fontSize: 28,
    lineHeight: 38,
  },
  heading2: {
    fontSize: 22,
    lineHeight: 26,
  },
  emphasis: {
    fontSize: 50,
    lineHeight: 55,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 16,
  },
  label: {
    fontSize: 18,
    lineHeight: 20,
  },
  bold: {
    fontFamily: "Akatab-Bold",
  },
  semibold: {
    fontFamily: "Akatab-SemiBold",
  },
  center: {
    textAlign: "center",
  },
  flex: {
    flex: 1,
  },
});
