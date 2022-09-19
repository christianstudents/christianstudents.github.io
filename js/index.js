void (function() {
    const now = new Date();
    const dailyBreadDate = `${now.getMonth() + 1}/${now.getDate().toString().padStart(2, '0')}`;
    for (const date of document.getElementsByClassName('daily-bread__date')) {
        date.textContent = dailyBreadDate;
    }

    // TODO :Fetch Daily Bread from API.
})();