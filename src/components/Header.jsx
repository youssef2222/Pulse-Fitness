
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { MyBookings } from "./MyBookings";

export function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingsOpen, setBookingsOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
    setBookingsOpen(false);
  }

  return (
    <header className="relative border-b border-[#333] bg-[#080808] text-white" id="header">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between px-4 sm:min-h-[88px] sm:px-6 lg:px-10">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="w-[120px] shrink-0 sm:w-[180px] lg:w-[220px]">
          <img
            src="/images/images/pulse-fitness-white.svg"
            alt="Pulse Fitness"
            className="block h-auto w-full"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          <a href="/#schedule">Classes</a>
          <a href="/#trainers">Our Team</a>
          <a href="/#membership">Membership</a>

          {!loading && (
            user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setBookingsOpen(!bookingsOpen)}
                    className="hover:text-gray-300"
                  >
                    My Bookings
                  </button>

                  {bookingsOpen && (
                    <>
                      <button
                        aria-label="Close bookings"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setBookingsOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-50 mt-3 w-[340px] max-w-[calc(100vw-24px)]">
                        <MyBookings />
                      </div>
                    </>
                  )}
                </div>

                <button onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Join Now</Link>
              </>
            )
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-3xl lg:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="absolute left-0 top-full z-50 flex w-full flex-col gap-5 border-t border-[#333] bg-[#080808] px-6 py-6 text-sm font-medium shadow-xl lg:hidden">

          <a href="/#schedule" onClick={closeMenu}>Classes</a>
          <a href="/#trainers" onClick={closeMenu}>Our Team</a>
          <a href="/#membership" onClick={closeMenu}>Membership</a>

          {!loading && (
            user ? (
              <>
                <div>
                  <button
                    onClick={() => setBookingsOpen(!bookingsOpen)}
                    className="flex w-full items-center justify-between"
                  >
                    My Bookings
                    <span>{bookingsOpen ? "−" : "+"}</span>
                  </button>

                  {bookingsOpen && (
                    <div className="mt-4 max-h-80 overflow-y-auto">
                      <MyBookings />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>Sign In</Link>
                <Link to="/signup" onClick={closeMenu}>Join Now</Link>
              </>
            )
          )}
        </nav>
      )}
    </header>
  );
}
