
export function Footer() {
  return (
    <footer className="bg-[#080808] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">

        {/* Brand */}
        <div className="flex flex-col items-start gap-5">
          <a href="#home" aria-label="PulseFitness home" className="block w-[200px]">
            <img
              src="/public/images/images/pulse-fitness-white.svg"
              alt="PulseFitness"
              loading="lazy"
              className="h-auto w-full"
            />
          </a>

          <p className="max-w-xs leading-7 text-[#a5a5a5]">
            Train with purpose.
            <br />
            Make every session count.
          </p>
        </div>

        {/* Explore links */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-sm font-bold tracking-widest">EXPLORE</h3>

          <a href="#home" className="text-[#a5a5a5] transition-colors hover:text-white">
            Home
          </a>
          <a href="#schedule" className="text-[#a5a5a5] transition-colors hover:text-white">
            Classes
          </a>
          <a href="#trainers" className="text-[#a5a5a5] transition-colors hover:text-white">
            Our Team
          </a>
          <a href="#membership" className="text-[#a5a5a5] transition-colors hover:text-white">
            Membership
          </a>
        </div>

        {/* Training links */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-sm font-bold tracking-widest">YOUR TRAINING</h3>

          <a href="#schedule" className="text-[#a5a5a5] transition-colors hover:text-white">
            Class Schedule
          </a>
          <a href="#trainers" className="text-[#a5a5a5] transition-colors hover:text-white">
            Meet the Trainers
          </a>
          <a href="#membership" className="text-[#a5a5a5] transition-colors hover:text-white">
            Membership Plans
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 border-t border-[#333] px-6 py-6 text-sm text-[#a5a5a5] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>© 2026 PulseFitness. All rights reserved.</p>

        <a href="#header" className="transition-colors hover:text-white">
          BACK TO TOP ↑
        </a>
      </div>
    </footer>
  );
}
