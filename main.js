/* ═══════════════════════════════════════════════
   光嶼沐境  SpaceXbay22  —  Main Script
   ═══════════════════════════════════════════════ */

(function () {
  "use strict";

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

  if (invitation && openInvitation) {
    let isOpening = false;

    const open = () => {
      if (isOpening) {
        return;
      }

      isOpening = true;
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
