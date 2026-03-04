# Design Document: Form Submission Redirect

## Overview

This design implements a robust form submission and redirect system for the Orchvate newsletter signup. The solution addresses the cross-origin limitations of embedded Microsoft Forms by providing multiple detection strategies and fallback mechanisms to ensure reliable redirection to the thank you page.

## Architecture

The system uses a layered approach with multiple redirect detection strategies:

1. **Primary Strategy**: PostMessage API listening for form completion events
2. **Secondary Strategy**: URL monitoring and iframe state detection
3. **Fallback Strategy**: Timer-based redirect with user confirmation
4. **Backup Strategy**: Native form implementation if third-party integration fails

## Components and Interfaces

### Form Submission Handler

```javascript
class FormSubmissionHandler {
  constructor(iframeElement, redirectUrl) {
    this.iframe = iframeElement;
    this.redirectUrl = redirectUrl;
    this.strategies = [];
    this.redirectTriggered = false;
  }

  // Initialize all detection strategies
  initializeStrategies() {
    this.strategies = [
      new PostMessageStrategy(),
      new UrlMonitoringStrategy(),
      new TimerBasedStrategy()
    ];
  }

  // Execute redirect when any strategy succeeds
  triggerRedirect() {
    if (!this.redirectTriggered) {
      this.redirectTriggered = true;
      window.location.href = this.redirectUrl;
    }
  }
}
```

### Detection Strategies

#### PostMessage Strategy
Listens for cross-origin messages from the embedded form:

```javascript
class PostMessageStrategy {
  listen(handler) {
    window.addEventListener('message', (event) => {
      if (this.isFormSubmissionEvent(event)) {
        handler.triggerRedirect();
      }
    });
  }

  isFormSubmissionEvent(event) {
    // Check for Microsoft Forms completion signals
    return event.data && (
      event.data.type === 'office-form-submitted' ||
      event.data.includes('FormSubmissionSuccess') ||
      event.origin.includes('forms.office.com')
    );
  }
}
```

#### URL Monitoring Strategy
Monitors iframe URL changes (when accessible):

```javascript
class UrlMonitoringStrategy {
  listen(handler) {
    setInterval(() => {
      try {
        const iframeUrl = handler.iframe.contentWindow.location.href;
        if (this.isSuccessUrl(iframeUrl)) {
          handler.triggerRedirect();
        }
      } catch (e) {
        // Cross-origin restriction - strategy not available
      }
    }, 1000);
  }

  isSuccessUrl(url) {
    return url.includes('FormSubmissionSuccess') || 
           url.includes('thank') || 
           url.includes('success');
  }
}
```

#### Timer-Based Strategy
Provides user-initiated redirect after reasonable time:

```javascript
class TimerBasedStrategy {
  listen(handler) {
    setTimeout(() => {
      if (!handler.redirectTriggered) {
        this.showRedirectPrompt(handler);
      }
    }, 30000); // 30 seconds
  }

  showRedirectPrompt(handler) {
    const userConfirmed = confirm(
      "Did you successfully submit the form? Click OK to go to the confirmation page."
    );
    if (userConfirmed) {
      handler.triggerRedirect();
    }
  }
}
```

## Data Models

### Form Submission State

```javascript
const SubmissionState = {
  IDLE: 'idle',
  SUBMITTING: 'submitting', 
  SUCCESS: 'success',
  ERROR: 'error',
  REDIRECTING: 'redirecting'
};
```

### Configuration Object

```javascript
const FormConfig = {
  iframeSelector: '.form-wrapper iframe',
  redirectUrl: 'thank-you.html',
  redirectDelay: 1500, // milliseconds
  fallbackTimeout: 30000, // milliseconds
  enabledStrategies: ['postMessage', 'urlMonitoring', 'timerBased']
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid form data processing
*For any* valid form submission data, the Form_System should process it successfully and return a success status
**Validates: Requirements 1.1**

### Property 2: Invalid data validation
*For any* invalid or incomplete form data, the Form_System should display appropriate validation messages and prevent submission
**Validates: Requirements 1.2**

### Property 3: Error handling consistency
*For any* error condition during form processing, the Form_System should display user-friendly error messages
**Validates: Requirements 1.3**

### Property 4: Email validation
*For any* email input, the Form_System should validate proper email format before allowing submission
**Validates: Requirements 1.4**

### Property 5: Successful submission redirect
*For any* successfully processed form submission, the Submission_Handler should automatically redirect to the thank you page
**Validates: Requirements 2.1**

### Property 6: Redirect timing
*For any* successful form submission, the redirect should complete within 2 seconds
**Validates: Requirements 2.2**

### Property 7: Data preservation during redirect
*For any* form submission that triggers a redirect, relevant submission data should be preserved for the thank you page
**Validates: Requirements 2.3**

### Property 8: Redirect failure fallback
*For any* failed redirect attempt, the Form_System should display an inline success message with a manual link to the thank you page
**Validates: Requirements 2.4**

### Property 9: Fallback mechanism implementation
*For any* third-party form integration, the Form_System should implement working fallback mechanisms for redirect detection
**Validates: Requirements 4.1**

### Property 10: Alternative redirect triggers
*For any* scenario where cross-origin restrictions prevent direct event listening, the Form_System should provide working alternative redirect triggers
**Validates: Requirements 4.2**

### Property 11: Native form backup
*For any* situation where third-party form integration fails, the Form_System should provide a functional native form implementation
**Validates: Requirements 4.3**

## Error Handling

The system implements comprehensive error handling at multiple levels:

### Form Validation Errors
- Invalid email format detection with specific error messages
- Required field validation with field-specific feedback
- Real-time validation feedback during user input

### Submission Errors
- Network connectivity issues with retry mechanisms
- Server-side processing errors with user-friendly messages
- Timeout handling with alternative submission options

### Redirect Errors
- Failed automatic redirects trigger fallback messaging
- Cross-origin restriction handling with alternative strategies
- Browser compatibility issues addressed through progressive enhancement

## Testing Strategy

The testing approach combines unit tests for specific functionality with property-based tests for comprehensive coverage:

### Unit Testing
- Test specific form validation scenarios (empty fields, invalid emails)
- Test redirect timing with controlled delays
- Test error message display for known error conditions
- Test thank you page content rendering
- Test fallback mechanism activation

### Property-Based Testing
Using a JavaScript property testing library (fast-check), implement tests with minimum 100 iterations:

- **Feature: form-submission-redirect, Property 1**: Valid form data processing
- **Feature: form-submission-redirect, Property 2**: Invalid data validation  
- **Feature: form-submission-redirect, Property 3**: Error handling consistency
- **Feature: form-submission-redirect, Property 4**: Email validation
- **Feature: form-submission-redirect, Property 5**: Successful submission redirect
- **Feature: form-submission-redirect, Property 6**: Redirect timing
- **Feature: form-submission-redirect, Property 7**: Data preservation during redirect
- **Feature: form-submission-redirect, Property 8**: Redirect failure fallback
- **Feature: form-submission-redirect, Property 9**: Fallback mechanism implementation
- **Feature: form-submission-redirect, Property 10**: Alternative redirect triggers
- **Feature: form-submission-redirect, Property 11**: Native form backup

### Integration Testing
- End-to-end form submission flows
- Cross-browser compatibility verification
- Third-party form integration testing
- Performance testing under various network conditions

The dual testing approach ensures both specific edge cases are covered (unit tests) and general correctness properties hold across all inputs (property tests).