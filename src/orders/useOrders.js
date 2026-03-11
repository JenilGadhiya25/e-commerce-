import { useEffect, useMemo, useState } from "react";
import { getOrder, getOrdersApiStatus, listOrders, refreshOrders } from "./orderStore.js";

function useOrdersVersion({ customerId } = {}) {
  const [v, setV] = useState(0);

  useEffect(() => {
    const bump = () => setV((x) => x + 1);
    window.addEventListener("storage", bump);
    window.addEventListener("ark_orders_changed", bump);
    window.addEventListener("ark_orders_status_changed", bump);
    refreshOrders(customerId ? { customerId } : {}).then(bump).catch(() => {});
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener("ark_orders_changed", bump);
      window.removeEventListener("ark_orders_status_changed", bump);
    };
  }, [customerId]);

  return v;
}

export function useOrders() {
  const v = useOrdersVersion();
  return useMemo(() => listOrders(), [v]);
}

export function useOrdersByCustomer(customerId) {
  const v = useOrdersVersion({ customerId });
  return useMemo(() => listOrders().filter((o) => o.customer?.id === customerId), [v, customerId]);
}

export function useOrder(orderId) {
  const v = useOrdersVersion();
  return useMemo(() => (orderId ? getOrder(orderId) : null), [v, orderId]);
}

export function useOrdersApiStatus() {
  const v = useOrdersVersion();
  return useMemo(() => getOrdersApiStatus(), [v]);
}
