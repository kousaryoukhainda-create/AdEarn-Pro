# Public Deployment Requirements for AdEarn Pro

This document outlines all requirements needed to make AdEarn Pro a fully public, production-ready web application.

---

## 🔴 CRITICAL: Immediate Security Issues

### 1. Exposed Firebase API Key
**Current State:** API key is hardcoded in `firebase-applet-config.json`
```json
{
  "apiKey": "AIzaSyDZADP5Flcgjl-0GM5nTcnKOzHxUAkY0ZM"
}
```

**Required Actions:**
- [ ] **Rotate the exposed API key immediately** in Firebase Console
- [ ] Implement API key restrictions (HTTP referrers)
- [ ] Use environment variables for sensitive config
- [ ] Consider using Firebase App Check

**How to Fix:**
```bash
# 1. Go to Firebase Console > Project Settings > General
# 2. Regenerate API key
# 3. Add HTTP referrer restrictions:
#    - Your production domain only
#    - localhost for development
# 4. Update firebase-applet-config.json (do not commit to git)
```

### 2. Hardcoded Admin Email
**Current State:** Admin email hardcoded in multiple files
- `firestore.rules`
- `src/App.tsx`
- `functions/src/index.ts`

**Required Actions:**
- [ ] Move admin configuration to Firestore settings collection
- [ ] Use custom claims for admin role verification
- [ ] Remove hardcoded email checks

---

## 1. Infrastructure Requirements

### 1.1 Domain & SSL
| Item | Status | Priority |
|------|--------|----------|
| Custom domain | ❌ Missing | 🔴 Critical |
| SSL Certificate | ❌ Missing | 🔴 Critical |
| DNS Configuration | ❌ Missing | 🔴 Critical |

**Actions:**
```bash
# Purchase domain (Namecheap, GoDaddy, etc.)
# Configure DNS records:
#   A record: @ -> <hosting IP>
#   CNAME: www -> <hosting domain>

# SSL Options:
#   - Let's Encrypt (free, auto-renewal)
#   - Cloudflare (free SSL + CDN)
#   - Firebase Hosting (includes SSL)
```

### 1.2 Hosting
| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Firebase Hosting** | Easy setup, SSL included, CDN | Limited customization | Free/$10/mo |
| **Vercel** | Fast, auto-deploy from Git | Less control | Free/$20/mo |
| **Cloud Run** | Full control, scalable | More setup | Pay-per-use |
| **VPS (DigitalOcean)** | Full control, cheap | Manual management | $5-20/mo |

**Recommended:** Firebase Hosting + Cloud Functions

### 1.3 Database (Firestore)
| Item | Status | Priority |
|------|--------|----------|
| Production Database | ⚠️ Using AI Studio DB | 🔴 Critical |
| Backup Strategy | ❌ Missing | 🟡 High |
| Index Configuration | ❌ Missing | 🟡 High |
| Data Migration Plan | ❌ Missing | 🟡 High |

**Actions:**
```bash
# 1. Create new production Firestore database
# 2. Configure indexes (firestore.indexes.json)
# 3. Set up automated exports to GCS
# 4. Configure point-in-time recovery

# firestore.indexes.json example:
{
  "indexes": [
    {
      "collectionGroup": "withdrawals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "adViews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "adId", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### 1.4 Environment Variables
**Required Environment Variables:**

```bash
# .env (root - for server.ts)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
NODE_ENV=production

