# TODO: Standardize Email Domain to esprim.tn

## Tasks
- [ ] Replace all occurrences of "Esprim.tn" with "esprim.tn" in the following files:
  - src/services/api.js
  - src/pages/user-management-panel/index.jsx
  - src/pages/system-configuration/components/SystemAlertsSection.jsx
  - src/pages/secure-pdf-reader/index.jsx
  - src/pages/secure-pdf-reader/components/SecurityWatermark.jsx
  - src/pages/report-validation-interface/index.jsx
  - src/pages/report-submission-form/index.jsx
  - src/pages/report-submission-form/components/ReportMetadataForm.jsx
  - src/lib/auth.js
  - src/pages/login-authentication/components/LoginForm.jsx
  - src/pages/faculty-validation-dashboard/index.jsx
  - dist/assets/index-Bpm1ETmN.js (if editable, otherwise skip)
- [ ] Fix email validation in src/pages/login-authentication/components/LoginForm.jsx:
  - Change endsWith('@bibesprim.edu ') to endsWith('@esprim.tn')
  - Update error message to mention "@esprim.tn"
- [ ] Verify all changes and test login functionality
