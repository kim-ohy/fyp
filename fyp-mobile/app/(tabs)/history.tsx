import { SvgChevronRight, SvgHistory } from "@/assets/images/svg";
import ConfirmationWindow from "@/components/ConfirmationWindow";
import Separator from "@/components/Separator";
import Text from "@/components/Text";
import { spacings } from "@/constants/spacings";
import { HistoryType, useHistory } from "@/hooks/useHistory";
import { useThemeColor } from "@/hooks/useThemeColour";
import { timeAgo } from "@/utils/timeAgo";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function History() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor({}, "subtitle");
  const iconColor = useThemeColor({}, "icon");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<HistoryType | null>(
    null,
  );

  const { history, isLoading } = useHistory();

  const handleHistoryPress = useCallback((history: HistoryType) => {
    setSelectedHistory(history);
    setShowConfirmation(true);
  }, []);

  const handleConfirm = useCallback(() => {
    setShowConfirmation(false);
    setSelectedHistory(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: HistoryType }) => {
      return (
        <Pressable
          style={[styles.itemContainer, { backgroundColor: backgroundColor }]}
          onPress={() => handleHistoryPress(item)}
        >
          <View style={styles.dataContaner}>
            <Text paragraph bold color={textColor}>
              {item.type === "falls" ? "Fall Detected" : "Unusual RR"}
            </Text>
            <Text subtitle color={subtitleColor}>
              {timeAgo(item.created_at)}
            </Text>
          </View>
          <SvgChevronRight
            color={textColor}
            height={spacings.l}
            width={spacings.l}
          />
        </Pressable>
      );
    },
    [backgroundColor, textColor, subtitleColor, handleHistoryPress],
  );

  const renderListEmptyComponent = useCallback(() => {
    return (
      <View style={styles.listEmptyContainer}>
        <SvgHistory color={iconColor} height={100} width={100} />
        <Text header bold color={textColor}>
          NO PAST FALLS RECORDED
        </Text>
      </View>
    );
  }, [iconColor, textColor]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlashList
        data={history}
        renderItem={renderItem}
        estimatedItemSize={100}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={renderListEmptyComponent}
        ItemSeparatorComponent={Separator}
        extraData={{ backgroundColor, textColor, subtitleColor }}
      />
      <ConfirmationWindow
        showConfirmation={showConfirmation}
        selectedAlert={selectedHistory as HistoryType}
        handleConfirm={handleConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
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
});
