import { useThemeColor } from "@/hooks/useThemeColour";
import { StyleSheet, View } from "react-native";

export default function Separator() {
  const separatorColor = useThemeColor({}, "separator");

  return (
    <View style={[styles.separator, { backgroundColor: separatorColor }]} />
  );
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    height: 1,
  },
});
