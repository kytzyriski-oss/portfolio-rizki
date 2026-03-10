# 🚀 Portfolio Muhammad Rizki Kurniawan

## ⚡ DEPLOY IN 5 STEPS (Netlify Drop — FREE FOREVER)

1. **Download** this folder as ZIP or prepare the folder
2. **Edit** `data.json` (nama, bio, projects, skills, dll)
3. **Go to** https://app.netlify.com/drop
4. **Drag & drop** the folder `portfolio-rizki/`
5. **LIVE!** 🎉 Your portfolio is now online

---

## 🔧 CONFIGURATION

### Edit Personal Info
Open `data.json` and update:
- `profile.name` — Your full name
- `profile.bio` — Your bio text
- `profile.email` — Contact email
- `profile.socials` — GitHub, LinkedIn, Instagram URLs
- `projects[]` — Add/edit/remove projects
- `certificates[]` — Add/edit certificates
- `experiences[]` — Add/edit work experience
- `skills[]` — Add/edit skill cards

### EmailJS Setup (Contact Form)
1. Create free account at https://emailjs.com
2. Create an email service (Gmail works)
3. Create an email template
4. In `script.js`, update these lines:
   ```js
   EMAILJS_SERVICE_ID: 'service_xxxxxxx',
   EMAILJS_TEMPLATE_ID: 'template_xxxxxxx',
   EMAILJS_PUBLIC_KEY: 'your_public_key',
   ```

### Admin CMS
- URL: `https://yoursite.netlify.app/admin.html`
- Default password: `rizki2026`
- To change password: Edit `ADMIN_PASSWORD_HASH` in `admin.html`
  ```js
  const ADMIN_PASSWORD_HASH = btoa('YOUR_NEW_PASSWORD');
  ```

---

## 📁 FILE STRUCTURE

```
portfolio-rizki/
├── index.html      ← Main portfolio site
├── admin.html      ← CMS admin panel
├── style.css       ← All styles + dark/light mode
├── script.js       ← Animations + data rendering
├── data.json       ← ✏️ EDIT THIS for all content
├── sitemap.xml     ← SEO sitemap
├── robots.txt      ← SEO robots
├── netlify.toml    ← Netlify config
└── assets/
    ├── images/     ← Put your images here
    └── icons/      ← Custom icons
```

---

## 🎨 CUSTOMIZATION

### Change Colors
In `style.css`, find `:root {` and edit:
- `--accent` — Main accent color (default: cyan #00d4ff)
- `--accent2` — Secondary accent (default: purple #a855f7)
- `--accent3` — Third accent (default: orange #ff6b35)

### Change Typewriter Text
In `script.js`, edit `TYPEWRITER_STRINGS` array:
```js
TYPEWRITER_STRINGS: [
  'Your Title 1',
  'Your Title 2',
  ...
]
```

---

## 🔄 UPDATE CONTENT

**Option A — Edit data.json directly:**
1. Edit `data.json` on your computer
2. Go to Netlify → Deploys → Drag new folder

**Option B — Use Admin CMS:**
1. Visit `/admin.html`
2. Login with password
3. Edit content visually
4. Click "Export JSON" to download updated `data.json`
5. Replace local file + re-deploy

---

## ✅ FEATURES

- ✅ Particles background (canvas)
- ✅ Typewriter hero animation
- ✅ GSAP scroll-triggered reveal animations
- ✅ Anime.js hover effects + ripple buttons
- ✅ Dark / Light mode (localStorage persist)
- ✅ Portfolio filter + search (client-side)
- ✅ Project cards with hover expand
- ✅ Admin CMS (password protected)
- ✅ Drag-drop image upload in admin
- ✅ JSON export from admin
- ✅ Contact form (EmailJS or demo mode)
- ✅ XSS protection (sanitized output)
- ✅ Responsive mobile-first
- ✅ SEO meta tags + structured data
- ✅ Lazy loading images
- ✅ Error handling + toast notifications
- ✅ CSP security headers

---

## 📞 SUPPORT

Password for admin: `rizki2026`
Edit data: `data.json`
Animations config: `script.js` → `CONFIG` object
Colors: `style.css` → `:root { ... }`
