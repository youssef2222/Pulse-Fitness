import { useAuth } from "../auth/AuthContext";
import { MyBookings } from "../components/MyBookings";

export function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-10 text-white">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">

        {/* Welcome message */}
        <div>
          <h1 className="text-3xl font-bold">
            WELCOME, {user?.full_name?.toUpperCase()}
          </h1>

          <p className="mt-3 text-[#a5a5a5]">
            Welcome to your Pulse Fitness account.
          </p>
        </div>

        {/* Top-right bookings panel */}
        <MyBookings />

      </div>
    </main>
  );
}