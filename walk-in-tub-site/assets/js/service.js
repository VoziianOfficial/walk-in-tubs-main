"use strict";


/* =========================================================
   SERVICE PAGE HELPERS
========================================================= */

const serviceQuery = (selector, scope = document) =>
    scope.querySelector(selector);

const serviceQueryAll = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

const serviceReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


/* =========================================================
   SERVICE FEATURE SWIPER
========================================================= */

const initServiceSlider = () => {
    const slider = serviceQuery("[data-service-slider]");

    if (
        !slider ||
        typeof window.Swiper === "undefined"
    ) {
        return;
    }


    const previousButton = serviceQuery(
        "[data-service-prev]",
        slider
    );

    const nextButton = serviceQuery(
        "[data-service-next]",
        slider
    );

    const pagination = serviceQuery(
        "[data-service-pagination]",
        slider
    );

    const slides = serviceQueryAll(
        ".swiper-slide",
        slider
    );


    if (!slides.length) {
        return;
    }


    new window.Swiper(slider, {
        slidesPerView: "auto",

        spaceBetween: 28,

        speed: serviceReducedMotion ? 0 : 850,

        grabCursor: slides.length > 1,

        watchOverflow: true,

        keyboard: {
            enabled: true,
            onlyInViewport: true
        },

        navigation: {
            prevEl: previousButton,
            nextEl: nextButton
        },

        pagination: {
            el: pagination,
            type: "progressbar"
        },

        breakpoints: {
            0: {
                spaceBetween: 14
            },

            641: {
                spaceBetween: 20
            },

            1025: {
                spaceBetween: 28
            }
        },

        a11y: {
            enabled: true,
            prevSlideMessage: "Previous feature",
            nextSlideMessage: "Next feature"
        }
    });
};


/* =========================================================
   SERVICE ACCORDION
========================================================= */

const initServiceAccordion = () => {
    const accordions = serviceQueryAll(
        "[data-service-accordion]"
    );


    if (!accordions.length) {
        return;
    }


    accordions.forEach((accordion) => {
        const items = serviceQueryAll(
            ".service-accordion-item",
            accordion
        );


        if (!items.length) {
            return;
        }


        const closeItem = (
            item,
            animate = true
        ) => {
            const trigger = serviceQuery(
                ".service-accordion-item__trigger",
                item
            );

            const panel = serviceQuery(
                ".service-accordion-item__panel",
                item
            );


            if (!trigger || !panel) {
                return;
            }


            item.classList.remove("is-open");

            trigger.setAttribute(
                "aria-expanded",
                "false"
            );


            if (
                serviceReducedMotion ||
                !animate
            ) {
                panel.hidden = true;

                panel.style.height = "";
                panel.style.overflow = "";
                panel.style.transition = "";

                return;
            }


            const currentHeight =
                panel.getBoundingClientRect().height;


            panel.style.height =
                `${currentHeight}px`;

            panel.style.overflow =
                "hidden";


            window.requestAnimationFrame(() => {
                panel.style.transition =
                    "height 420ms cubic-bezier(0.22, 1, 0.36, 1)";

                panel.style.height = "0px";
            });


            const handleTransitionEnd = (event) => {
                if (
                    event.propertyName !== "height"
                ) {
                    return;
                }


                panel.hidden = true;

                panel.style.height = "";
                panel.style.overflow = "";
                panel.style.transition = "";


                panel.removeEventListener(
                    "transitionend",
                    handleTransitionEnd
                );
            };


            panel.addEventListener(
                "transitionend",
                handleTransitionEnd
            );
        };


        const openItem = (
            item,
            animate = true
        ) => {
            const trigger = serviceQuery(
                ".service-accordion-item__trigger",
                item
            );

            const panel = serviceQuery(
                ".service-accordion-item__panel",
                item
            );


            if (!trigger || !panel) {
                return;
            }


            item.classList.add("is-open");

            trigger.setAttribute(
                "aria-expanded",
                "true"
            );

            panel.hidden = false;


            if (
                serviceReducedMotion ||
                !animate
            ) {
                panel.style.height = "";
                panel.style.overflow = "";
                panel.style.transition = "";

                return;
            }


            panel.style.height = "0px";
            panel.style.overflow = "hidden";


            const targetHeight =
                panel.scrollHeight;


            window.requestAnimationFrame(() => {
                panel.style.transition =
                    "height 460ms cubic-bezier(0.22, 1, 0.36, 1)";

                panel.style.height =
                    `${targetHeight}px`;
            });


            const handleTransitionEnd = (event) => {
                if (
                    event.propertyName !== "height"
                ) {
                    return;
                }


                panel.style.height = "";
                panel.style.overflow = "";
                panel.style.transition = "";


                panel.removeEventListener(
                    "transitionend",
                    handleTransitionEnd
                );
            };


            panel.addEventListener(
                "transitionend",
                handleTransitionEnd
            );
        };


        /* -----------------------------------------
           Synchronise initial HTML state
        ----------------------------------------- */

        items.forEach((item) => {
            const trigger = serviceQuery(
                ".service-accordion-item__trigger",
                item
            );

            const panel = serviceQuery(
                ".service-accordion-item__panel",
                item
            );


            if (!trigger || !panel) {
                return;
            }


            const isOpen =
                item.classList.contains("is-open");


            trigger.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            panel.hidden = !isOpen;
        });


        /* -----------------------------------------
           Click
        ----------------------------------------- */

        items.forEach((item) => {
            const trigger = serviceQuery(
                ".service-accordion-item__trigger",
                item
            );


            if (!trigger) {
                return;
            }


            trigger.addEventListener(
                "click",
                () => {
                    const isOpen =
                        item.classList.contains(
                            "is-open"
                        );


                    if (isOpen) {
                        closeItem(item);
                        return;
                    }


                    items.forEach((otherItem) => {
                        if (
                            otherItem !== item &&
                            otherItem.classList.contains(
                                "is-open"
                            )
                        ) {
                            closeItem(otherItem);
                        }
                    });


                    openItem(item);
                }
            );
        });
    });
};


