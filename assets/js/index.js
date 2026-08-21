"use strict";


/* =========================================================
   HOME PAGE HELPERS
========================================================= */

const homeQuery = (selector, scope = document) =>
    scope.querySelector(selector);

const homeQueryAll = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const updateSwiperWhenReady = (swiper, slider) => {
    if (!swiper || !slider) {
        return;
    }


    const update = () => {
        if (!swiper.destroyed) {
            swiper.update();
        }
    };


    window.requestAnimationFrame(update);

    homeQueryAll("img", slider).forEach((image) => {
        if (image.complete) {
            return;
        }


        image.addEventListener("load", update, {
            once: true
        });
    });
};

const syncAutoSwiperEndOffset = (swiper, slider) => {
    if (!swiper || !slider) {
        return;
    }


    const sync = () => {
        if (swiper.destroyed) {
            return;
        }


        const firstSlide = homeQuery(
            ".swiper-slide",
            slider
        );

        if (!firstSlide) {
            return;
        }


        const sliderWidth =
            slider.getBoundingClientRect().width;

        const slideWidth =
            firstSlide.getBoundingClientRect().width;

        const offset = Math.max(
            0,
            Math.round(sliderWidth - slideWidth)
        );


        if (
            Math.abs(
                (swiper.params.slidesOffsetAfter || 0) -
                    offset
            ) < 1
        ) {
            return;
        }


        swiper.params.slidesOffsetAfter = offset;
        swiper.update();
    };


    window.requestAnimationFrame(sync);

    if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(sync);
        observer.observe(slider);
    } else {
        window.addEventListener("resize", sync);
    }


    homeQueryAll("img", slider).forEach((image) => {
        if (image.complete) {
            return;
        }


        image.addEventListener("load", sync, {
            once: true
        });
    });
};


/* =========================================================
   HERO SWIPER
========================================================= */

const initHeroSlider = () => {
    const slider = homeQuery("[data-hero-slider]");

    if (!slider || typeof window.Swiper === "undefined") {
        return;
    }


    const previousButton = homeQuery(
        "[data-hero-prev]",
        slider
    );

    const nextButton = homeQuery(
        "[data-hero-next]",
        slider
    );

    const pagination = homeQuery(
        "[data-hero-pagination]",
        slider
    );


    const slides = homeQueryAll(
        ".swiper-slide",
        slider
    );


    if (!slides.length) {
        return;
    }


    const heroSwiper = new window.Swiper(slider, {
        slidesPerView: 1,
        spaceBetween: 0,

        speed: prefersReducedMotion ? 0 : 1050,

        updateOnWindowResize: true,
        resizeObserver: true,
        observer: true,
        observeParents: true,
        roundLengths: true,

        loop: slides.length > 1,

        allowTouchMove: slides.length > 1,

        grabCursor: slides.length > 1,

        watchOverflow: true,

        keyboard: {
            enabled: true,
            onlyInViewport: true
        },

        autoplay:
            !prefersReducedMotion && slides.length > 1
                ? {
                    delay: 6500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }
                : false,

        navigation: {
            prevEl: previousButton,
            nextEl: nextButton
        },

        pagination: {
            el: pagination,
            clickable: true
        },

        a11y: {
            enabled: true,
            prevSlideMessage: "Previous hero slide",
            nextSlideMessage: "Next hero slide",
            paginationBulletMessage:
                "Go to hero slide {{index}}"
        }
    });

    updateSwiperWhenReady(heroSwiper, slider);
};


/* =========================================================
   TUB TYPES SWIPER
========================================================= */

