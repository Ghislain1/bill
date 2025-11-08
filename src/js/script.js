$(window).on('scroll', function () {
    // Custom jQuery code can go here
    if ($(window).scrollTop() > 70) {
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

// (ANIMATION)Smooth scroll for back to top button
$(document).ready(function () {
    $('a.smooth').on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;
            // Wir selectieren was wir animieren wollen: den HTML und Body Tag,   lang(animation dauert 1100ms)
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 1100, function () {
                window.location.hash = hash;
            });
        }
    });
});



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

// Start Jahresanzeige im Footer
$(document).ready(function () {
    const currentYear = new Date().getFullYear();
    $('#year').text(currentYear);
});

// Ende Jahresanzeige im Footer 
