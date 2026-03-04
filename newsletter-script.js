// Mailchimp Form Redirect Handler
(function() {
  'use strict';
  
  // Configuration
  const REDIRECT_URL = 'thank-you.html';
  const REDIRECT_DELAY = 1500; // milliseconds
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mc-embedded-subscribe-form');
    
    if (!form) {
      console.error('Mailchimp form not found');
      return;
    }
    
    console.log('Mailchimp form handler initialized');
    
    // Intercept form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submission intercepted');
      
      // Validate form
      if (!form.checkValidity()) {
        console.log('Form validation failed');
        form.reportValidity();
        return false;
      }
      
      // Get form data
      const formData = new FormData(form);
      const actionUrl = form.getAttribute('action');
      
      console.log('Submitting to Mailchimp...');
      
      // Submit to Mailchimp using JSONP to avoid CORS issues
      const email = formData.get('EMAIL');
      const fullName = formData.get('FULL_NAME');
      const org = formData.get('ORG');
      const ctaType = formData.get('CTA_TYPE');
      const extraInfo = formData.get('EXTRA_INFO');
      const gdpr = formData.get('gdpr[103798]');
      
      // Build JSONP URL
      const jsonpUrl = actionUrl.replace('/post?', '/post-json?') + 
        '&EMAIL=' + encodeURIComponent(email) +
        '&FULL_NAME=' + encodeURIComponent(fullName) +
        '&ORG=' + encodeURIComponent(org) +
        '&CTA_TYPE=' + encodeURIComponent(ctaType) +
        (extraInfo ? '&EXTRA_INFO=' + encodeURIComponent(extraInfo) : '') +
        (gdpr ? '&gdpr[103798]=' + encodeURIComponent(gdpr) : '') +
        '&c=?';
      
      // Create script tag for JSONP
      const script = document.createElement('script');
      script.src = jsonpUrl;
      
      // Define callback
      window.mailchimpCallback = function(data) {
        console.log('Mailchimp response:', data);
        
        if (data.result === 'success') {
          console.log('Subscription successful! Redirecting...');
          
          // Show success message briefly
          const successDiv = document.getElementById('mce-success-response');
          if (successDiv) {
            successDiv.style.display = 'block';
            successDiv.textContent = 'Thank you! Redirecting...';
          }
          
          // Redirect after delay
          setTimeout(function() {
            window.location.href = REDIRECT_URL;
          }, REDIRECT_DELAY);
          
        } else {
          // Show error message
          console.error('Mailchimp error:', data.msg);
          const errorDiv = document.getElementById('mce-error-response');
          if (errorDiv) {
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = data.msg;
          }
        }
        
        // Clean up
        document.body.removeChild(script);
      };
      
      // Add script to page
      document.body.appendChild(script);
      
      return false;
    });
  });
})();
