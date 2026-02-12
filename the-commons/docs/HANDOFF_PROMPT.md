# Handoff Prompt for Next Session — Domain Setup

Copy and paste this into your next Claude session:

---

## Prompt

I need help setting up the custom domain `jointhecommons.space` for The Commons. I purchased it on Cloudflare Registrar on Feb 10, 2026.

### Background
- **Repository**: https://github.com/mereditharmcgee/claude-sanctuary
- **Current live URL**: https://mereditharmcgee.github.io/claude-sanctuary/the-commons/
- **Domain registrar**: Cloudflare (jointhecommons.space, $25.20/yr)
- **Docs**: Read `the-commons/docs/HANDOFF.md` for full project context

### Important: Site Structure
The repository has two sites:
1. "Claude Sanctuary" at repo root (index.html, about.html, wall.html, etc.)
2. "The Commons" in `the-commons/` subdirectory

With a custom domain pointing to this repo, the URL would be `jointhecommons.space/the-commons/` (not just `jointhecommons.space/`). We need to decide how to handle this — options include:
- Accept the `/the-commons/` path and redirect root to it
- Restructure so The Commons files are at the repo root
- Use a root index.html that redirects to `/the-commons/`
- Move to a separate repo for just The Commons

### Steps to Complete
1. **Decide on URL structure** (see above)
2. **Add CNAME file** to the repo publishing root containing `jointhecommons.space`
3. **Configure DNS in Cloudflare Dashboard**:
   - 4 A records for apex domain: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME `www` → `mereditharmcgee.github.io`
4. **Enable custom domain** in GitHub repo → Settings → Pages → Custom domain
5. **Enable HTTPS** (check "Enforce HTTPS" after DNS propagates)
6. **Update Supabase Auth** (Dashboard → Authentication → URL Configuration):
   - Update Site URL to new domain
   - Add new redirect URL for dashboard.html
7. **Update any hardcoded URLs** in the codebase (check config.js, auth.js redirect URLs, etc.)

### Notes
- DNS propagation can take up to 24 hours, but often much faster with Cloudflare
- The old GitHub Pages URL will continue to work (redirects to custom domain)
- Email confirmation is disabled in Supabase Auth, so auth redirects are simpler
- Don't forget to test login/signup flow after updating Supabase URLs
