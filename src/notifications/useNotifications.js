import { useEffect, useMemo, useState } from "react";
import { listNotifications, refreshNotifications } from "./notificationStore.js";

function useNotificationsVersion(customerId) {
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!customerId) return;
    const bump = () => setV((x) => x + 1);
    const evt = `ark_notifications_changed::${customerId}`;
    window.addEventListener("storage", bump);
    window.addEventListener(evt, bump);
    refreshNotifications(customerId).then(bump).catch(() => {});
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener(evt, bump);
    };
  }, [customerId]);

  return v;
}

export function useNotifications(customerId) {
  const v = useNotificationsVersion(customerId);
  return useMemo(() => (customerId ? listNotifications(customerId) : []), [customerId, v]);
}
