import Text from "@/components/Text";
import VideoPlayer from "@/components/VideoPlayer";
import { spacings } from "@/constants/spacings";
import { Alert } from "@/hooks/useAlerts";
import { useThemeColor } from "@/hooks/useThemeColour";
import { datetime } from "@/utils/datetime";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface ConfirmationWindowProps {
  showConfirmation: boolean;
  selectedAlert: Alert;
  handleConfirm: () => void;
}

const ConfirmationWindow = ({
  showConfirmation,
  selectedAlert,
  handleConfirm,
}: ConfirmationWindowProps) => {
  const foregroundColor = useThemeColor({}, "foreground");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const selectedTextColor = useThemeColor({}, "selectedText");
  const iconColor = useThemeColor({}, "icon");

  const [showVideo, setShowVideo] = useState(false);

  const handleWatchVideo = useCallback(() => {
    setShowVideo(true);
  }, []);

  const handleCloseVideo = useCallback(() => {
    setShowVideo(false);
  }, []);

  return (
    <>
      <Modal visible={showConfirmation} transparent={true} animationType="fade">
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          ]}
        >
          <View
            style={[styles.modalContent, { backgroundColor: foregroundColor }]}
          >
            <View style={styles.modalHeader}>
              <Text heading2 bold center color={textColor}>
                {selectedAlert?.type === "falls"
                  ? "Potential fall detected"
                  : "Unusual RR detected"}
              </Text>
            </View>
            <View style={styles.modalBody}>
              {selectedAlert && (
                <Text paragraph center color={textColor}>
                  {selectedAlert.type === "falls"
                    ? `Potential fall detected at ${datetime(selectedAlert.created_at)}`
                    : `${selectedAlert.rr} BPM detected at ${datetime(selectedAlert.created_at)}`}
                </Text>
              )}
            </View>
            <View style={styles.modalButtons}>
              {selectedAlert?.type === "falls" && selectedAlert?.video_url && (
                <Pressable
                  style={[
                    styles.button,
                    { borderWidth: 1, borderColor: iconColor },
                  ]}
                  onPress={handleWatchVideo}
                >
                  <Text paragraph bold color={textColor}>
                    Watch Video
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={handleConfirm}
              >
                <Text paragraph bold color={selectedTextColor}>
                  Ok
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showVideo}
        animationType="slide"
        onRequestClose={handleCloseVideo}
      >
        <View
          style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}
        >
          {/* Pass the video_url from selectedAlert to VideoPlayer, fallback to a sample if missing */}
          <VideoPlayer videoUrl={selectedAlert?.video_url} />
          <Pressable
            onPress={handleCloseVideo}
            style={{ marginTop: 20, alignSelf: "center" }}
          ></Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: spacings.m,
    padding: spacings.l,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: spacings.m,
  },
  modalBody: {
    marginBottom: spacings.l,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    gap: spacings.sm,
  },
  button: {
    paddingVertical: spacings.s,
    paddingHorizontal: spacings.l,
    borderRadius: spacings.m,
    minWidth: 80,
    alignItems: "center",
  },
  alertDetails: {
    marginTop: spacings.xs,
    textAlign: "center",
  },
});

export default ConfirmationWindow;
