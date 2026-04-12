# PinGuru Frontend 🎨

Landing pages, authentication forms, and dashboard UI for PinGuru Instagram DM Automation

---

## 📁 Project Structure

```
pinguru-landing/
├── index.html            # Marketing landing page (redesigned with animations)
├── login.html            # User login page (Google OAuth + email/password)
├── register.html         # User registration (password strength validator)
├── dashboard.html        # User dashboard (automation rules + stats)
├── rules.html            # Automation rules management
├── admin.html            # Secure admin login panel
├── connect.html          # Instagram connection flow
├── privacy.html          # Privacy policy
├── terms.html            # Terms of service
├── css/
│   ├── base.css          # Typography, colors, utilities, animations
│   ├── auth.css          # Login/register/admin styles
│   ├── landing.css       # Landing page styles (asymmetric layout)
│   ├── dashboard.css     # Dashboard page styles
│   └── rules.css         # Rules page styles
├── js/
│   ├── utils.js          # Security: XSS prevention, DevTools blocking
│   ├── api.js            # API client with secure cookie handling
│   ├── auth.js           # Login/register form handlers
│   ├── security.js       # Brute force protection tracking
│   ├── oauth.js          # Google OAuth 2.0 callback handler
│   ├── password-validator.js   # Password strength validation UI
│   ├── landing.js        # Landing page interactions
│   ├── dashboard.js      # Dashboard data loading (safe DOM API)
│   └── rules.js          # Rules CRUD operations (safe DOM API)
├── .env.example          # Environment variables template
├── .gitignore            # Git exclusions
└── README.md             # This file
```

---

## 🚀 Latest Features (April 2026)

### Security Hardening ✅

- **XSS Prevention**: All user-rendered data uses safe DOM API (textContent, createElement)
- **DevTools Blocking**: Comprehensive F12, Ctrl+I, Ctrl+J, Ctrl+C blocking with console restrictions
- **Password Validation**: Frontend enforces 12+ characters with uppercase, lowercase, numbers, special chars
- **HttpOnly Cookies**: JWT tokens stored in secure httpOnly cookies (JavaScript cannot access)

### Authentication ✅

- **Email/Password**: With real-time password strength indicator (weak→strong)
- **Google Sign-In**: Full OAuth 2.0 integration with automatic user creation
- **Admin Panel**: Secure login at `/admin.html` with 30-second lockout UI

### UI/UX Improvements ✅

- **Asymmetric Layout**: Professional SaaS appearance (left-aligned hero, flex-start alignment)
- **Modern Typography**: Syne (bold headers) + Inter (readable body)
- **Animations**: 6 CSS keyframes with staggered timing (slideInUp, fadeIn, popIn, rotate, blink)
- **Responsive Design**: Mobile (425px—centers content), Tablet (768px—hamburger menu), Desktop (full layout)
- **Real-World Polish**: Genuine copy, no fake reviews, no placeholder data

### Data Quality ✅

- Removed all fake testimonials and "87 creators" placeholder
- Removed MVP badge, replaced with "Live Since April 2026"
- Footer: "© 2026 PinGuru. Built by AJ. All rights reserved."

---

## 🔧 Local Development

### Setup

```bash
# No build step needed—vanilla HTML/CSS/JavaScript
# Just open in browser or use a local server:

# Option 1: Python (built-in)
python -m http.server 8000

# Option 2: Node.js (if installed)
npx http-server

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

### Environment Variables

Copy `.env.example` to `.env.local` and update:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## 🔐 Security Checklist

- ✅ No localStorage tokens (httpOnly cookies instead)
- ✅ No innerHTML injection (safe DOM API, textContent only)
- ✅ DevTools completely blocked
- ✅ Password strength enforced (frontend + backend)
- ✅ CSP headers configured
- ✅ HTTPS-only cookies in production
- ✅ CSRF protection via SameSite="strict"

---

## 📦 Dependencies

**Frontend**: Vanilla JavaScript (zero frameworks)

- Google Sign-In SDK (async loaded from accounts.google.com)
- Fonts: Google Fonts (Syne, Inter)
- No bundler required

**Backend Requirement**:

- Backend API at `https://api.pinguru.me` (or configured URL)
- Must support `/auth/register`, `/auth/login`, `/auth/google/callback`

---

## 🚀 Deployment

### Production Checklist

1. Replace all `YOUR_GOOGLE_CLIENT_ID` placeholders in HTML with real Google Client ID
2. Update `VITE_API_URL` in environment to production API endpoint
3. Ensure backend returns httpOnly cookies (not JSON tokens)
4. Enable HTTPS (required for secure cookies)
5. Configure CSP headers on server
6. Test all authentication flows in production environment

### Hosting Options

- Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront
- Any static hosting (no Node.js server needed)

---

## 🐛 Troubleshooting

**Google Sign-In not working**

- Verify CLIENT*ID is correct (no `YOUR*` placeholder)
- Ensure Google Cloud Console has this domain authorized
- Check browser console for errors

**Password validation not showing**

- Ensure `js/password-validator.js` is loaded
- Check if password input has `oninput="renderPasswordRules(...)"` handler

**DevTools blocking too aggressive**

- Some debugging tools deliberately bypass blocking—this is expected
- Casual inspection attempts are blocked

---

## 📝 Documentation Files

- `SECURITY_AUDIT.md` — Detailed security findings and fixes
- `BACKEND_FIXES.md` — Backend Python implementation guide
- `PRODUCTION_READY.md` — Comprehensive launch checklist

---

## 📞 Support

For issues or improvements, contact AJ at the project repository.

**Last Updated**: April 11, 2026 ✨
