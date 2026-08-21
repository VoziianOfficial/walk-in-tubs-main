"use strict";


/* =========================================================
   LEGAL PAGE HELPERS
========================================================= */

const legalQuery = (selector, scope = document) =>
    scope.querySelector(selector);

const legalQueryAll = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

const legalReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


/* =========================================================
   LEGAL NAVIGATION
========================================================= */

const initLegalNavigation = () => {
    const legalNav = legalQuery(".legal-nav");

    if (!legalNav) {
        return;
    }


    const links = legalQueryAll(
        'a[href^="#"]',
        legalNav
    );


    if (!links.length) {
        return;
    }


    const navigationItems = links
        .map((link) => {
            const targetId = link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return null;
            }


            const section = legalQuery(targetId);

            if (!section) {
                return null;
            }


            return {
                link,
                section
            };
        })
        .filter(Boolean);


    if (!navigationItems.length) {
        return;
    }


    /* ---------------------------------------------------------
       Active section
    --------------------------------------------------------- */

    const setActiveLink = (activeLink) => {
        navigationItems.forEach(({ link }) => {
            link.removeAttribute("aria-current");
        });


        if (activeLink) {
            activeLink.setAttribute(
                "aria-current",
                "location"
            );
        }
    };


    /* ---------------------------------------------------------
       Smooth anchor navigation
    --------------------------------------------------------- */

    navigationItems.forEach(
        ({
            link,
            section
        }) => {
            link.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();


                    const header =
                        legalQuery(".site-header");


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const additionalOffset = 28;


                    const targetPosition =
                        section.getBoundingClientRect().top +
                        window.scrollY -
                        headerHeight -
                        additionalOffset;


                    window.scrollTo({
                        top: Math.max(
                            targetPosition,
                            0
                        ),

                        behavior:
                            legalReducedMotion
                                ? "auto"
                                : "smooth"
                    });


                    setActiveLink(link);


                    if (
                        window.history &&
                        typeof window.history.replaceState ===
                            "function"
                    ) {
                        window.history.replaceState(
                            null,
                            "",
                            `#${section.id}`
                        );
                    }
                }
            );
        }
    );


    /* ---------------------------------------------------------
       Intersection Observer
    --------------------------------------------------------- */

    if (
        "IntersectionObserver" in window
    ) {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter(
                        (entry) =>
                            entry.isIntersecting
                    )
                    .sort(
                        (a, b) =>
                            b.intersectionRatio -
                            a.intersectionRatio
                    );


                if (!visibleEntries.length) {
                    return;
                }


                const visibleSection =
                    visibleEntries[0].target;


                const matchingItem =
                    navigationItems.find(
                        ({ section }) =>
                            section ===
                            visibleSection
                    );


                if (matchingItem) {
                    setActiveLink(
                        matchingItem.link
                    );
                }
            },
            {
                root: null,

                rootMargin:
                    "-18% 0px -64% 0px",

                threshold: [
                    0,
                    0.15,
                    0.35,
                    0.6
                ]
            }
        );


        navigationItems.forEach(
            ({ section }) => {
                observer.observe(section);
            }
        );

    } else {
        /*
         * Fallback for older browsers.
         */

        let ticking = false;


        const updateActiveSection = () => {
            const header =
                legalQuery(".site-header");


            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;


            const referencePoint =
                headerHeight + 130;


            let currentItem =
                navigationItems[0];


            navigationItems.forEach(
                (item) => {
                    const sectionTop =
                        item.section
                            .getBoundingClientRect()
                            .top;


                    if (
                        sectionTop <=
                        referencePoint
                    ) {
                        currentItem = item;
                    }
                }
            );


            if (currentItem) {
                setActiveLink(
                    currentItem.link
                );
            }


            ticking = false;
        };


        const requestUpdate = () => {
            if (ticking) {
                return;
            }


            ticking = true;


            window.requestAnimationFrame(
                updateActiveSection
            );
        };


        window.addEventListener(
            "scroll",
            requestUpdate,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            requestUpdate
        );


        updateActiveSection();
    }


    /* ---------------------------------------------------------
       Initial hash
    --------------------------------------------------------- */

    if (window.location.hash) {
        const initialItem =
            navigationItems.find(
                ({ section }) =>
                    `#${section.id}` ===
                    window.location.hash
            );


        if (initialItem) {
            setActiveLink(
                initialItem.link
            );
        }
    } else {
        setActiveLink(
            navigationItems[0].link
        );
    }
};


/* =========================================================
   REFRESH AOS
========================================================= */

const refreshLegalLayout = () => {
    if (
        typeof window.AOS !== "undefined" &&
        typeof window.AOS.refresh === "function"
    ) {
        window.AOS.refresh();
    }
};


/* =========================================================
   INITIALIZATION
========================================================= */

const initLegalPage = () => {
    initLegalNavigation();
};


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initLegalPage
    );
} else {
    initLegalPage();
}


window.addEventListener(
    "load",
    refreshLegalLayout
);
