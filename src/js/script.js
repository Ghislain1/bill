const navigation = document.getElementById('navbar-toggle');
const toggle = document.querySelector('.navbar-toggler');
function closeNavigation() {
    navigation?.classList.remove('show');
    toggle?.setAttribute('aria-expanded', 'false');
}
toggle?.addEventListener('click', () => {
    const expanded = navigation.classList.toggle('show');
    toggle.setAttribute('aria-expanded', String(expanded));
});
navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation?.classList.contains('show')) {
        closeNavigation();
        toggle.focus();
    }
});
const backToTop = document.getElementById('back-to-top-button');
function updateScroll() {
    document.querySelector('nav.navbar')?.classList.toggle('bg-white', window.scrollY > 70);
    backToTop?.classList.toggle('d-inline', window.scrollY > 70);
}
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();
document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
});
// Videos only download after the visitor presses play.
document.querySelectorAll('[data-video-toggle]').forEach((button) => {
    const video = document.getElementById(button.dataset.videoToggle);
    button.addEventListener('click', async () => {
        if (!video) return;
        if (!video.paused) {
            video.pause();
            button.textContent = 'Video abspielen';
            button.setAttribute('aria-pressed', 'false');
            return;
        }
        try {
            if (!video.src) video.src = video.querySelector('a').href;
            await video.play();
            button.textContent = 'Video pausieren';
            button.setAttribute('aria-pressed', 'true');
        } catch {
            button.textContent = 'Video erneut laden';
            button.setAttribute('aria-pressed', 'false');
        }
    });
});
