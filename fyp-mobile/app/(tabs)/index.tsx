import { SvgChevronRight, SvgElipsis, SvgWarning } from "@/assets/images/svg";
import Text from "@/components/Text";
import { colours } from "@/constants/colours";
import { spacings } from "@/constants/spacings";
import { Alert, useAlerts } from "@/hooks/useAlerts";
import { useCamera } from "@/hooks/useCamera";
import { SubjectStatus, useSubject } from "@/hooks/useSubject";
import { useThemeColor } from "@/hooks/useThemeColour";
import { datetime } from "@/utils/datetime";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function Index() {
  const backgroundColor = useThemeColor({}, "background");
  const foregroundColor = useThemeColor({}, "foreground");
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor({}, "subtitle");
  const iconColor = useThemeColor({}, "icon");
  const dangerColor = useThemeColor({}, "danger");
  const errorColor = useThemeColor({}, "error");
  const emphasisColor = useThemeColor({}, "emphasis");
  const indicatorColor = useThemeColor({}, "indicator");

  const cameraStatus = useCamera();
  const subjectStatus = useSubject();
  const { alerts, isLoading } = useAlerts();
  const [currentTime, setCurrentTime] = useState(new Date());

  const statusColor = useMemo(() => {
    if (subjectStatus?.status === "Normal") {
      return colours.lightGreen;
    } else if (subjectStatus?.status === "Critical") {
      return colours.lightRed;
    } else {
      return indicatorColor;
    }
  }, [subjectStatus, indicatorColor]);

  const statusTextColor = useMemo(() => {
    if (subjectStatus?.status === "Normal") {
      return colours.green;
    } else if (subjectStatus?.status === "Critical") {
      return colours.red;
    } else {
      return iconColor;
    }
  }, [subjectStatus, iconColor]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAlertPress = useCallback(() => {
    if (alerts.length > 0) {
      router.push({
        pathname: "/alerts",
        params: {
          selectedTab: alerts[0].type === "falls" ? "falls" : "unusualRR",
        },
      });
    }
  }, [alerts]);

  const renderCameraStatus = useCallback(() => {
    return (
      <View
        style={[styles.indicatorContainer, { backgroundColor: indicatorColor }]}
      >
        <View style={styles.indicatorStatusContainer}>
          <Text paragraph bold center>
            {cameraStatus ? "Camera Online" : "Camera Offline"}
          </Text>
        </View>
        <SvgElipsis color={cameraStatus ? colours.green : colours.red} />
      </View>
    );
  }, [cameraStatus, indicatorColor]);

  const renderNotification = useCallback(
    (alert: Alert) => {
      return (
        <Pressable
          style={[styles.alertsContainer, { backgroundColor: foregroundColor }]}
          onPress={handleAlertPress}
        >
          <SvgWarning
            color={alert ? dangerColor : iconColor}
            height={50}
            width={50}
          />
          <View style={styles.infoContainer}>
            <Text heading1 bold>
              {alert
                ? alert.type === "falls"
                  ? "FALL DETECTED"
                  : "ABNORMAL RR"
                : "NO ALERTS"}
            </Text>
            {alert && (
              <Text subtitle color={subtitleColor}>
                {`at ${datetime(alert.created_at)}`}
              </Text>
            )}
          </View>
          {alert && <SvgChevronRight color={textColor} height={50} />}
        </Pressable>
      );
    },
    [
      dangerColor,
      foregroundColor,
      handleAlertPress,
      iconColor,
      subtitleColor,
      textColor,
    ],
  );

  const renderSubjectStatus = useCallback(
    (subjectStatus: SubjectStatus) => {
      return (
        <View style={styles.rateContainer}>
          <Text bold heading1 center color={textColor}>
            Respiration{"\n"}Rate
          </Text>
          <Text bold emphasis color={emphasisColor}>
            {subjectStatus.rr}
          </Text>
          <View
            style={[styles.statusContainer, { backgroundColor: statusColor }]}
          >
            <Text bold heading1 color={statusTextColor}>
              {subjectStatus.status}
            </Text>
          </View>
        </View>
      );
    },
    [emphasisColor, statusColor, statusTextColor, textColor],
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.metadataContainer}>
        {renderCameraStatus()}
        <Text subtitle color={subtitleColor}>
          {datetime(currentTime)}
        </Text>
      </View>
      {renderNotification(alerts[0])}

      {subjectStatus && renderSubjectStatus(subjectStatus)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacings.l,
    paddingHorizontal: spacings.sm,
    gap: spacings.m,
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacings.s,
  },
  metadataContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacings.s,
  },
  infoContainer: {
    justifyContent: "center",
    gap: spacings.xs,
    flex: 1,
  },
  indicatorContainer: {
    paddingVertical: spacings.s,
    paddingHorizontal: spacings.m,
    flexDirection: "row",
    alignItems: "center",
    gap: spacings.s,
    borderRadius: spacings.l,
    width: "50%",
  },
  alertsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacings.sm,
    padding: spacings.m,
    borderRadius: spacings.sm,
  },
  rateContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: spacings.sm,
    padding: spacings.m,
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: spacings.sm,
    paddingVertical: spacings.s,
    paddingHorizontal: spacings.l,
  },
  indicatorStatusContainer: {
    flex: 1,
  },
});