const initTubTypesSlider = () => {
    const slider = homeQuery("[data-tub-slider]");

    if (!slider || typeof window.Swiper === "undefined") {
        return;
    }


    const previousButton = homeQuery("[data-tub-prev]");
    const nextButton = homeQuery("[data-tub-next]");
    const pagination = homeQuery("[data-tub-pagination]");


    const slides = homeQueryAll(
        ".swiper-slide",
        slider
    );


    if (!slides.length) {
        return;
    }


    const tubSwiper = new window.Swiper(slider, {
        slidesPerView: 1,
        spaceBetween: 28,

        speed: prefersReducedMotion ? 0 : 850,

        updateOnWindowResize: true,
        resizeObserver: true,
        observer: true,
        observeParents: true,
        roundLengths: true,

        watchOverflow: true,

        grabCursor: slides.length > 1,

        autoHeight: false,

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
                spaceBetween: 16
            },

            641: {
                spaceBetween: 22
            },

            1025: {
                spaceBetween: 28
            }
        },

        a11y: {
            enabled: true,
            prevSlideMessage:
                "Previous walk-in tub option",
            nextSlideMessage:
                "Next walk-in tub option"
        }
    });

    updateSwiperWhenReady(tubSwiper, slider);
};


/* =========================================================
   INSPIRATION SWIPER
========================================================= */

const initInspirationSlider = () => {
    const slider = homeQuery(
        "[data-inspiration-slider]"
    );

    if (!slider || typeof window.Swiper === "undefined") {
        return;
    }


    const previousButton = homeQuery(
        "[data-inspiration-prev]"
    );

    const nextButton = homeQuery(
        "[data-inspiration-next]"
    );


    const slides = homeQueryAll(
        ".swiper-slide",
        slider
    );


    if (!slides.length) {
        return;
    }


    const inspirationSwiper = new window.Swiper(slider, {
        slidesPerView: "auto",

        spaceBetween: 24,
        slidesOffsetAfter: 0,

        speed: prefersReducedMotion ? 0 : 900,

        updateOnWindowResize: true,
        resizeObserver: true,
        observer: true,
        observeParents: true,
        roundLengths: true,

        grabCursor: slides.length > 1,

        watchOverflow: true,

        centeredSlides: false,

        freeMode: false,

        keyboard: {
            enabled: true,
            onlyInViewport: true
        },

        navigation: {
            prevEl: previousButton,
            nextEl: nextButton
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
            prevSlideMessage:
                "Previous bathroom inspiration",
            nextSlideMessage:
                "Next bathroom inspiration"
        }
    });

    syncAutoSwiperEndOffset(inspirationSwiper, slider);

    updateSwiperWhenReady(inspirationSwiper, slider);
};


/* =========================================================
   ACCORDION
========================================================= */

