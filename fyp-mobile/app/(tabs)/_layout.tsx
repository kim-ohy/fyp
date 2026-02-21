import {
  SvgAlerts,
  SvgHistory,
  SvgHome,
  SvgSettings,
} from "@/assets/images/svg";
import { spacings } from "@/constants/spacings";
import { useThemeColor } from "@/hooks/useThemeColour";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  const foregroundColor = useThemeColor({}, "foreground");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const primaryColor = useThemeColor({}, "primary");

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          ...styles.headerContainer,
          backgroundColor: foregroundColor,
        },
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: 24,
          lineHeight: 30,
          fontFamily: "Akatav-Black",
          color: textColor,
          fontWeight: "bold",
        },
        tabBarStyle: {
          ...styles.tabContainer,
          backgroundColor: foregroundColor,
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: iconColor,
        tabBarItemStyle: { ...styles.itemContainer },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <SvgHome color={color} height={spacings.l} width={spacings.l} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "HISTORY",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <SvgHistory color={color} height={spacings.l} width={spacings.l} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "ALERTS",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <SvgAlerts color={color} height={spacings.l} width={spacings.l} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "SETTINGS",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <SvgSettings color={color} height={spacings.l} width={spacings.l} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 75,
  },
  tabContainer: {
    height: 75,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
