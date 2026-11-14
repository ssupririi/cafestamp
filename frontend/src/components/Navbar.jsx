import { useEffect, useRef, useState } from 'react';
import { BookOpen, Calendar, ChevronDown, Coffee, LogOut, MapPin, Share2, Shield, User } from 'lucide-react';

const TABS = [
  { id: 'passport', label: 'My Passport', icon: BookOpen },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'explore', label: 'Explore Spots', icon: MapPin },
  { id: 'share', label: 'Share Studio', icon: Share2 },
];

export default function Navbar({ view, onChange, user, explorerName, onOpenSettings, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;

  const openTab = (tab) => {
    setMenuOpen(false);
    onOpenSettings(tab);
  };

  return (
    <header className="bg-espresso text-parchment">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3" aria-label="Main">
        {/* Brand + Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 pr-2">
            <Coffee className="h-6 w-6 text-sakura" />
            <span className="font-display text-xl font-bold tracking-wide">CafeStamp</span>
          </div>
          <ul className="flex flex-wrap gap-1">
            {TABS.map(({ id, label, icon: Icon, soon }) => (
              <li key={id}>
                <button
                  type="button"
                  disabled={soon}
                  onClick={() => onChange(id)}
                  aria-current={view === id ? 'page' : undefined}
                  title={soon ? 'Coming soon' : undefined}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    view === id
                      ? 'bg-roast text-blush'
                      : soon
                        ? 'cursor-not-allowed text-latte/80'
                        : 'text-vintage hover:bg-roast/60 hover:text-blush'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {soon && <span className="rounded bg-roast px-1.5 py-0.5 text-[10px] text-gold">soon</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Circular Avatar + Dropdown Chevron */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="User menu"
            className="flex items-center gap-1.5 rounded-full p-1 pr-2 transition-colors hover:bg-roast/70 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-vintage bg-mist text-roast">
              {avatarUrl ? (
                <img src={avatarUrl} alt={explorerName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-vintage transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border-2 border-espresso bg-[#fdfbf7] font-type text-sm text-espresso shadow-xl"            >
              {/* User Summary Header */}
              <div className="border-b border-vintage bg-mist/60 px-4 py-3">
                <p className="truncate font-display font-bold text-espresso">{explorerName}</p>
                <p className="truncate text-xs text-mocha">{user?.email}</p>
              </div>

              <div className="py-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openTab('profile')}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-roast transition-colors hover:bg-blush/40 hover:text-espresso"
                >
                  <User className="h-4 w-4 text-mocha" />
                  Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openTab('account')}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-roast transition-colors hover:bg-blush/40 hover:text-espresso"
                >
                  <Shield className="h-4 w-4 text-mocha" />
                  Account & Security
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openTab('socials')}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs text-roast transition-colors hover:bg-blush/40 hover:text-espresso"
                >
                  <Share2 className="h-4 w-4 text-mocha" />
                  Connected Socials
                </button>
              </div>

              <div className="border-t border-vintage py-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-bold text-[#b5655f] transition-colors hover:bg-blush/50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}