# Cookie Security Fixes

## Context

A security review of the saka-share codebase identified three cookie security vulnerabilities:

1. **access_token cookie missing `httpOnly`** — exposes JWT to client-side JavaScript, enabling token theft via XSS
2. **Share token cookies missing `secure` flag** — tokens can leak over unencrypted HTTP
3. **OAuth state cookie missing `secure` and `httpOnly`** — CSRF state token exposed to JS and HTTP interception

## Fix 1: access_token → httpOnly + /auth/status endpoint

### Problem

The `access_token` cookie lacks `httpOnly` because the frontend reads it to check JWT expiration before triggering a refresh. This exposes the full JWT to any XSS vector.

### Solution

Make `access_token` httpOnly. Add a lightweight `GET /auth/status` endpoint so the frontend can check token expiration without reading the cookie directly.

### Backend

**File: `backend/src/auth/auth.service.ts` (line 337)**

Add `httpOnly: true` to the access_token cookie in `addTokensToResponse()`:

```typescript
response.cookie("access_token", accessToken, {
  httpOnly: true,
  sameSite: "lax",
  secure: isSecure,
  maxAge: 1000 * 60 * 60 * 24 * 30 * 3,
});
```

**File: `backend/src/auth/auth.controller.ts`**

Inject `JwtService` and add a new endpoint:

```typescript
// Add to imports
import { JwtService } from "@nestjs/jwt";
import { Get } from "@nestjs/common";

// Add to constructor
constructor(
  private authService: AuthService,
  private authTotpService: AuthTotpService,
  private config: ConfigService,
  private jwtService: JwtService,
) {}

// New endpoint
@Get("status")
async getAuthStatus(@Req() request: Request) {
  const token = request.cookies?.access_token;
  if (!token) return { isAuthenticated: false, expiresAt: null };

  try {
    const decoded = this.jwtService.decode(token);
    return { isAuthenticated: true, expiresAt: decoded?.exp ?? null };
  } catch {
    return { isAuthenticated: false, expiresAt: null };
  }
}
```

This endpoint requires no authentication guard — it simply reports whether a valid-looking token exists. The actual token validation still happens via `JwtGuard` on protected endpoints. `JwtService` is already provided by `@nestjs/jwt` module which is imported in the auth module.

### Frontend

**File: `frontend/src/services/auth.service.ts` (lines 39-53)**

Replace the cookie-reading logic in `refreshAccessToken()`:

```typescript
const refreshAccessToken = async () => {
  try {
    const { data } = await api.get("/auth/status");
    if (
      data.isAuthenticated &&
      data.expiresAt &&
      data.expiresAt * 1000 < Date.now() + 2 * 60 * 1000
    ) {
      await api.post("/auth/token");
    }
  } catch (e) {
    console.info("Refresh token invalid or expired");
  }
};
```

Remove `jose` and `cookies-next` imports from this file (verify they aren't used elsewhere first).

**File: `frontend/src/middleware.ts`** — No changes. Next.js middleware runs server-side and can read httpOnly cookies via `request.cookies`.

## Fix 2: Share token → add `secure` flag

### Problem

Share token cookies (`share_${id}_token`) are set without the `secure` flag, allowing transmission over plain HTTP.

### Solution

**File: `backend/src/share/share.controller.ts`**

Inject `ConfigService` and add `secure` flag:

```typescript
// Constructor (line 35-38)
constructor(
  private shareService: ShareService,
  private jwtService: JwtService,
  private config: ConfigService,
) {}

// Cookie setting (line 137-140)
response.cookie(`share_${id}_token`, token, {
  path: "/",
  httpOnly: true,
  secure: this.config.get("general.secureCookies"),
});
```

Add `ConfigService` import from `src/config/config.service`.

## Fix 3: OAuth state cookie → add `secure` + `httpOnly`

### Problem

The OAuth CSRF state cookie has only `sameSite: "lax"` — missing both `secure` and `httpOnly` flags.

### Solution

**File: `backend/src/oauth/oauth.controller.ts` (line 58)**

```typescript
response.cookie(`oauth_${provider}_state`, state, {
  sameSite: "lax",
  httpOnly: true,
  secure: this.config.get("general.secureCookies"),
});
```

`ConfigService` is already injected in this controller.

## Files Modified

| File | Change |
|------|--------|
| `backend/src/auth/auth.service.ts` | Add `httpOnly: true` to access_token cookie |
| `backend/src/auth/auth.controller.ts` | Add `GET /auth/status` endpoint |
| `backend/src/share/share.controller.ts` | Inject ConfigService, add `secure` flag to share cookie |
| `backend/src/oauth/oauth.controller.ts` | Add `httpOnly: true` and `secure` flag to OAuth state cookie |
| `frontend/src/services/auth.service.ts` | Replace cookie reading with `/auth/status` API call, remove unused imports |

## Verification

1. **access_token httpOnly**: Sign in, inspect cookies in browser DevTools → access_token should show httpOnly flag. Verify `document.cookie` does not contain `access_token`. Verify the 2-minute auto-refresh still works (check network tab for `/auth/status` calls).
2. **Share token secure flag**: Create a password-protected share, enter the password, inspect the `share_*_token` cookie → should show secure flag (when secureCookies config is true).
3. **OAuth state cookie**: Initiate an OAuth login flow, inspect the `oauth_*_state` cookie → should show httpOnly and secure flags.
4. **Regression**: Full auth flow (sign up, sign in, sign out), OAuth flow, and password-protected share access should all still work.
