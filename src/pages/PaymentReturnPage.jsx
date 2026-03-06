import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { markOrderPaid } from "../orders/orderStore.js";

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fromQuery = params.get("orderId");
    const fromSession = window.sessionStorage.getItem("ark_last_order_id");
    const orderId = fromQuery || fromSession;
    if (orderId) markOrderPaid(orderId);
    navigate("/", { replace: true });
  }, [navigate, params]);

  return null;
}

