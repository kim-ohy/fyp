import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColour";
import { supabase } from "@/utils/supabase";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const [loaded, error] = useFonts({
    "Akatab-Black": require("../assets/fonts/Akatab-Black.ttf"),
    "Akatab-Bold": require("../assets/fonts/Akatab-Bold.ttf"),
    "Akatab-ExtraBold": require("../assets/fonts/Akatab-ExtraBold.ttf"),
    "Akatab-Medium": require("../assets/fonts/Akatab-Medium.ttf"),
    "Akatab-Regular": require("../assets/fonts/Akatab-Regular.ttf"),
    "Akatab-SemiBold": require("../assets/fonts/Akatab-SemiBold.ttf"),
  });

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const foregroundColor = useThemeColor({}, "foreground");

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted!");
        return null;
      }

      try {
        const tokenData = (await Notifications.getExpoPushTokenAsync()).data;

        const { data, error } = await supabase.functions.invoke("insert-user", {
          body: { expo_push_token: tokenData },
        });
      } catch (error) {
        console.error("Error getting push token:", error);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
      return null;
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
      }
      if (loaded || error) {
        SplashScreen.hideAsync();
      }
    });
  }, [loaded, error]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(foregroundColor);
  }, [foregroundColor]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <SafeAreaView
              style={{ flex: 1 }}
              edges={["left", "right", "bottom"]}
            >
              <StatusBar style={isDark ? "light" : "dark"} />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </SafeAreaView>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
