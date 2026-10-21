// Get current page filename
const currentPage = window.location.pathname.split('/').pop();

// Default to 'index' if empty (in case of root domain)
const pageName = currentPage === '' ? 'index' : currentPage.replace('.html', '');

// Find the corresponding nav link and add 'active' class
document.querySelectorAll('nav a').forEach(link => {
  // Check if the link's href contains the page name
  if (link.getAttribute('href').includes(pageName)) {
    link.classList.add('active');
  }
});