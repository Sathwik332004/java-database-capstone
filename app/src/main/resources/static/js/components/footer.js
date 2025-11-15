
// footer.js
function renderFooter() {
    const footer = document.getElementById("footer");
    footer.innerHTML = `
                        <footer class="footer">
  <div class="footer-container">
    <div class="footer-logo">
      <img src="../assets/images/logo/logo.png" alt="HealTrack Logo">
      <p>© Copyright 2025. All Rights Reserved by HealTrack.</p>
    </div>
    <div class="footer-links">
      <div class="footer-column">
        <h4>Company</h4>
        <a href="#">About</a>
        <a href="#">Careers</a>
        <a href="#">Press</a>
      </div>
      <div class="footer-column">
        <h4>Support</h4>
        <a href="#">Account</a>
        <a href="#">Help Center</a>
        <a href="#">Contact Us</a>
      </div>
      <div class="footer-column">
        <h4>Legals</h4>
        <a href="#">Terms & Conditions</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Licensing</a>
      </div>
    </div>
  </div>
</footer>
`;
  }
renderFooter()
