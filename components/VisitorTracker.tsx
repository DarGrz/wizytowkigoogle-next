"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

let cachedFingerprint: string | null = null;

function generateFingerprint(): string {
  if (cachedFingerprint) return cachedFingerprint;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'canvas-unavailable';
    const txt = 'wizytowkigoogle-visitor-v1.0';
    ctx.textBaseline = 'alphabetic';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(txt, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(txt, 4, 17);
    const b64 = canvas.toDataURL().replace('data:image/png;base64,', '');
    let hash = 0;
    for (let i = 0; i < b64.length; i++) {
      const char = b64.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    cachedFingerprint = Math.abs(hash).toString(16);
    return cachedFingerprint;
  } catch {
    return 'fp-err';
  }
}

function getUrlParams() {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      keyword: params.get('keyword') || params.get('q') || 'None',
      gclid: params.get('gclid') || 'None',
      utm_source: params.get('utm_source') || 'None',
      utm_medium: params.get('utm_medium') || 'None',
      utm_campaign: params.get('utm_campaign') || 'None',
      utm_term: params.get('utm_term') || 'None',
      utm_content: params.get('utm_content') || 'None',
      campaign_id:
        params.get('campaign_id') ||
        params.get('utm_id') ||
        params.get('gad_campaignid') ||
        params.get('hsa_cam') ||
        'None',
      gad_source: params.get('gad_source') || 'None',
      placement: params.get('placement') || 'None',
    };
  } catch {
    return {};
  }
}

function collectData(action: string, phoneNumber?: string) {
  const urlParams = getUrlParams();
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : ({} as any);
  const scr = typeof window !== 'undefined' ? window.screen : ({ width: 0, height: 0 } as any);

  return {
    action: action || 'PAGE_VISIT',
    time: new Date()
      .toLocaleString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/\//g, '.'),
    phone_number: phoneNumber || '',
    keyword: urlParams.keyword || 'None',
    gclid: urlParams.gclid || 'None',
    utm_source: urlParams.utm_source || 'None',
    utm_medium: urlParams.utm_medium || 'None',
    utm_campaign: urlParams.utm_campaign || 'None',
    utm_term: urlParams.utm_term || 'None',
    utm_content: urlParams.utm_content || 'None',
    campaign_id: urlParams.campaign_id || 'None',
    gad_source: urlParams.gad_source || 'None',
    placement: urlParams.placement || 'None',
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    screen_resolution: `${scr.width}x${scr.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: typeof navigator !== 'undefined' ? navigator.language : '',
    platform: typeof navigator !== 'undefined' ? (navigator.platform || '') : '',
    fingerprint_hash: generateFingerprint(),
    referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : 'Direct',
    hardware_concurrency: nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : 'Unknown',
    device_memory: nav.deviceMemory ? String(nav.deviceMemory) : 'Unknown',
    connection_type: nav.connection?.effectiveType || 'Unknown',
    cookie_enabled: nav.cookieEnabled ? 'Yes' : 'No',
  };
}

function sendData(data: Record<string, any>) {
  try {
    fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {
      // Fallback to pixel GET
      try {
        const params = new URLSearchParams();
        for (const k in data) {
          if (data[k]) params.set(k, String(data[k]));
        }
        const img = new Image();
        img.src = '/api/tracking?' + params.toString();
      } catch {}
    });
  } catch {}
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/status')) return;

    // Track page view if path changed or first visit
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      sendData(collectData('PAGE_VISIT'));
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/status')) return;

    const recentClicks = new Set<string>();

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (link) {
        const raw = link.getAttribute('href') || '';
        const phone = raw.replace('tel:', '').trim();
        const key = phone + '_' + Math.floor(Date.now() / 3000);
        if (recentClicks.has(key)) return;
        recentClicks.add(key);
        sendData(collectData('PHONE_CLICK', phone));
      }
    }

    function handleContextMenu(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (link) {
        const raw = link.getAttribute('href') || '';
        const phone = raw.replace('tel:', '').trim();
        sendData(collectData('PHONE_CONTEXT_MENU', phone));
      } else if (target.textContent && /572\s*275\s*002/.test(target.textContent)) {
        sendData(collectData('PHONE_CONTEXT_MENU', '572275002'));
      }
    }

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('contextmenu', handleContextMenu, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [pathname]);

  return null;
}
