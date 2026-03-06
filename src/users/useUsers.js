import { useEffect, useMemo, useState } from "react";
import { listUsers } from "./userStore.js";

function useUsersVersion() {
  const [v, setV] = useState(0);

  useEffect(() => {
    const bump = () => setV((x) => x + 1);
    window.addEventListener("storage", bump);
    window.addEventListener("ark_users_changed", bump);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener("ark_users_changed", bump);
    };
  }, []);

  return v;
}

export function useUsers() {
  const v = useUsersVersion();
  return useMemo(() => listUsers(), [v]);
}

