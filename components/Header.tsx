"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowUpRight, Search, ChevronDown, Phone } from 'lucide-react';
import SearchBusinessModal from '@/components/SearchBusinessModal';

export default function Header() {
  const path = usePathname();
  const reputation = path === '/ochrona-wizerunku.html' || path.startsWith('/usuwanie-') || path === '/jak-usunac-firme-z-google';
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('open-gmb-search', handleOpenSearch);

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-open-gmb-search], .hero-check-btn');
      if (target) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('open-gmb-search', handleOpenSearch);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Monitor scroll position for mobile sticky phone badge
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 180);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="header">
        <div className="nav wrap">
          <Link className="brand brand-logo" href="/" aria-label="wizytowkigoogle.pl — strona główna">
            <Image
              src="/images/wizytowkigoogle-logo-new.png"
              alt="wizytowkigoogle.pl"
              width={90}
              height={60}
              priority
              className="nav-logo"
            />
          </Link>

          <nav className={open ? 'navigation open' : 'navigation'} aria-label="Nawigacja główna">
            {/* Usługi dropdown (desktop) / expanded list (mobile) */}
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                onClick={() => setServicesOpen(!servicesOpen)}
                aria-expanded={servicesOpen}
              >
                Usługi <ChevronDown size={15} className={servicesOpen ? 'chevron-flip' : ''} />
              </button>
              {servicesOpen && (
                <div className="nav-dropdown-menu">
                  <Link onClick={() => { setOpen(false); setServicesOpen(false); }} href="/pozycjonowanie-wizytowki-google.html">
                    Pozycjonowanie wizytówki
                  </Link>
                  <Link onClick={() => { setOpen(false); setServicesOpen(false); }} href="/reklama-google-ads.html">
                    Reklama Google Ads
                  </Link>
                  <Link onClick={() => { setOpen(false); setServicesOpen(false); }} href="/ochrona-wizerunku.html">
                    Ochrona Wizerunku
                  </Link>
                  <Link onClick={() => { setOpen(false); setServicesOpen(false); }} href="/#uslugi">
                    Wszystkie usługi
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              className="header-search-btn"
              onClick={() => {
                setOpen(false);
                setSearchOpen(true);
              }}
              aria-label="Sprawdź swoją wizytówkę w Google"
            >
              <Search size={16} />
              <span>Sprawdź wizytówkę</span>
            </button>

            <a href="tel:+48527275002" className="button dark small header-phone-cta" onClick={() => setOpen(false)}>
              <Phone size={15} style={{ marginRight: '6px' }} /> 527 275 002
            </a>
          </nav>

          <div className="nav-mobile-right">
            <a href="tel:+48527275002" className="nav-mobile-phone" aria-label="Zadzwoń: +48 527 275 002">
              <Phone size={14} />
              <span>527 275 002</span>
            </a>

            <button
              className="menu-button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Phone Badge appearing on scroll */}
      <a
        href="tel:+48527275002"
        className={`mobile-sticky-phone ${scrolled ? 'visible' : ''}`}
        aria-label="Zadzwoń: +48 527 275 002"
      >
        <span className="sticky-phone-icon">
          <Phone size={17} />
        </span>
        <span className="sticky-phone-text">
          <small>Zadzwoń teraz</small>
          <strong>527 275 002</strong>
        </span>
      </a>

      <SearchBusinessModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
