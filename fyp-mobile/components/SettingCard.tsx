import { colours } from "@/constants/colours";
import { spacings } from "@/constants/spacings";
import { useThemeColor } from "@/hooks/useThemeColour";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import Text from "./Text";

interface SettingCardProps {
  icon: any;
  text: string;
  toggle?: boolean;
  onPress?: () => void;
  onPressToggle?: () => void;
  isSelected?: boolean;
}

const SettingCard = ({
  icon,
  text,
  toggle,
  onPress,
  onPressToggle,
  isSelected,
  }: SettingCardProps) => {
  const thumbColor = useThemeColor({}, "thumb");

  const renderToggle = () => {
    if (toggle) {
      return (
        <Switch
          trackColor={{
            true: colours.blueGreen,
            false: colours.electricBlue,
          }}
          thumbColor={thumbColor}
          value={isSelected}
          onValueChange={onPressToggle}
        />
      );
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {icon}
      <View style={styles.textContainer}>
        <Text label bold>
          {text}
        </Text>
      </View>
      {renderToggle()}
    </Pressable>
  );
};

export default SettingCard;

const styles = StyleSheet.create({
  container: {
    gap: spacings.m,
    paddingVertical: spacings.s,
    paddingHorizontal: spacings.sm,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
  },
  textContainer: {
    flex: 1,
  },
});
