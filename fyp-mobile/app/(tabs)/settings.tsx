import { SvgHelp, SvgMoon, SvgTrash } from "@/assets/images/svg";
import BottomSheetModal from "@/components/BottomSheetModal";
import SettingCard from "@/components/SettingCard";
import Text from "@/components/Text";
import { spacings } from "@/constants/spacings";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColour";
import { supabase } from "@/utils/supabase";
import { BottomSheetModal as GorhomBottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

export default function Settings() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const selectedTextColor = useThemeColor({}, "selectedText");

  const { isDark, setTheme } = useTheme();

  const onToggleDarkMode = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const clearHistoryBottomSheetRef = useRef<GorhomBottomSheetModal>(null);

  const handleClearHistoryPress = useCallback(() => {
    clearHistoryBottomSheetRef.current?.present();
  }, []);

  const handleClearHistory = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("clear-history");

    if (error) {
      console.error("Error clearing table:", error.message);
    } else {
      console.log("Table cleared successfully!");
    }

    clearHistoryBottomSheetRef.current?.dismiss();
  }, []);

  const handleHelpPress = useCallback(async () => {
    Linking.openURL(
      "https://oerfhrxibqutafkbmtyv.supabase.co/storage/v1/object/public/manual//ViFall%20User%20Manual.pdf",
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SettingCard
        icon={
          <SvgMoon color={textColor} height={spacings.l} width={spacings.l} />
        }
        text="Dark Mode"
        toggle={true}
        isSelected={isDark}
        onPressToggle={onToggleDarkMode}
      />
      <SettingCard
        icon={
          <SvgTrash color={textColor} height={spacings.l} width={spacings.l} />
        }
        text="Clear History"
        onPress={handleClearHistoryPress}
      />
      <SettingCard
        icon={
          <SvgHelp color={textColor} height={spacings.l} width={spacings.l} />
        }
        text="Help"
        onPress={handleHelpPress}
      />

      <BottomSheetModal ref={clearHistoryBottomSheetRef} title="Clear History">
        <View style={styles.clearHistoryContainer}>
          <View style={styles.clearHistoryTextContainer}>
            <Text paragraph color={textColor}>
              Are you sure you want to erase all past alerts and recordings?
              This action cannot be undone.
            </Text>
          </View>
          <Pressable
            style={[
              styles.clearHistoryButtonContainer,
              { backgroundColor: primaryColor },
            ]}
            onPress={handleClearHistory}
          >
            <Text label bold color={selectedTextColor}>
              Clear History
            </Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.m,
    gap: spacings.s,
  },
  languageContainer: {
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.m,
    borderRadius: spacings.l,
  },
  languageSelectedContainer: {
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.m,
    borderRadius: spacings.l,
  },
  clearHistoryContainer: {
    gap: spacings.l,
  },
  clearHistoryTextContainer: {
    paddingHorizontal: spacings.sm,
  },
  clearHistoryButtonContainer: {
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.m,
    borderRadius: spacings.l,
    alignItems: "center",
    justifyContent: "center",
  },
});
