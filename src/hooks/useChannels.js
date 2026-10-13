import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const byName = (a, b) => a.channel_name.localeCompare(b.channel_name);

// Shared by Home.jsx and Rooms.jsx so the channel list + its realtime
// subscription aren't wired up twice.
export function useChannels() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    let isMounted = true;

    supabase
      .from("channels")
      .select("id, channel_name")
      .order("channel_name", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          return;
        }
        if (isMounted) setChannels(data);
      });

    const channel = supabase
      .channel("channels-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        (payload) => {
          if (!isMounted) return;
          setChannels((current) => {
            if (payload.eventType === "INSERT") {
              return [...current, payload.new].sort(byName);
            }
            if (payload.eventType === "DELETE") {
              return current.filter((c) => c.id !== payload.old.id);
            }
            if (payload.eventType === "UPDATE") {
              return current
                .map((c) => (c.id === payload.new.id ? payload.new : c))
                .sort(byName);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return channels;
}
