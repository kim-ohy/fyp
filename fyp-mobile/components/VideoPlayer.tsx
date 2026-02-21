import { useVideo } from "@/hooks/useVideo";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  const publicUrl = useVideo(videoUrl);

  const player = useVideoPlayer(publicUrl, (player) => {
    player.play();
  });

  return (
    <View style={styles.contentContainer}>
      <VideoView style={styles.video} player={player} allowsPictureInPicture />
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