/* =========================================================
   SERVICE PARALLAX
========================================================= */

const initServiceParallax = () => {
    const sections = serviceQueryAll(
        "[data-service-parallax]"
    );


    if (
        !sections.length ||
        serviceReducedMotion
    ) {
        return;
    }


    const items = sections
        .map((section) => {
            const media = serviceQuery(
                "[data-service-parallax-media]",
                section
            );


            if (!media) {
                return null;
            }


            return {
                section,
                media
            };
        })
        .filter(Boolean);


    if (!items.length) {
        return;
    }


    let ticking = false;


    const clamp = (
        value,
        minimum,
        maximum
    ) => {
        return Math.min(
            Math.max(value, minimum),
            maximum
        );
    };


    const updateParallax = () => {
        const viewportHeight =
            window.innerHeight;


        items.forEach(
            ({
                section,
                media
            }) => {
                const rect =
                    section.getBoundingClientRect();


                if (
                    rect.bottom < 0 ||
                    rect.top > viewportHeight
                ) {
                    return;
                }


                const sectionCenter =
                    rect.top +
                    rect.height / 2;


                const viewportCenter =
                    viewportHeight / 2;


                const distance =
                    sectionCenter -
                    viewportCenter;


                const progress = clamp(
                    distance /
                        (
                            viewportHeight +
                            rect.height
                        ),
                    -1,
                    1
                );


                const translateY =
                    progress * -70;


                media.style.transform =
                    `translate3d(0, ${translateY}px, 0)`;
            }
        );


        ticking = false;
    };


    const requestUpdate = () => {
        if (ticking) {
            return;
        }


        ticking = true;


        window.requestAnimationFrame(
            updateParallax
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


    updateParallax();
};


/* =========================================================
   SERVICE MARQUEE
========================================================= */

const initServiceMarquee = () => {
    const track = serviceQuery(
        ".service-marquee__track"
    );


    if (!track) {
        return;
    }


    if (serviceReducedMotion) {
        track.style.animationPlayState =
            "paused";

        return;
    }


    const marquee = track.closest(
        ".service-marquee"
    );


    if (!marquee) {
        return;
    }


    marquee.addEventListener(
        "focusin",
        () => {
            track.style.animationPlayState =
                "paused";
        }
    );


    marquee.addEventListener(
        "focusout",
        () => {
            track.style.animationPlayState =
                "running";
        }
    );
};


/* =========================================================
   REFRESH AOS
========================================================= */

const refreshServiceLayout = () => {
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

const initServicePage = () => {
    initServiceSlider();

    initServiceAccordion();

    initServiceParallax();

    initServiceMarquee();
};


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initServicePage
    );
} else {
    initServicePage();
}


window.addEventListener(
    "load",
    refreshServiceLayout
);
