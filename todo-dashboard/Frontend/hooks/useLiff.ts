"use client";

import { useEffect, useState, useCallback } from "react";

// ── Type สำหรับ LIFF SDK ที่โหลดจาก CDN ──
interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LiffSDK {
  init: (config: { liffId: string }) => Promise<void>;
  isInClient: () => boolean;
  isLoggedIn: () => boolean;
  login: () => void;
  logout: () => void;
  getProfile: () => Promise<LiffProfile>;
  getAccessToken: () => string | null;
  closeWindow: () => void;
}

declare global {
  interface Window {
    liff: LiffSDK;
  }
}

interface UseLiffReturn {
  isLiff: boolean; // รันใน LINE App ไหม
  isReady: boolean; // init() เสร็จแล้วไหม
  isLoggedIn: boolean;
  profile: LiffProfile | null;
  error: string | null;
  login: () => void;
  logout: () => void;
  closeWindow: () => void;
}

export function useLiff(): UseLiffReturn {
  const [isLiff, setIsLiff] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      // ไม่มี LIFF ID = รันนอก LINE = ถือว่า ready แต่ isLiff = false
      setIsReady(true);
      return;
    }

    // โหลด LIFF SDK จาก CDN
    if (window.liff) {
      initLiff(liffId);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.async = true;
    script.onload = () => initLiff(liffId);
    script.onerror = () => {
      setError("Cannot load LIFF SDK");
      setIsReady(true);
    };
    document.head.appendChild(script);
  }, []);

  async function initLiff(liffId: string) {
    try {
      await window.liff.init({ liffId });
      const inClient = window.liff.isInClient();
      const loggedIn = window.liff.isLoggedIn();

      setIsLiff(inClient);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const p = await window.liff.getProfile();
        setProfile(p);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setIsReady(true);
    }
  }

  const login = useCallback(() => {
    if (window.liff) window.liff.login();
  }, []);

  const logout = useCallback(() => {
    if (window.liff) window.liff.logout();
  }, []);

  const closeWindow = useCallback(() => {
    if (window.liff) window.liff.closeWindow();
  }, []);

  return {
    isLiff,
    isReady,
    isLoggedIn,
    profile,
    error,
    login,
    logout,
    closeWindow,
  };
}
