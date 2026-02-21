import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export type HistoryType = {
  id: string;
  created_at: string;
  video_url: string;
  type: string;
  rr: number;
};

export type HistoryList = {
  history: HistoryType[];
  isLoading: boolean;
};

export function useHistory(): HistoryList {
  const [history, setHistory] = useState<HistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    let { data: history, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false });

    setHistory(history || []);
    setIsLoading(false);
    if (error) {
      console.error("Error fetching history:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();

      const channel = supabase
        .channel("public:history")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "history" },
          (payload) => {
            console.log("Real-time change received:", payload);
            fetchHistory();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, []),
  );

  return { history, isLoading };
}
