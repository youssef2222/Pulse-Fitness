
import { useEffect, useState } from "react";
import { getMyMemberships, createCheckoutSession } from "../services/api";

export function MyBookings() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMemberships() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyMemberships();
        setMemberships(data.memberships);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadMemberships();

    // Refresh when a plan is selected elsewhere
    window.addEventListener("membership-updated", loadMemberships);

    return () => {
      window.removeEventListener("membership-updated", loadMemberships);
    };
  }, []);


  const [paymentLoading, setPaymentLoading] = useState(false);

  async function handleBuySubscription(planId) {
    try {
      setPaymentLoading(true);

      const data = await createCheckoutSession(planId);

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error) {
      alert(error.message);
      setPaymentLoading(false);
    }
  }


  return (
    <aside className="w-full border border-[#333] bg-[#141414] p-4 text-white shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider">
          MY BOOKINGS
        </h2>

        <span className="bg-white px-2 py-1 text-xs font-bold text-black">
          {memberships.length}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-[#a5a5a5]">
          Loading your bookings...
        </p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : memberships.length === 0 ? (
        <p className="text-sm text-[#a5a5a5]">
          You haven't selected a membership yet.
        </p>
      ) : (
        <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
          {memberships.map((membership) => (
            <article
              key={membership.id}
              className="border border-[#333] bg-[#1c1c1c] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{membership.name}</h3>

                <span
                  className={`text-[10px] font-bold ${
                    membership.status === "active"
                      ? "text-green-400"
                      : "text-[#a5a5a5]"
                  }`}
                >
                  {membership.status.toUpperCase()}
                </span>
              </div>

              <p className="mt-2 text-sm text-[#a5a5a5]">
                {membership.price} MAD / {membership.duration_days} days
              </p>

              <div className="mt-3 space-y-1 text-xs text-[#888]">
                <p>
                  Start:{" "}
                  {new Date(membership.starts_at).toLocaleDateString()}
                </p>
                <p>
                  End:{" "}
                  {new Date(membership.ends_at).toLocaleDateString()}
                </p>
                {membership.status === "active" && (
                  <button
                    type="button"
                    onClick={() => handleBuySubscription(membership.plan_id)}
                    disabled={paymentLoading}
                    className="mt-4 w-full border border-white bg-white px-4 py-3 text-sm font-bold text-black hover:bg-transparent hover:text-white disabled:opacity-50"
                  >
                    {paymentLoading ? "REDIRECTING..." : "BUY SUBSCRIPTION"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
