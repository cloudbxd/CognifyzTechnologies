document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            fetch(link.href)
                .then(response => response.text())
                .then(html => {
                    document.body.innerHTML = html;
                    window.history.pushState({}, '', link.href);
                });
        });
    });

    window.addEventListener('popstate', function() {
        fetch(location.href)
            .then(response => response.text())
            .then(html => {
                document.body.innerHTML = html;
            });
    });
});
