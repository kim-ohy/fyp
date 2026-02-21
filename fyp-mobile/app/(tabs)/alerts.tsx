import { SvgBellSlash, SvgElipsis, SvgWarningMini } from "@/assets/images/svg";
import ConfirmationWindow from "@/components/ConfirmationWindow";
import Separator from "@/components/Separator";
import Text from "@/components/Text";
import { spacings } from "@/constants/spacings";
import { Alert, useAlerts } from "@/hooks/useAlerts";
import { useThemeColor } from "@/hooks/useThemeColour";
import { supabase } from "@/utils/supabase";
import { timeAgo } from "@/utils/timeAgo";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function Alerts() {
  const params = useLocalSearchParams();
  const initialTab =
    params.selectedTab === "falls" || params.selectedTab === "unusualRR"
      ? params.selectedTab
      : "falls";
  const [selectedTab, setSelectedTab] = useState<"falls" | "unusualRR">(
    initialTab as "falls" | "unusualRR",
  );
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor({}, "subtitle");
  const iconColor = useThemeColor({}, "icon");
  const tabColor = useThemeColor({}, "tab");
  const selectedTabColor = useThemeColor({}, "selectedTab");
  const selectedTextColor = useThemeColor({}, "selectedText");
  const primaryColor = useThemeColor({}, "primary");

  const onSelectTab = useCallback((tab: "falls" | "unusualRR") => {
    setSelectedTab(tab);
  }, []);

  const { alerts, isLoading } = useAlerts();

  const filterAlerts = (alerts: Alert[], type: string) => {
    return alerts.filter((alert) => alert.type === type);
  };

  const renderUnread = useCallback(() => {
    return (
      <View style={styles.unreadContainer}>
        <SvgWarningMini color={primaryColor} height={20} width={20} />
      </View>
    );
  }, [primaryColor]);

  const handleAlertPress = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
    setShowConfirmation(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedAlert) {
      await supabase.functions.invoke("add-history", {
        body: { id: selectedAlert.id },
      });
    }
    setShowConfirmation(false);
    setSelectedAlert(null);
  }, [selectedAlert]);

  const renderItem = useCallback(
    ({ item }: { item: Alert }) => {
      return (
        <Pressable
          style={[styles.itemContainer, { backgroundColor: backgroundColor }]}
          onPress={() => handleAlertPress(item)}
        >
          <View style={styles.dataContaner}>
            <Text paragraph bold color={textColor}>
              {item.type === "falls" ? "Fall detected" : "Unusual RR detected"}
            </Text>
            <Text subtitle color={subtitleColor}>
              {timeAgo(item.created_at)}
            </Text>
          </View>
          <View>
            <SvgElipsis color={primaryColor} height={7} width={7} />
          </View>
        </Pressable>
      );
    },
    [backgroundColor, textColor, subtitleColor, primaryColor, handleAlertPress],
  );

  const renderListEmptyComponent = useCallback(() => {
    return (
      <View style={styles.listEmptyContainer}>
        <SvgBellSlash color={iconColor} height={100} width={100} />
        <Text header bold color={textColor}>
          NO ALERTS
        </Text>
      </View>
    );
  }, [iconColor, textColor]);

  const renderSeparator = useCallback(() => {
    return <Separator />;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            selectedTab === "falls" ? styles.selectedTab : styles.tabItem,
            {
              backgroundColor:
                selectedTab === "falls" ? selectedTabColor : tabColor,
            },
          ]}
          onPress={() => onSelectTab("falls")}
        >
          <Text
            paragraph
            bold
            color={selectedTab === "falls" ? selectedTextColor : textColor}
          >
            Falls
          </Text>
          {alerts.filter((alert) => alert.type === "falls").length > 0 &&
            selectedTab !== "falls" &&
            renderUnread()}
        </Pressable>
        <Pressable
          style={[
            selectedTab === "unusualRR" ? styles.selectedTab : styles.tabItem,
            {
              backgroundColor:
                selectedTab === "unusualRR" ? selectedTabColor : tabColor,
            },
          ]}
          onPress={() => onSelectTab("unusualRR")}
        >
          <Text
            paragraph
            bold
            color={selectedTab === "unusualRR" ? selectedTextColor : textColor}
          >
            Unusual RR
          </Text>
          {alerts.filter((alert) => alert.type === "unusualRR").length > 0 &&
            selectedTab !== "unusualRR" &&
            renderUnread()}
        </Pressable>
      </View>
      <FlashList
        data={filterAlerts(alerts, selectedTab)}
        renderItem={renderItem}
        estimatedItemSize={100}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={renderListEmptyComponent}
        ItemSeparatorComponent={renderSeparator}
      />
      <ConfirmationWindow
        showConfirmation={showConfirmation}
        selectedAlert={selectedAlert as Alert}
        handleConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    padding: spacings.sm,
    borderRadius: spacings.m,
    flexDirection: "row",
    gap: spacings.sm,
    alignItems: "center",
  },
  dataContaner: {
    flex: 1,
    flexDirection: "column",
    gap: spacings.xs,
  },
  contentContainer: {
    paddingHorizontal: spacings.sm,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacings.m,
    paddingVertical: 250,
  },
  tabContainer: {
    flexDirection: "row",
    gap: spacings.sm,
    padding: spacings.sm,
    position: "relative",
  },
  tabItem: {
    paddingVertical: spacings.s,
    paddingHorizontal: spacings.l,
    borderRadius: spacings.l,
  },
  selectedTab: {
    paddingVertical: spacings.s,
    paddingHorizontal: spacings.l,
    borderRadius: spacings.l,
  },
  unreadContainer: {
    position: "absolute",
    top: -10,
    right: 5,
  },
});