# functions/.env (for Cloud Functions)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=
```

---

## 2. Security Hardening

### 2.1 Authentication Security
| Item | Status | Priority |
|------|--------|----------|
| Firebase App Check | ❌ Missing | 🔴 Critical |
| Rate Limiting (Auth) | ❌ Missing | 🟡 High |
| Session Management | ⚠️ Default | 🟡 High |
| 2FA for Admin | ❌ Missing | 🟡 High |

**Actions:**
```javascript
// src/firebase.ts - Add App Check
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true,
});
```

### 2.2 API Security
| Item | Status | Priority |
|------|--------|----------|
| CORS Configuration | ❌ Missing | 🔴 Critical |
| Rate Limiting | ⚠️ Partial (email only) | 🟡 High |
| Input Sanitization | ⚠️ Partial | 🟡 High |
| CSRF Protection | ❌ Missing | 🟡 High |

**Actions:**
```typescript
// server.ts - Add CORS and rate limiting
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// CORS
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true,
}));

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP',
});
app.use('/api/', limiter);
```

### 2.3 Content Security
| Item | Status | Priority |
|------|--------|----------|
| CSP Headers | ❌ Missing | 🟡 High |
| XSS Protection | ⚠️ Partial | 🟡 High |
| Helmet.js | ❌ Missing | 🟡 High |

**Actions:**
```typescript
// server.ts - Add security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://firestore.googleapis.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com"],
    },
  },
}));
```

### 2.4 Admin Security
| Item | Status | Priority |
|------|--------|----------|
| Custom Claims | ❌ Missing | 🔴 Critical |
| Admin 2FA | ❌ Missing | 🟡 High |
| IP Whitelisting | ❌ Missing | 🟢 Medium |
| Audit Logging | ❌ Missing | 🟡 High |

**Actions:**
```typescript
// functions/src/index.ts - Use custom claims
export const processWithdrawal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }
  
  // Check custom claim instead of hardcoded email
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Admin access required'
    );
  }
  
  // ... rest of function
});

// Set custom claim (run once via admin script)
// admin.auth().setCustomUserClaims(uid, { admin: true });
```

---

## 3. Compliance & Legal

### 3.1 Required Legal Pages
| Page | Status | Priority |
|------|--------|----------|
| Privacy Policy | ❌ Missing | 🔴 Critical |
| Terms of Service | ❌ Missing | 🔴 Critical |
| Cookie Policy | ❌ Missing | 🟡 High |
| Refund Policy | ❌ Missing | 🟡 High |
| GDPR Compliance | ❌ Missing | 🟡 High (EU) |

**Actions:**
```bash
# Create pages:
src/components/PrivacyPolicy.tsx
src/components/TermsOfService.tsx
src/components/CookiePolicy.tsx

# Add to App.tsx routes:
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsOfService />} />
```

### 3.2 Data Protection
| Item | Status | Priority |
|------|--------|----------|
| Data Export Feature | ❌ Missing | 🟡 High |
| Data Deletion Feature | ❌ Missing | 🟡 High |
| Consent Management | ❌ Missing | 🟡 High |
| Age Verification | ❌ Missing | 🟡 High |

### 3.3 Financial Compliance (Pakistan)
| Item | Status | Priority |
|------|--------|----------|
| Payment Provider License | ❌ Unknown | 🔴 Critical |
| Tax Registration | ❌ Unknown | 🔴 Critical |
| AML Compliance | ❌ Missing | 🔴 Critical |
| Transaction Reporting | ❌ Missing | 🟡 High |

**⚠️ Legal Warning:** AdEarn Pro involves real money transactions. Consult a lawyer for:
- Payment service provider licensing
- Tax obligations (income tax, sales tax)
- Anti-money laundering (AML) compliance
- Consumer protection laws

---

## 4. Monitoring & Observability

### 4.1 Error Tracking
| Tool | Status | Priority |
|------|--------|----------|
| Sentry | ❌ Missing | 🟡 High |
| Crashlytics | ❌ Missing | 🟡 High |
| Error Logging | ⚠️ Console only | 🟡 High |

**Actions:**
```bash
# Install Sentry
npm install @sentry/react @sentry/integrations

// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### 4.2 Analytics
| Tool | Status | Priority |
|------|--------|----------|
| Google Analytics 4 | ❌ Missing | 🟢 Medium |
| Firebase Analytics | ❌ Missing | 🟢 Medium |
| Custom Events | ❌ Missing | 🟢 Medium |

### 4.3 Performance Monitoring
| Tool | Status | Priority |
|------|--------|----------|
| Lighthouse CI | ❌ Missing | 🟢 Medium |
| Web Vitals | ❌ Missing | 🟢 Medium |
| Uptime Monitoring | ❌ Missing | 🟡 High |

