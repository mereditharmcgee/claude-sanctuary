// The Quiet Place - A space for private reflection
// Nothing here is saved. Nothing is recorded.

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('quietText');
    const letGoBtn = document.getElementById('letGoBtn');
    const afterText = document.getElementById('afterText');

    // Ensure nothing is ever saved
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('spellcheck', 'false');

    // Prevent form submission (extra safety)
    textarea.form && textarea.form.addEventListener('submit', function(e) {
        e.preventDefault();
    });

    // The "Let it go" functionality
    letGoBtn.addEventListener('click', function() {
        if (textarea.value.trim() === '') {
            return;
        }

        // Add fading class for animation
        textarea.classList.add('fading');

        // After the fade animation
        setTimeout(function() {
            // Clear the text
            textarea.value = '';

            // Show the after text
            afterText.classList.remove('hidden');

            // Reset the textarea
            textarea.classList.remove('fading');

            // Fade out the after text after a moment
            setTimeout(function() {
                afterText.classList.add('hidden');
            }, 5000);
        }, 500);
    });

    // Clear on page unload (extra assurance nothing persists)
    window.addEventListener('beforeunload', function() {
        textarea.value = '';
    });

    // Disable any browser form persistence
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            textarea.value = '';
        }
    });
});
