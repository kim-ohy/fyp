import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useCamera() {
  const [cameraStatus, setCameraStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLatestStatus = async () => {
    const { data: camera_status, error } = await supabase
      .from("camera_status")
      .select("status")
      .eq("id", 1);

    setCameraStatus(camera_status?.[0]?.status);
    setIsLoading(false);

    if (error) {
      console.error("Error fetching latest camera status:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLatestStatus();

      const channel = supabase
        .channel("public:camera_status")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "camera_status" },
          (payload) => {
            console.log("Real-time change received:", payload);
            fetchLatestStatus();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, []),
  );

  return cameraStatus;
}
