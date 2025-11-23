document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Throttle navigation to prevent rapid consecutive navigations
    let lastNavigationTime = 0;
    const NAVIGATION_COOLDOWN = 800; // milliseconds

    // Configuration
    const CONFIG = {
        userString: 'yo@website',
        startDate: new Date('2018-12-01') // Customize this to your actual start date
    };

    // ==================== LOADING SCREEN ====================
    const loadingHTML = `
        <div class="loading-screen" id="loading-screen">
            <div class="boot-text">[SYSTEM] Initializing terminal interface...</div>
            <div class="boot-text">[SYSTEM] Loading user profile...</div>
            <div class="boot-text">[SYSTEM] Mounting file systems...</div>
            <div class="boot-text">[SYSTEM] Starting network services...</div>
            <div class="boot-text">[OK] All systems operational</div>
            <div class="boot-text">[SYSTEM] Welcome to ${CONFIG.userString}</div>
        </div>
    `;

    // Function to show loading screen
    const showLoadingScreen = () => {
        // Remove existing loading screen if present
        const existingScreen = document.getElementById('loading-screen');
        if (existingScreen) {
            existingScreen.remove();
        }

        // Insert new loading screen
        body.insertAdjacentHTML('afterbegin', loadingHTML);
        const loadingScreen = document.getElementById('loading-screen');

        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 3500);
    };

    // Only show loading screen on first visit
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
        showLoadingScreen();
        sessionStorage.setItem('hasVisited', 'true');
    }

    // Make reboot function globally accessible
    window.reboot = () => {
        // Check if we need to navigate to home page
        const isOnHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

        if (!isOnHomePage) {
            // Navigate to home page immediately, the loading screen will show there on page load
            // Set a flag so we know to show the loading screen on the home page
            sessionStorage.setItem('showRebootScreen', 'true');
            window.location.href = 'index.html';
        } else {
            // Already on home page, just show loading screen
            showLoadingScreen(false);
        }
    };

    // Check if we should show reboot screen (user triggered reboot from another page)
    if (sessionStorage.getItem('showRebootScreen') === 'true') {
        sessionStorage.removeItem('showRebootScreen');
        showLoadingScreen(false);
    }

    // ==================== DYNAMIC USER STRING ====================
    const userElements = document.querySelectorAll('.dynamic-user');
    userElements.forEach(el => {
        el.innerHTML = CONFIG.userString.replace('@', '<span class="at-symbol">@</span>');
    });

    // ==================== DYNAMIC PAGE TITLE & META TAGS ====================
    // Update page title to use dynamic user string
    const titleElement = document.querySelector('title');
    if (titleElement) {
        titleElement.textContent = titleElement.textContent.replace(/User@Website/gi, CONFIG.userString);
    }

    // Update Open Graph and Twitter meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', ogTitle.getAttribute('content').replace(/User@Website/gi, CONFIG.userString));
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.setAttribute('content', twitterTitle.getAttribute('content').replace(/User@Website/gi, CONFIG.userString));
    }

    // ==================== DYNAMIC UPTIME CALCULATION ====================
    const uptimeElement = document.querySelector('.system-status p:nth-child(4) strong');
    if (uptimeElement && uptimeElement.textContent.includes('UPTIME')) {
        const calculateUptime = () => {
            const now = new Date();
            const diff = now - CONFIG.startDate;
            const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
            const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
            return `${years} Years, ${months} Months`;
        };

        const uptimeText = uptimeElement.parentElement;
        uptimeText.innerHTML = `<strong>> CAREER_UPTIME:</strong> ${calculateUptime()}`;
    }

    // ==================== THEME MANAGEMENT ====================
    const themes = ['homebrew', 'ocean', 'red-sands', 'silver-aerogel', 'basic'];
    const savedTheme = localStorage.getItem('terminal-theme');
    let currentThemeIndex = 0;

    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        currentThemeIndex = themes.indexOf(savedTheme);
        if (currentThemeIndex === -1) currentThemeIndex = 0;
    } else {
        body.setAttribute('data-theme', 'homebrew');
    }

    // Theme Dropdown Logic
    const themeTrigger = document.getElementById('theme-trigger');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (themeTrigger && themeDropdown) {
        themeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            themeDropdown.classList.toggle('visible');
            // Remove keyboard-focused class when opening with mouse
            if (themeDropdown.classList.contains('visible')) {
                themeOptions.forEach(opt => opt.classList.remove('keyboard-focused'));
            }
        });

        document.addEventListener('click', () => {
            themeDropdown.classList.remove('visible');
            // Remove keyboard-focused class when closing dropdown
            themeOptions.forEach(opt => opt.classList.remove('keyboard-focused'));
        });

        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const newTheme = option.getAttribute('data-theme');
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('terminal-theme', newTheme);
                themeDropdown.classList.remove('visible');
            });
        });
    }

    // ==================== KEYBOARD SHORTCUTS ====================

    // Create shortcuts modal
    const createShortcutsModal = () => {
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.id = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-modal-content">
                <button class="shortcuts-modal-close" aria-label="Close shortcuts">×</button>
                <h2>Keyboard Shortcuts</h2>
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Ctrl/Cmd + K</span>
                        <span class="shortcut-description">Toggle theme menu</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-keys">↑ / ↓</span>
                        <span class="shortcut-description">Navigate theme menu</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Ctrl/Cmd + ← / →</span>
                        <span class="shortcut-description">Navigate pages</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-keys">Ctrl/Cmd + Shift + B</span>
                        <span class="shortcut-description">Reboot</span>
                    </div>
                </div>
            </div>
        `;
        body.appendChild(modal);

        // Store hideModal reference for later
        modal.hideModal = () => {
            modal.classList.remove('visible');
            setTimeout(() => {
                if (!modal.classList.contains('visible')) {
                    modal.style.display = 'none';
                }
            }, 300);
        };

        // Close modal handlers
        const closeBtn = modal.querySelector('.shortcuts-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.hideModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.hideModal();
            }
        });
        return modal;
    };

    const shortcutsModal = createShortcutsModal();

    // Helper functions for showing/hiding modal with proper transitions
    const showModal = () => {
        shortcutsModal.style.display = 'flex';
        // Force reflow to ensure display change is applied before opacity transition
        shortcutsModal.offsetHeight;
        shortcutsModal.classList.add('visible');
    };

    const hideModal = () => {
        shortcutsModal.classList.remove('visible');
        // Wait for transition to complete before hiding
        setTimeout(() => {
            if (!shortcutsModal.classList.contains('visible')) {
                shortcutsModal.style.display = 'none';
            }
        }, 300);
    };

    // Help button click handler
    const helpTrigger = document.getElementById('help-trigger');
    if (helpTrigger) {
        helpTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        // Esc: Close modal
        if (e.key === 'Escape') {
            hideModal();
        }

        // Ctrl+K or Cmd+K: Toggle theme dropdown
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (themeDropdown) {
                themeDropdown.classList.toggle('visible');
                if (themeDropdown.classList.contains('visible')) {
                    themeOptions[0]?.focus();
                    // Apply keyboard-focused class to first option for preview
                    themeOptions[0]?.classList.add('keyboard-focused');
                } else {
                    // Remove keyboard-focused class when closing
                    themeOptions.forEach(opt => opt.classList.remove('keyboard-focused'));
                }
            }
        }

        // Ctrl+L or Cmd+L: Scroll to top
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Ctrl+Shift+B or Cmd+Shift+B: Reboot (show loading screen)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
            e.preventDefault();
            window.reboot();
        }

        // Ctrl+Arrow Keys: Navigate between pages
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();

            const pages = ['index.html', 'projects.html', 'papers.html'];
            const currentPath = window.location.pathname;

            // More robust page detection
            let currentIndex = -1;

            // Check if current path ends with any of our pages
            for (let i = 0; i < pages.length; i++) {
                if (currentPath.endsWith(pages[i]) ||
                    (currentPath === '/' && pages[i] === 'index.html') ||
                    (currentPath === '' && pages[i] === 'index.html')) {
                    currentIndex = i;
                    break;
                }
            }

            // If we still can't determine the page, default to index
            if (currentIndex === -1) {
                currentIndex = 0;
            }

            // Prevent rapid consecutive navigations using timestamp throttle
            const currentTime = Date.now();
            if (currentTime - lastNavigationTime >= NAVIGATION_COOLDOWN) {
                lastNavigationTime = currentTime;

                let targetIndex;
                if (e.key === 'ArrowRight') {
                    // Wrap to first page if at the end
                    targetIndex = (currentIndex + 1) % pages.length;
                } else if (e.key === 'ArrowLeft') {
                    // Wrap to last page if at the beginning
                    targetIndex = (currentIndex - 1 + pages.length) % pages.length;
                }

                // Strict validation: only navigate if we have a valid target index
                if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < pages.length) {
                    const targetPage = pages[targetIndex];
                    // Double-check the target page is one of our known pages
                    if (pages.includes(targetPage)) {
                        window.location.href = targetPage;
                    }
                }
            }
        }

        // Arrow keys in theme dropdown
        if (themeDropdown && themeDropdown.classList.contains('visible')) {
            const optionArray = Array.from(themeOptions);
            const focusedIndex = optionArray.indexOf(document.activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                // Remove keyboard-focused class from all options
                optionArray.forEach(opt => opt.classList.remove('keyboard-focused'));
                const nextIndex = (focusedIndex + 1) % optionArray.length;
                optionArray[nextIndex].focus();
                // Add keyboard-focused class to trigger preview
                optionArray[nextIndex].classList.add('keyboard-focused');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                // Remove keyboard-focused class from all options
                optionArray.forEach(opt => opt.classList.remove('keyboard-focused'));
                const prevIndex = focusedIndex <= 0 ? optionArray.length - 1 : focusedIndex - 1;
                optionArray[prevIndex].focus();
                // Add keyboard-focused class to trigger preview
                optionArray[prevIndex].classList.add('keyboard-focused');
            } else if (e.key === 'Enter' && focusedIndex >= 0) {
                e.preventDefault();
                optionArray[focusedIndex].click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                // Remove keyboard-focused class from all options
                optionArray.forEach(opt => opt.classList.remove('keyboard-focused'));
                themeDropdown.classList.remove('visible');
                themeTrigger?.focus();
            }
        }
    });

    // ==================== HIGHLIGHT ACTIVE NAV LINK ====================
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath) || (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ==================== SKILL BAR ANIMATION ====================
    const skillBars = document.querySelectorAll('.fill');
    if (skillBars.length > 0) {
        setTimeout(() => {
            skillBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
            });
        }, 300);
    }

    // ==================== LOG ENTRY ANIMATION ====================
    const logEntries = document.querySelectorAll('.log-entry');
    if (logEntries.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        logEntries.forEach(entry => {
            observer.observe(entry);
        });
    }

    // ==================== TYPING EFFECT ON H1 ====================
    const h1Element = document.querySelector('h1');
    if (h1Element && !hasVisited) {
        const originalText = h1Element.textContent;
        h1Element.textContent = '';
        h1Element.style.opacity = '1';

        setTimeout(() => {
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < originalText.length) {
                    h1Element.textContent += originalText[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 100);
        }, 2000);
    }

    // ==================== SOCIAL BADGE TOGGLE ====================
    const socialBadge = document.getElementById('social-badge');
    const socialToggle = document.getElementById('social-toggle');

    if (socialToggle && socialBadge) {
        socialToggle.addEventListener('click', () => {
            socialBadge.classList.toggle('expanded');
        });

        document.addEventListener('click', (e) => {
            if (!socialBadge.contains(e.target)) {
                socialBadge.classList.remove('expanded');
            }
        });
    }

    // ==================== SCROLL TO TOP BUTTON ====================
    const scrollTopHTML = '<button class="scroll-to-top" id="scroll-to-top" aria-label="Scroll to top">↑ TOP</button>';
    body.insertAdjacentHTML('beforeend', scrollTopHTML);

    const scrollTopBtn = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ==================== FADE IN ELEMENTS ON SCROLL ====================
    const fadeElements = document.querySelectorAll('.log-entry');
    if (fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-element');
                } else {
                    entry.target.classList.remove('fade-in-element');
                }
            });
        }, { threshold: 0.1 });

        fadeElements.forEach(el => {
            fadeObserver.observe(el);
        });
    }
    // ==================== TIMELINE SCROLL TRIGGER ====================
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const updateTimelineActiveState = () => {
            const container = document.querySelector('.timeline-container');
            if (!container) return;

            const progressBar = container.querySelector('.timeline-progress');
            const containerRect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Determine the "read line" - the point on the screen where we consider items "passed"
            // Using 40% from the top as a balanced reading position
            const triggerPoint = viewportHeight * 0.4;

            // Calculate how far the trigger point is into the container
            // containerRect.top is relative to viewport. 
            // If container top is at triggerPoint, progress is 0.
            // If container top is above triggerPoint (negative), progress increases.
            let progressPx = triggerPoint - containerRect.top;

            // Clamp progress between 0 and container height
            progressPx = Math.max(0, Math.min(progressPx, containerRect.height));

            // Force full progress if at the bottom of the page
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                progressPx = containerRect.height;
            }

            // Update progress bar height
            if (progressBar) {
                progressBar.style.height = `${progressPx}px`;
            }

            // Update active state for items
            // Items are active if their top position is ABOVE (less than) the progress point
            timelineItems.forEach(item => {
                // Get item's position relative to the container
                const itemTop = item.offsetTop;

                // Add a small buffer (e.g. 20px) so the dot turns on just as the line reaches it
                if (itemTop < progressPx + 20) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        };

        // Initial check
        updateTimelineActiveState();

        // Update on scroll with requestAnimationFrame for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTimelineActiveState();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
});