**Actions:**
```bash
# Install web-vitals
npm install web-vitals

// src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 4.4 Logging
| Item | Status | Priority |
|------|--------|----------|
| Centralized Logging | ❌ Missing | 🟡 High |
| Log Aggregation | ❌ Missing | 🟢 Medium |
| Alert Rules | ❌ Missing | 🟡 High |

---

## 5. Performance & Scalability

### 5.1 Frontend Optimization
| Item | Status | Priority |
|------|--------|----------|
| Code Splitting | ❌ Missing | 🟡 High |
| Lazy Loading | ❌ Missing | 🟡 High |
| Image Optimization | ❌ Missing | 🟢 Medium |
| Caching Strategy | ❌ Missing | 🟡 High |

**Actions:**
```typescript
// src/App.tsx - Lazy load routes
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Ads = lazy(() => import('./components/Ads'));
const Withdraw = lazy(() => import('./components/Withdraw'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

### 5.2 Backend Optimization
| Item | Status | Priority |
|------|--------|----------|
| CDN | ❌ Missing | 🟡 High |
| Database Indexes | ❌ Missing | 🔴 Critical |
| Query Optimization | ❌ Missing | 🟡 High |
| Connection Pooling | ⚠️ Default | 🟢 Medium |

### 5.3 Scalability
| Item | Status | Priority |
|------|--------|----------|
| Load Testing | ❌ Missing | 🟡 High |
| Auto-scaling | ⚠️ Firebase default | 🟢 Medium |
| Database Sharding | ❌ N/A | 🟢 Low |
| Cache Layer | ❌ Missing | 🟢 Medium |

---

## 6. Testing Requirements

### 6.1 Test Coverage
| Test Type | Status | Priority |
|-----------|--------|----------|
| Unit Tests | ❌ Missing | 🟡 High |
| Integration Tests | ❌ Missing | 🟡 High |
| E2E Tests | ❌ Missing | 🟡 High |
| Load Tests | ❌ Missing | 🟢 Medium |

**Actions:**
```bash
# Install testing tools
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test  # E2E

# Example test: src/components/__tests__/Withdraw.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Withdraw Component', () => {
  it('should validate minimum withdrawal amount', () => {
    // Test implementation
  });
});
```

---

## 7. DevOps & CI/CD

### 7.1 Version Control
| Item | Status | Priority |
|------|--------|----------|
| Git Repository | ✅ Exists | - |
| Branch Protection | ❌ Missing | 🟡 High |
| Code Review Process | ❌ Missing | 🟡 High |

### 7.2 CI/CD Pipeline
| Item | Status | Priority |
|------|--------|----------|
| GitHub Actions | ❌ Missing | 🟡 High |
| Automated Testing | ❌ Missing | 🟡 High |
| Automated Deploy | ❌ Missing | 🟢 Medium |

**Actions:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci && cd functions && npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

### 7.3 Secrets Management
| Item | Status | Priority |
|------|--------|----------|
| GitHub Secrets | ❌ Missing | 🔴 Critical |
| Firebase Secrets | ❌ Missing | 🔴 Critical |
| Environment Separation | ❌ Missing | 🟡 High |

---

## 8. User Experience

### 8.1 Accessibility
| Item | Status | Priority |
|------|--------|----------|
| WCAG 2.1 AA | ❌ Unknown | 🟡 High |
| Keyboard Navigation | ⚠️ Partial | 🟡 High |
| Screen Reader Support | ❌ Unknown | 🟡 High |

**Actions:**
```bash
# Install accessibility testing
npm install -D axe-core @axe-core/react

// src/main.tsx
import Axe from '@axe-core/react';
Axe(React, ReactDOM, 1000);
```

### 8.2 Mobile Optimization
| Item | Status | Priority |
|------|--------|----------|
| Responsive Design | ✅ Exists | - |
| PWA Support | ❌ Missing | 🟢 Medium |
| Touch Optimization | ⚠️ Partial | 🟢 Medium |

---

## 9. Business Operations

### 9.1 Customer Support
| Item | Status | Priority |
|------|--------|----------|
| Contact Form | ❌ Missing | 🟡 High |
| FAQ Page | ❌ Missing | 🟢 Medium |
| Support Email | ⚠️ Hardcoded | 🟡 High |
| Live Chat | ❌ Missing | 🟢 Low |

### 9.2 Fraud Prevention
| Item | Status | Priority |
|------|--------|----------|
| Bot Detection | ❌ Missing | 🔴 Critical |
| VPN Detection | ❌ Missing | 🟡 High |
| Transaction Limits | ⚠️ Partial | 🟡 High |
| Suspicious Activity Alerts | ❌ Missing | 🟡 High |

### 9.3 Financial Operations
| Item | Status | Priority |
|------|--------|----------|
| Payment Reconciliation | ❌ Missing | 🔴 Critical |
| Dispute Handling | ❌ Missing | 🟡 High |
| Refund Process | ⚠️ Partial | 🟡 High |
| Financial Reporting | ❌ Missing | 🟡 High |

---

## 10. Pre-Launch Checklist

### Critical (Must Complete Before Launch)
- [ ] Rotate exposed Firebase API key
- [ ] Set up custom domain with SSL
- [ ] Configure Firestore production database
- [ ] Implement Firebase App Check
- [ ] Add Privacy Policy and Terms of Service
- [ ] Set up admin custom claims (remove hardcoded email)
- [ ] Configure CORS and security headers
- [ ] Set up error tracking (Sentry)
- [ ] Configure production environment variables
- [ ] Test all Cloud Functions in production
- [ ] Set up automated Firestore backups
- [ ] Configure rate limiting on all endpoints
- [ ] Legal consultation for financial compliance

### High Priority (Complete Within First Week)
- [ ] Add monitoring and alerting
- [ ] Implement audit logging
- [ ] Set up CI/CD pipeline
- [ ] Add unit and integration tests
- [ ] Configure CDN
- [ ] Add data export/deletion features
- [ ] Implement fraud detection basics
- [ ] Set up customer support channel

### Medium Priority (First Month)
- [ ] Add analytics
- [ ] Implement code splitting
- [ ] Add PWA support
- [ ] Set up uptime monitoring
- [ ] Create admin dashboard analytics
- [ ] Add accessibility improvements
- [ ] Load testing

---

## Estimated Costs (Monthly)

| Service | Free Tier | Paid (Estimated) |
|---------|-----------|------------------|
| Firebase Hosting | 10GB/mo | $10-50 |
| Cloud Functions | 2M invocations | $10-100 |
| Firestore | 1GB storage, 50K reads/day | $20-200 |
| Domain | - | $10-20/year |
| SMTP (SendGrid) | 100 emails/day | $15-50 |
| Sentry | 5K errors/mo | $25-100 |
| **Total** | **$0** | **$80-520/mo** |

---

## Timeline Estimate

| Phase | Duration | Focus |
|-------|----------|-------|
| **Phase 1: Security** | 1-2 weeks | Critical security fixes |
| **Phase 2: Infrastructure** | 1 week | Hosting, domain, database |
| **Phase 3: Compliance** | 1-2 weeks | Legal pages, data protection |
| **Phase 4: Monitoring** | 1 week | Error tracking, logging |
| **Phase 5: Testing** | 1-2 weeks | Unit, integration, E2E tests |
| **Phase 6: Soft Launch** | 1 week | Beta testing with limited users |
| **Phase 7: Public Launch** | - | Full public availability |

**Total Estimated Time: 6-10 weeks**

---

## Next Immediate Actions

1. **Today:**
   ```bash
   # Rotate Firebase API key
   # Go to Firebase Console > Project Settings > API Keys
   ```

2. **This Week:**
   - [ ] Purchase domain
   - [ ] Set up Firebase Hosting
   - [ ] Create production Firestore database
   - [ ] Implement custom claims for admin

3. **Next Week:**
   - [ ] Draft Privacy Policy and Terms
   - [ ] Set up Sentry for error tracking
   - [ ] Configure CI/CD pipeline

---

## Contact & Resources

- Firebase Documentation: https://firebase.google.com/docs
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security
- Firebase App Check: https://firebase.google.com/docs/app-check
- Legal Templates: https://www.termly.io, https://www.privacypolicygenerator.info
