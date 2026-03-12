/* ═══════════════════════════════════════════════
   光嶼沐境  SpaceXbay22  —  Main Script
   ═══════════════════════════════════════════════ */

(function () {
  "use strict";

  const root = document.documentElement;
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIOSDevice =
    /iP(hone|ad|od)/.test(userAgent) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isIOSInAppWebView =
    isIOSDevice &&
    /(Instagram|FBAN|FBAV|Line|MicroMessenger|GSA|CriOS|EdgiOS|DuckDuckGo)/i.test(
      userAgent
    );

  if (isIOSInAppWebView) {
    root.classList.add("ios-in-app");
  }

  const updateViewportMetrics = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    root.style.setProperty("--app-height", `${Math.round(viewportHeight)}px`);
  };

  updateViewportMetrics();
  window.addEventListener("resize", updateViewportMetrics, { passive: true });
  window.addEventListener("orientationchange", updateViewportMetrics, {
    passive: true,
  });
  window.visualViewport?.addEventListener("resize", updateViewportMetrics, {
    passive: true,
  });

  const navigationEntry = performance.getEntriesByType?.("navigation")?.[0];
  const shouldResetScroll =
    !window.location.hash &&
    (!navigationEntry ||
      navigationEntry.type === "navigate" ||
      navigationEntry.type === "reload");

  const resetScrollToTop = () => {
    if (!shouldResetScroll) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  resetScrollToTop();
  requestAnimationFrame(resetScrollToTop);
  window.addEventListener("load", resetScrollToTop, { once: true });

  /* ─── 1. Invitation open (Door Reveal) ─── */
  const invitation = document.getElementById("invitation");
  const openInvitation = document.getElementById("open-invitation");
  const header = document.getElementById("site-header");
  const hero = document.querySelector(".hero");
  let disableInvitationCardTilt = null;

  const setupInvitationCardTilt = () => {
    if (
      !openInvitation ||
      !window.PointerEvent ||
      isIOSInAppWebView ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return null;
    }

    const defaults = {
      tiltX: 0,
      tiltY: 0,
      glossX: 50,
      glossY: 22,
      sheenAngle: 118,
      glossStrength: 0,
      innerX: 0,
      innerY: 0,
      shadowX: 0,
      shadowY: 18,
      shadowBlur: 60,
      shadowAlpha: 0.42,
    };

    const state = {
      isHovering: false,
      rafId: 0,
      current: { ...defaults },
      target: { ...defaults },
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const applyCardStyles = (values) => {
      openInvitation.style.setProperty("--card-tilt-x", `${values.tiltX.toFixed(2)}deg`);
      openInvitation.style.setProperty("--card-tilt-y", `${values.tiltY.toFixed(2)}deg`);
      openInvitation.style.setProperty("--card-gloss-x", `${values.glossX.toFixed(2)}%`);
      openInvitation.style.setProperty("--card-gloss-y", `${values.glossY.toFixed(2)}%`);
      openInvitation.style.setProperty("--card-sheen-angle", `${values.sheenAngle.toFixed(2)}deg`);
      openInvitation.style.setProperty("--card-gloss-strength", values.glossStrength.toFixed(3));
      openInvitation.style.setProperty("--card-inner-shift-x", `${values.innerX.toFixed(2)}px`);
      openInvitation.style.setProperty("--card-inner-shift-y", `${values.innerY.toFixed(2)}px`);
      openInvitation.style.setProperty("--card-shadow-x", `${values.shadowX.toFixed(2)}px`);
      openInvitation.style.setProperty("--card-shadow-y", `${values.shadowY.toFixed(2)}px`);
      openInvitation.style.setProperty("--card-shadow-blur", `${values.shadowBlur.toFixed(2)}px`);
      openInvitation.style.setProperty("--card-shadow-alpha", values.shadowAlpha.toFixed(3));
    };

    const startAnimation = () => {
      if (state.rafId) return;
      state.rafId = window.requestAnimationFrame(renderFrame);
    };

    const setDefaultTarget = () => {
      state.target = { ...defaults };
    };

    const renderFrame = () => {
      state.rafId = 0;
      let shouldContinue = state.isHovering;

      Object.keys(state.current).forEach((key) => {
        state.current[key] = lerp(state.current[key], state.target[key], 0.13);
        if (Math.abs(state.target[key] - state.current[key]) > 0.08) {
          shouldContinue = true;
        }
      });

      applyCardStyles(state.current);

      if (!state.isHovering && !shouldContinue) {
        openInvitation.classList.remove("is-tilting");
      }

      if (shouldContinue) {
        startAnimation();
      }
    };

    const updateFromPointer = (event) => {
      const rect = openInvitation.getBoundingClientRect();
      const px = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const py = clamp((event.clientY - rect.top) / rect.height, 0, 1);
      const nx = (px - 0.5) * 2;
      const ny = (py - 0.5) * 2;
      const distance = clamp(Math.hypot(nx, ny) / 1.2, 0, 1);

      state.target = {
        tiltX: -ny * 5.6,
        tiltY: nx * 6.4,
        glossX: 50 + nx * 17,
        glossY: 23 + ny * 12,
        sheenAngle: 116 + nx * 10 - ny * 6,
        glossStrength: 0.08 + distance * 0.22,
        innerX: nx * 3.8,
        innerY: ny * 2.4,
        shadowX: -nx * 18,
        shadowY: 24 + Math.abs(ny) * 8 + distance * 3,
        shadowBlur: 68 + distance * 14,
        shadowAlpha: 0.46 + distance * 0.08,
      };
    };

    const handlePointerEnter = (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      state.isHovering = true;
      openInvitation.classList.add("is-tilting");
      updateFromPointer(event);
      startAnimation();
    };

    const handlePointerMove = (event) => {
      if (!state.isHovering) return;
      if (event.pointerType && event.pointerType !== "mouse") return;
      updateFromPointer(event);
      startAnimation();
    };

    const handlePointerLeave = () => {
      state.isHovering = false;
      setDefaultTarget();
      startAnimation();
    };

    openInvitation.addEventListener("pointerenter", handlePointerEnter);
    openInvitation.addEventListener("pointermove", handlePointerMove);
    openInvitation.addEventListener("pointerleave", handlePointerLeave);
    openInvitation.addEventListener("pointercancel", handlePointerLeave);
    openInvitation.addEventListener("blur", handlePointerLeave);

    applyCardStyles(defaults);

    return () => {
      state.isHovering = false;
      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
      }
      openInvitation.removeEventListener("pointerenter", handlePointerEnter);
      openInvitation.removeEventListener("pointermove", handlePointerMove);
      openInvitation.removeEventListener("pointerleave", handlePointerLeave);
      openInvitation.removeEventListener("pointercancel", handlePointerLeave);
      openInvitation.removeEventListener("blur", handlePointerLeave);
      openInvitation.classList.remove("is-tilting");
      applyCardStyles(defaults);
    };
  };

  if (invitation && openInvitation) {
    let isOpening = false;
    disableInvitationCardTilt = setupInvitationCardTilt();

    const open = () => {
      if (isOpening) {
        return;
      }

      isOpening = true;
      disableInvitationCardTilt?.();
      disableInvitationCardTilt = null;
      invitation.classList.add("is-opening");
      openInvitation.disabled = true;

      // Start overlay fade immediately to avoid a "stuck middle layer"
      requestAnimationFrame(() => {
        invitation.classList.add("fade-out");
      });

      // Reveal page content early so the transition feels continuous
      setTimeout(() => {
        document.body.classList.remove("inv-locked");
        header?.classList.add("is-visible");
        hero?.classList.add("is-active");
      }, 320);

      // Finally remove from DOM
      setTimeout(() => {
        invitation.setAttribute("aria-hidden", "true");
        invitation.remove();
      }, 1400);
    };

    openInvitation.addEventListener("click", open);
  } else {
    header?.classList.add("is-visible");
    hero?.classList.add("is-active");
  }

  /* ─── 2. Scroll reveal ─── */
  const revealItems = document.querySelectorAll("[data-reveal]");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  /* ─── 3. Theme switching based on sections ─── */
  const darkSections = document.querySelectorAll(
    '[data-theme-section="dark"]'
  );

  const themeObserver = new IntersectionObserver(
    (entries) => {
      let anyDarkVisible = false;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          anyDarkVisible = true;
        }
      });

      // Also check all dark sections (not just changed entries)
      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const threshold = window.innerHeight * 0.5;
        if (rect.top < threshold && rect.bottom > threshold) {
          anyDarkVisible = true;
        }
      });

      document.body.classList.toggle("theme-dark", anyDarkVisible);
    },
    {
      threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
    }
  );

  darkSections.forEach((s) => themeObserver.observe(s));

  // Also use scroll for better precision
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      let anyDark = false;
      const mid = window.innerHeight * 0.5;

      darkSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < mid && rect.bottom > mid) {
          anyDark = true;
        }
      });

      // Also check transition section
      const transition = document.querySelector(
        '[data-theme-section="transition"]'
      );
      if (transition) {
        const tRect = transition.getBoundingClientRect();
        if (tRect.top < mid && tRect.bottom > mid) {
          // In transition zone — check if past halfway
          const progress =
            (mid - tRect.top) / (tRect.bottom - tRect.top);
          if (progress > 0.5) anyDark = true;
        }
      }

      document.body.classList.toggle("theme-dark", anyDark);
      ticking = false;
    });
  });

  /* ─── 4. Horizontal gallery drag scroll ─── */
  const galleryScroll = document.getElementById("gallery-a");

  if (galleryScroll) {
    let isDown = false;
    let startX;
    let scrollLeft;

    galleryScroll.addEventListener("mousedown", (e) => {
      isDown = true;
      galleryScroll.style.cursor = "grabbing";
      startX = e.pageX - galleryScroll.offsetLeft;
      scrollLeft = galleryScroll.scrollLeft;
    });

    galleryScroll.addEventListener("mouseleave", () => {
      isDown = false;
      galleryScroll.style.cursor = "grab";
    });

    galleryScroll.addEventListener("mouseup", () => {
      isDown = false;
      galleryScroll.style.cursor = "grab";
    });

    galleryScroll.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - galleryScroll.offsetLeft;
      const walk = (x - startX) * 1.8;
      galleryScroll.scrollLeft = scrollLeft - walk;
    });
  }

  /* ─── 5. Header show after scroll past hero ─── */
  if (header && hero) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        // When hero is not visible → show header
        // When hero IS visible → only show if invitation already opened
        if (!entry.isIntersecting) {
          header.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );

    heroObserver.observe(hero);
  }

})();
