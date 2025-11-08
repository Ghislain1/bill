$(window).on('scroll', function () {
    // Custom jQuery code can go here
    if ($(window).scrollTop() > 450) {
        // Code to execute every 50 pixels scrolled
        $('nav.navbar').addClass('bg-white');

        //  Back to top button
        $('#back-to-top-button').addClass('d-inline');
    }
    else {
        $('nav.navbar').removeClass('bg-white');
        $('#back-to-top-button').removeClass('d-inline');
    }
});

// Smooth scroll for back to top button
$(document).ready(function () {
    $('a.smooth').on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800, function () {
                window.location.hash = hash;
            });
        }
    });
});

// Start Klassenaenderung
$(window).on('scroll', function () {
    if ($(window).scrollTop() > 50) {
        // Navigation Hintergrundfarbe aendern
        $('nav.navbar').addClass('bg-white', 700);

    }
    else {
        $('nav.navbar').removeClass('bg-white', 700);
    }
});
// Ende Klassenaenderung

// Start Cookies Banner

if (!localStorage.getItem('cookiesBannerModal')) {
    var cookieModal = new bootstrap.Modal(document.getElementById('cookiesBannerModal'));
    cookieModal.show();
}

function acceptCookies() {
    localStorage.setItem('cookiesBannerModal', 'true');
    var cookieModal = new bootstrap.Modal(document.getElementById('cookiesBannerModal'));
    cookieModal.hide();
}
// Ende Cookies Banner
