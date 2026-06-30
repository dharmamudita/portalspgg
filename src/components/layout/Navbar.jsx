import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  CalendarDays,
  Vote,
  History,
  BarChart3,
  MessageSquare,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { userData, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = userData?.role === 'superadmin'
    ? [
        { to: '/superadmin', label: 'Ringkasan Global', icon: LayoutDashboard },
        { to: '/superadmin/approvals', label: 'Verifikasi Akun', icon: ShieldCheck },
        { to: '/superadmin/kinerja', label: 'Kinerja SPPG', icon: BarChart3 },
        { to: '/superadmin/feedback', label: 'Pusat Ulasan', icon: MessageSquare },
        { to: '/superadmin/laporan', label: 'Laporan Nasional', icon: FileText },
      ]
    : isAdmin
      ? [
          { to: '/admin', label: 'Kelola Menu', icon: UtensilsCrossed },
          { to: '/admin/voting', label: 'Hasil Voting', icon: BarChart3 },
          { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
          { to: '/admin/laporan', label: 'Laporan', icon: FileText },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/menu-mingguan', label: 'Menu Mingguan', icon: CalendarDays },
          { to: '/voting', label: 'Voting', icon: Vote },
          { to: '/riwayat', label: 'Riwayat', icon: History },
        ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="inner">
        {/* Logo */}
        <Link to={userData?.role === 'superadmin' ? '/superadmin' : isAdmin ? '/admin' : '/dashboard'} className="logo" style={{ textDecoration: 'none' }}>
          <img src="/logo-bgn.png" alt="BGN Logo" className="h-10 w-auto drop-shadow-md transition-transform hover:scale-105" />
          <span className="logoText ml-2">
            Portal<span className="logoAccent">SPPG</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navLink ${isActive(link.to) ? 'navLinkActive' : ''}`}
            >
              <link.icon size={16} />
              <span>{link.label}</span>
              {isActive(link.to) && <span className="navDot" />}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="right">
          {userData ? (
            <div className="userMenu">
              <button className="userBtn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="userAvatar bg-black/5 border border-black/10 flex items-center justify-center overflow-hidden">
                  {userData.photoURL ? (
                    <img src={userData.photoURL} alt="User avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-text-muted mt-1" />
                  )}
                  <span className="onlineDot" />
                </div>
                <ChevronDown size={14} className={`chevron ${userMenuOpen ? 'chevronOpen' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="dropdown"
                  >
                    <div className="dropdownHeader">
                      <p className="dropdownName">{userData.nama}</p>
                      <p className="dropdownEmail">{userData.nip}</p>
                    </div>
                    <div className="dropdownDivider" />
                    <Link to={userData?.role === 'superadmin' ? '/superadmin' : isAdmin ? '/admin' : '/dashboard'} className="dropdownItem">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/profil" className="dropdownItem">
                      <User size={16} /> Profil
                    </Link>
                    <div className="dropdownDivider" />
                    <button className="dropdownItem dropdownLogout" onClick={handleLogout}>
                      <LogOut size={16} /> Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="userBtn" style={{ padding: '8px 16px', fontWeight: 600, color: '#fff' }}>
              Masuk
            </Link>
          )}

          {/* Mobile Toggle */}
          <button className="mobileToggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mobileNav"
          >
            <div className="mobileNavInner">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`mobileLink ${isActive(link.to) ? 'mobileLinkActive' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <link.icon size={18} />
                    {link.label}
                  </div>
                  {isActive(link.to) && <span className="mobileLinkDot" />}
                </Link>
              ))}
              <div className="dropdownDivider" />
              {!userData ? (
                <Link to="/login" className="mobileLink" style={{ justifyContent: 'center' }}>
                  Masuk
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="mobileLink"
                  style={{ color: '#ef4444' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Keluar
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