const initAccordion = () => {
    const accordions = homeQueryAll("[data-accordion]");

    if (!accordions.length) {
        return;
    }


    accordions.forEach((accordion) => {
        const items = homeQueryAll(
            ".accordion-item",
            accordion
        );


        if (!items.length) {
            return;
        }


        const closeItem = (item, animate = true) => {
            const trigger = homeQuery(
                ".accordion-item__trigger",
                item
            );

            const panel = homeQuery(
                ".accordion-item__panel",
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
                prefersReducedMotion ||
                !animate
            ) {
                panel.hidden = true;
                panel.style.height = "";
                panel.style.overflow = "";

                return;
            }


            const startHeight =
                panel.getBoundingClientRect().height;


            panel.style.height = `${startHeight}px`;
            panel.style.overflow = "hidden";


            window.requestAnimationFrame(() => {
                panel.style.transition =
                    "height 420ms cubic-bezier(0.22, 1, 0.36, 1)";

                panel.style.height = "0px";
            });


            const onTransitionEnd = (event) => {
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
                    onTransitionEnd
                );
            };


            panel.addEventListener(
                "transitionend",
                onTransitionEnd
            );
        };


        const openItem = (item, animate = true) => {
            const trigger = homeQuery(
                ".accordion-item__trigger",
                item
            );

            const panel = homeQuery(
                ".accordion-item__panel",
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
                prefersReducedMotion ||
                !animate
            ) {
                panel.style.height = "";
                panel.style.overflow = "";

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


            const onTransitionEnd = (event) => {
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
                    onTransitionEnd
                );
            };


            panel.addEventListener(
                "transitionend",
                onTransitionEnd
            );
        };


        /*
         * Synchronise initial HTML state.
         */

        items.forEach((item) => {
            const trigger = homeQuery(
                ".accordion-item__trigger",
                item
            );

            const panel = homeQuery(
                ".accordion-item__panel",
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


        /*
         * Click behaviour.
         * Only one item remains open at a time.
         */

        items.forEach((item) => {
            const trigger = homeQuery(
                ".accordion-item__trigger",
                item
            );


            if (!trigger) {
                return;
            }


            trigger.addEventListener(
                "click",
                () => {
                    const isCurrentlyOpen =
                        item.classList.contains(
                            "is-open"
                        );


                    if (isCurrentlyOpen) {
                        closeItem(item);
                        return;
                    }


                    items.forEach(
                        (otherItem) => {
                            if (
                                otherItem !== item &&
                                otherItem.classList.contains(
                                    "is-open"
                                )
                            ) {
                                closeItem(otherItem);
                            }
                        }
                    );


                    openItem(item);
                }
            );
        });
    });
};


/* =========================================================
   PARALLAX
========================================================= */

const initParallax = () => {
    const sections = homeQueryAll(
        "[data-parallax-section]"
    );


    if (
        !sections.length ||
        prefersReducedMotion
    ) {
        return;
    }


    const parallaxItems = sections
        .map((section) => {
            const media = homeQuery(
                "[data-parallax-media]",
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


    if (!parallaxItems.length) {
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


        parallaxItems.forEach(
            ({ section, media }) => {
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


                const translate =
                    progress * -70;


                media.style.transform =
                    `translate3d(0, ${translate}px, 0)`;
            }
        );


        ticking = false;
    };


    const requestParallaxUpdate = () => {
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
        requestParallaxUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestParallaxUpdate
    );


    updateParallax();
};


/* =========================================================
   MARQUEE
========================================================= */

const initMarquee = () => {
    const marquees = homeQueryAll(
        "[data-marquee]"
    );


    if (!marquees.length) {
        return;
    }


    marquees.forEach((marquee) => {
        const track = homeQuery(
            ".marquee__track",
            marquee
        );


        if (!track) {
            return;
        }


        /*
         * The second half of the text in index.html is
         * intentionally duplicated for the seamless loop.
         */

        if (prefersReducedMotion) {
            track.style.animationPlayState =
                "paused";
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
                if (!prefersReducedMotion) {
                    track.style.animationPlayState =
                        "running";
                }
            }
        );
    });
};


/* =========================================================
   ASSEMBLY REVEAL
========================================================= */

const initAssemblyReveal = () => {
    const grid = homeQuery("[data-assembly-grid]");

    if (!grid) {
        return;
    }


    const settle = () => {
        grid.classList.add("is-settled");
    };


    if (
        prefersReducedMotion ||
        typeof window.IntersectionObserver === "undefined"
    ) {
        grid.classList.add(
            "is-visible",
            "is-settled"
        );

        return;
    }


    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }


                grid.classList.add("is-visible");

                window.setTimeout(settle, 1150);

                currentObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.25,
            rootMargin: "0px 0px -10% 0px"
        }
    );


    observer.observe(grid);
};


/* =========================================================
   REINITIALISE SWIPERS AFTER IMAGES
========================================================= */

const refreshHomeLayout = () => {
    homeQueryAll(".swiper").forEach((slider) => {
        if (slider.swiper && !slider.swiper.destroyed) {
            slider.swiper.update();
        }
    });
};


/* =========================================================
   INITIALIZATION
========================================================= */

const initHomePage = () => {
    initHeroSlider();

    initTubTypesSlider();

    initInspirationSlider();

    initAccordion();

    initParallax();

    initMarquee();

    initAssemblyReveal();
};


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initHomePage
    );
} else {
    initHomePage();
}


window.addEventListener(
    "load",
    refreshHomeLayout
);
