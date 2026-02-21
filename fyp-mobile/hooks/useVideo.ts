import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

export function useVideo(video_url: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const fetchSignedUrl = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase.storage
      .from("fall-clips")
      .getPublicUrl(video_url);

    setLoading(false);
    setPublicUrl(data?.publicUrl);
  }, [video_url]);

  useEffect(() => {
    fetchSignedUrl();
  }, [fetchSignedUrl, video_url]);

  return publicUrl;
}
