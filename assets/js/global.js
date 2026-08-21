"use strict";


/* =========================================================
   HELPERS
========================================================= */

const qs = (selector, scope = document) => scope.querySelector(selector);

const qsa = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

const getConfigValue = (key) => {
    if (!window.SITE_CONFIG) {
        return undefined;
    }

    return window.SITE_CONFIG[key];
};

const getFocusableElements = (container) => {
    if (!container) {
        return [];
    }

    return qsa(
        [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(","),
        container
    ).filter((element) => {
        return (
            !element.hasAttribute("hidden") &&
            element.getAttribute("aria-hidden") !== "true"
        );
    });
};


/* =========================================================
   CONFIG
========================================================= */

const applySiteConfig = () => {
    const config = window.SITE_CONFIG;

    if (!config) {
        console.warn("SITE_CONFIG is not available.");
        return;
    }


    /* Browser title */

    if (config.browserTitle) {
        document.title = config.browserTitle;
    }


    /* Favicon */

    const favicon = qs("#site-favicon");

    if (favicon && config.favicon) {
        favicon.setAttribute("href", config.favicon);
    }


    /* Text values */

    qsa("[data-config]").forEach((element) => {
        const configKey = element.dataset.config;
        const value = getConfigValue(configKey);

        if (typeof value === "string") {
            element.textContent = value;
        }
    });


    /* Image paths */

    qsa("[data-config-src]").forEach((element) => {
        const configKey = element.dataset.configSrc;
        const value = getConfigValue(configKey);

        if (typeof value === "string") {
            element.setAttribute("src", value);
        }
    });


    /* Dynamic links */

    qsa("[data-config-href]").forEach((element) => {
        const configKey = element.dataset.configHref;
        const value = getConfigValue(configKey);

        if (typeof value !== "string") {
            return;
        }

        if (configKey === "email") {
            element.setAttribute("href", `mailto:${value}`);
            return;
        }

        element.setAttribute("href", value);
    });
};


/* =========================================================
   CURRENT YEAR
========================================================= */

const setCurrentYear = () => {
    const year = new Date().getFullYear();

    qsa("[data-current-year]").forEach((element) => {
        element.textContent = year;
    });
};


/* =========================================================
   PAGE SCROLL LOCK
========================================================= */

const lockPage = () => {
    document.body.classList.add("is-locked");
};

const unlockPage = () => {
    const menuIsOpen = qs("[data-menu].is-open");
    const modalIsOpen = qs("[data-modal].is-open");

    if (!menuIsOpen && !modalIsOpen) {
        document.body.classList.remove("is-locked");
    }
};


/* =========================================================
   SIDE MENU
========================================================= */

const initSideMenu = () => {
    const menu = qs("[data-menu]");
    const toggle = qs("[data-menu-toggle]");

    if (!menu || !toggle) {
        return;
    }

    const closeButtons = qsa("[data-menu-close]", menu);
    const navigationLinks = qsa(".site-menu__nav a", menu);

    let lastFocusedElement = null;


    const openMenu = () => {
        const openedModal = qs("[data-modal].is-open");

        if (openedModal) {
            closeModal(openedModal, false);
        }

        lastFocusedElement = document.activeElement;

        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");

        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation");

        lockPage();

        const focusableElements = getFocusableElements(menu);

        if (focusableElements.length) {
            window.requestAnimationFrame(() => {
                focusableElements[0].focus();
            });
        }
    };


    const closeMenu = (restoreFocus = true) => {
        if (!menu.classList.contains("is-open")) {
            return;
        }

        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");

        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");

        unlockPage();

        if (
            restoreFocus &&
            lastFocusedElement instanceof HTMLElement
        ) {
            lastFocusedElement.focus();
        }
    };


    toggle.addEventListener("click", () => {
        if (menu.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });


    closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            closeMenu();
        });
    });


    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu(false);
        });
    });


    menu.addEventListener("keydown", (event) => {
        if (
            event.key !== "Tab" ||
            !menu.classList.contains("is-open")
        ) {
            return;
        }

        const focusableElements = getFocusableElements(menu);

        if (!focusableElements.length) {
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
            focusableElements[focusableElements.length - 1];

        if (
            event.shiftKey &&
            document.activeElement === firstElement
        ) {
            event.preventDefault();
            lastElement.focus();
        }

        if (
            !event.shiftKey &&
            document.activeElement === lastElement
        ) {
            event.preventDefault();
            firstElement.focus();
        }
    });


    return {
        close: closeMenu
    };
};


/* =========================================================
   MODALS
========================================================= */

let activeModal = null;
let modalTriggerElement = null;


const openModal = (modal) => {
    if (!modal) {
        return;
    }

    const openMenu = qs("[data-menu].is-open");

    if (openMenu) {
        openMenu.classList.remove("is-open");
        openMenu.setAttribute("aria-hidden", "true");

        const menuToggle = qs("[data-menu-toggle]");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute(
                "aria-label",
                "Open navigation"
            );
        }
    }


    if (activeModal && activeModal !== modal) {
        closeModal(activeModal, false);
    }


    activeModal = modal;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    lockPage();


    const focusableElements =
        getFocusableElements(modal);

    if (focusableElements.length) {
        window.requestAnimationFrame(() => {
            focusableElements[0].focus();
        });
    }
};


