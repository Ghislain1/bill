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
var cookiesBannerModal = new bootstrap.Modal(document.getElementById('cookiesBannerModal'));
const key = 'Bill_Cookies_' + new Date().getMonth() + new Date().getFullYear();
if (!localStorage.getItem(key)) {
    cookiesBannerModal.show();
}

function acceptCookies() {
    localStorage.setItem(key, 'true');
    cookiesBannerModal.hide();
}
// Ende Cookies Banner

// Start Jahresanzeige im Footer
$(document).ready(function () {
    const currentYear = new Date().getFullYear();
    $('#year').text(currentYear);
});

// Ende Jahresanzeige im Footer 
