import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export type Alert = {
  id: string;
  type: string;
  created_at: string;
  rr: number;
  video_url: string;
};

export type AlertList = {
  alerts: Alert[];
  isLoading: boolean;
};

export function useAlerts(): AlertList {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    let { data: alerts, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    setAlerts(alerts || []);
    setIsLoading(false);

    if (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();

      const channel = supabase
        .channel("public:alerts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "alerts" },
          (payload) => {
            console.log("Real-time change received:", payload);
            fetchAlerts();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, []),
  );

  return { alerts, isLoading };
}
