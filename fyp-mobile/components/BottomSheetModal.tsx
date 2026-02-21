import { spacings } from "@/constants/spacings";
import { useThemeColor } from "@/hooks/useThemeColour";
import {
  BottomSheetBackdrop,
  BottomSheetModal as GorhomBottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Text from "./Text";
interface BottomSheetModalProps {
  children: React.ReactNode;
  title?: string;
}

const BottomSheetModal = forwardRef<
  GorhomBottomSheetModal,
  BottomSheetModalProps
>(({ children, title }, ref) => {
  const foregroundColor = useThemeColor({}, "foreground");
  const handleIndicatorColor = useThemeColor({}, "handleIndicator");
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <GorhomBottomSheetModal
      ref={ref}
      index={0}
      snapPoints={["35%"]}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.background,
        { backgroundColor: foregroundColor },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: handleIndicatorColor },
      ]}
      enableDynamicSizing={false}
      enableOverDrag={false}
      animateOnMount={true}
    >
      <View
        style={[
          styles.headerContainer,
          { borderBottomColor: handleIndicatorColor },
        ]}
      >
        <Text heading2 bold>
          {title}
        </Text>
      </View>

      <SafeAreaView
        style={styles.contentContainer}
        edges={["left", "right", "bottom"]}
      >
        {children}
      </SafeAreaView>
    </GorhomBottomSheetModal>
  );
});

BottomSheetModal.displayName = "BottomSheetModal";

const styles = StyleSheet.create({
  background: {
    borderTopLeftRadius: spacings.m,
    borderTopRightRadius: spacings.m,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.l,
  },
  handleIndicator: {
    width: 40,
  },
  headerContainer: {
    paddingVertical: spacings.sm,
    paddingHorizontal: spacings.l,
    borderBottomWidth: 1,
  },
});

export default BottomSheetModal;