const closeModal = (
    modal = activeModal,
    restoreFocus = true
) => {
    if (!modal) {
        return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    activeModal = null;

    unlockPage();


    if (
        restoreFocus &&
        modalTriggerElement instanceof HTMLElement
    ) {
        modalTriggerElement.focus();
    }

    modalTriggerElement = null;
};


const initModals = () => {
    const modalTriggers = qsa("[data-modal-open]");
    const modals = qsa("[data-modal]");

    if (!modalTriggers.length || !modals.length) {
        return;
    }


    modalTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const modalId = trigger.dataset.modalOpen;
            const modal = document.getElementById(modalId);

            if (!modal) {
                return;
            }

            modalTriggerElement = trigger;

            openModal(modal);
        });
    });


    modals.forEach((modal) => {
        qsa("[data-modal-close]", modal).forEach(
            (closeButton) => {
                closeButton.addEventListener("click", () => {
                    closeModal(modal);
                });
            }
        );


        modal.addEventListener("keydown", (event) => {
            if (
                event.key !== "Tab" ||
                !modal.classList.contains("is-open")
            ) {
                return;
            }

            const focusableElements =
                getFocusableElements(modal);

            if (!focusableElements.length) {
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement =
                focusableElements[
                    focusableElements.length - 1
                ];

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
            }

            if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        });
    });
};


/* =========================================================
   ESCAPE KEY
========================================================= */

const initEscapeKey = (sideMenuController) => {
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        if (activeModal) {
            closeModal();
            return;
        }

        const menu = qs("[data-menu]");

        if (
            menu &&
            menu.classList.contains("is-open") &&
            sideMenuController
        ) {
            sideMenuController.close();
        }
    });
};


/* =========================================================
   BACK TO TOP
========================================================= */

const initScrollToTop = () => {
    qsa("[data-scroll-top]").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });
};


/* =========================================================
   CONTACT FORMS
========================================================= */

const setFormStatus = (
    form,
    message,
    status = ""
) => {
    const statusElement = qs(
        "[data-form-status]",
        form
    );

    if (!statusElement) {
        return;
    }

    statusElement.classList.remove(
        "is-success",
        "is-error"
    );

    if (status === "success") {
        statusElement.classList.add("is-success");
    }

    if (status === "error") {
        statusElement.classList.add("is-error");
    }

    statusElement.textContent = message;
};


const setFormLoading = (form, isLoading) => {
    const submitButton = qs(
        'button[type="submit"]',
        form
    );

    if (!submitButton) {
        return;
    }

    if (isLoading) {
        submitButton.dataset.originalText =
            submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.setAttribute(
            "aria-busy",
            "true"
        );

        submitButton.textContent = "Sending...";
        return;
    }


    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");


    if (submitButton.dataset.originalText) {
        submitButton.innerHTML =
            submitButton.dataset.originalText;

        delete submitButton.dataset.originalText;
    }
};


const submitContactForm = async (form) => {
    const formData = new FormData(form);

    setFormStatus(form, "");
    setFormLoading(form, true);


    try {
        const response = await fetch(
            form.getAttribute("action") || "contact.php",
            {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            }
        );


        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }


        if (!response.ok) {
            throw new Error(
                result?.message ||
                "The request could not be sent."
            );
        }


        if (result && result.success === false) {
            throw new Error(
                result.message ||
                "The request could not be sent."
            );
        }


        setFormStatus(
            form,
            result?.message ||
                "Successfully sent. Thank you — we’ll get back to you by email.",
            "success"
        );


        form.reset();

    } catch (error) {
        setFormStatus(
            form,
            error instanceof Error
                ? error.message
                : "Something went wrong. Please try again.",
            "error"
        );

    } finally {
        setFormLoading(form, false);
    }
};


const initContactForms = () => {
    const forms = qsa("[data-contact-form]");

    forms.forEach((form) => {
        form.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();


                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }


                await submitContactForm(form);
            }
        );


        qsa(
            "input, select, textarea",
            form
        ).forEach((field) => {
            field.addEventListener("input", () => {
                const status = qs(
                    "[data-form-status]",
                    form
                );

                if (
                    status &&
                    status.classList.contains("is-error")
                ) {
                    setFormStatus(form, "");
                }
            });
        });
    });
};


/* =========================================================
   AOS
========================================================= */

const initAOS = () => {
    if (
        typeof window.AOS === "undefined" ||
        !qs("[data-aos]")
    ) {
        return;
    }


    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    window.AOS.init({
        duration: 780,
        easing: "ease-out-cubic",
        once: true,
        mirror: false,
        offset: 70,
        delay: 0,
        anchorPlacement: "top-bottom",
        disable: prefersReducedMotion
    });
};


/* =========================================================
   FLIP CARDS
========================================================= */

const initFlipCards = () => {
    const cards = qsa(".flip-card");

    if (!cards.length) {
        return;
    }

    const isTouch = window.matchMedia("(hover: none)").matches;

    if (!isTouch) {
        return;
    }

    cards.forEach((card) => {
        card.addEventListener("click", (event) => {
            event.preventDefault();
            card.classList.toggle("is-flipped");
        });
    });
};


/* =========================================================
   IMAGE ERROR SAFETY
========================================================= */

const initImageSafety = () => {
    qsa("img").forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("is-image-missing");
        });
    });
};


/* =========================================================
   INITIALIZATION
========================================================= */

const initGlobal = () => {
    applySiteConfig();

    setCurrentYear();

    const sideMenuController =
        initSideMenu();

    initModals();

    initEscapeKey(sideMenuController);

    initScrollToTop();

    initContactForms();

    initAOS();

    initFlipCards();

    initImageSafety();
};


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initGlobal
    );
} else {
    initGlobal();
}
