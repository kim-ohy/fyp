import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export type SubjectStatus = {
  status: string;
  rr: number;
};

export function useSubject() {
  const [subjectStatus, setSubjectStatus] = useState<SubjectStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLatestStatus = async () => {
    const { data: subject_status, error } = await supabase
      .from("subject_status")
      .select("status, rr")
      .eq("id", 1);

    setSubjectStatus(subject_status?.[0] || null);
    setIsLoading(false);

    if (error) {
      console.error("Error fetching latest camera status:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLatestStatus();

      const channel = supabase
        .channel("public:subject_status")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "subject_status" },
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

  return subjectStatus;
}
