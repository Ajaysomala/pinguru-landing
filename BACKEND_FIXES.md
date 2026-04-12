# Backend Implementation Guide

## Required Changes for Production Launch

---

## 1. PASSWORD POLICY ENFORCEMENT

### File: `app/models/models.py`

Add validation to `UserCreate`:

```python
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain number')
        if not re.search(r'[!@#$%^&*\-_=+\[\]{}|;:,.<>?]', v):
            raise ValueError('Password must contain special character')
        return v
```

---

## 2. BRUTE FORCE PROTECTION (PER-EMAIL)

### File: `app/security.py`

Add Redis-based tracking:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
import redis
from datetime import datetime, timedelta

limiter = Limiter(key_func=get_remote_address, default_limits=[])

# Optional: Redis for distributed brute force protection
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except:
    redis_client = None

def track_login_attempt(email: str, ip: str):
    """Track failed login attempt"""
    if not redis_client:
        return

    key = f"login_attempts:{email}:{ip}"
    current = redis_client.get(key)
    count = int(current) + 1 if current else 1

    # Expire key after 1 hour
    redis_client.setex(key, 3600, count)

    if count >= 5:
        # Lock for 30 minutes
        redis_client.setex(f"login_locked:{email}:{ip}", 1800, "1")

    return count

def is_login_locked(email: str, ip: str) -> bool:
    """Check if email:ip combo is locked"""
    if not redis_client:
        return False
    return redis_client.get(f"login_locked:{email}:{ip}") is not None

def reset_login_attempts(email: str, ip: str):
    """Reset attempts after successful login"""
    if not redis_client:
        return
    redis_client.delete(f"login_attempts:{email}:{ip}")
```

### File: `app/routes/auth.py`

Update login endpoint:

```python
from app.security import track_login_attempt, is_login_locked, reset_login_attempts

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, data: UserCreate, db=Depends(get_db)):
    client_ip = request.client.host
    email = data.email

    # Check if locked
    if is_login_locked(email, client_ip):
        raise HTTPException(status_code=429, detail="Too many attempts. Try again in 30 minutes")

    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["hashed_password"]):
        track_login_attempt(email, client_ip)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Success: reset attempts
    reset_login_attempts(email, client_ip)

    token = create_jwt(str(user["_id"]))
    return {"token": token, "plan": get_plan_type(user["plan"]).name, "instagram_connected": bool(user.get("instagram_user_id"))}
```

---

## 3. FIX INSTAGRAM TOKEN SECURITY (URL → POST)

### File: `app/routes/auth.py`

**Current (Bad):**

```python
url = (
    "https://graph.facebook.com/v19.0/me/accounts"
    f"?fields=instagram_business_account&access_token={access_token}"
)
async with httpx.AsyncClient() as client:
    response = await client.get(url)
```

**New (Better):**

```python
@router.post("/instagram/save-token")
async def save_instagram_token(
    data: InstagramTokenRequest,
    db=Depends(get_db),
    x_admin_key: str = Header(None),
):
    """Save Instagram access token via POST body, not URL"""
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=403, detail="Forbidden")

    access_token = data.access_token.strip()
    if not access_token:
        raise HTTPException(status_code=400, detail="access_token required")

    # Token in POST body, not URL
    url = "https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "User-Agent": "PinGuru/1.0"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code >= 400:
            raise HTTPException(status_code=400, detail="Invalid or expired access token")

        profile = response.json()
        # ... rest of logic
        return {"status": "Instagram connected", "profile": profile}
```

---

## 4. HTTPSONLY JWT COOKIES (Optional but Recommended)

### File: `app/routes/auth.py`

Add cookie-based auth:

```python
from fastapi.responses import JSONResponse

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, data: UserCreate, db=Depends(get_db)):
    # ... existing validation ...

    token = create_jwt(str(user["_id"]))

    # Return cookie instead of JSON token
    response = JSONResponse(
        content={"plan": get_plan_type(user["plan"]).name, "instagram_connected": bool(user.get("instagram_user_id"))}
    )

    response.set_cookie(
        key="pg_auth_token",
        value=token,
        httponly=True,  # Not accessible to JavaScript
        secure=settings.ENVIRONMENT == "production",  # HTTPS only in prod
        samesite="strict",  # CSRF protection
        max_age=10080 * 60  # 7 days
    )

    return response
```

### File: `app/config.py`

Update CORS:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],  # Only your domain
    allow_credentials=True,  # Allow cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### File: `pinguru-landing/js/api.js`

Update to use credentials:

```javascript
async function loginUser(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Send cookies
    body: JSON.stringify({ email, password }),
  });
  // ... rest
}

async function getProfile() {
  const res = await fetch(`${API}/auth/me`, {
    credentials: "include", // Browser sends cookie automatically
  });
  // ... rest
}
```

Then remove localStorage usage:

```javascript
// DELETE these lines:
// localStorage.setItem('pg_token', data.token);
// localStorage.getItem('pg_token')
```

---

## 5. ADD HSTS HEADER

### File: `app/main.py`

```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

    # ADD THIS:
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # ... rest
```

---

## 6. ADMIN PASSWORD VALIDATION

### File: `app/routes/admin.py`

Same password validation as users:

```python
# Add same validators as UserCreate
@router.post("/login")
async def admin_login(data: AdminLoginRequest):
    # ... existing validation ...

    # Note: Admin password is hashed at setup time
    # No need to validate at login, just verify hash
```

---

## 7. ENVIRONMENT VARIABLES TEMPLATE

### Create: `.env.example`

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net
DB_NAME=pinguru
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_WEBHOOK_VERIFY_TOKEN=your_verify_token
JWT_SECRET=your_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_encryption_key_base64
BASE_URL=https://api.pinguru.me
FRONTEND_URL=https://pinguru.me
ADMIN_EMAIL=admin@pinguru.me
ADMIN_PASSWORD_HASH=bcrypt_hash_of_admin_password
ENVIRONMENT=production
DISABLE_WEBHOOK_SIGNATURE=false
```

Then: **Remove `.env` from git history**

```bash
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Remove .env from git tracking"
```

---

## Testing Checklist

- [ ] Register with weak password (< 12 chars) → rejected
- [ ] Register without uppercase → rejected
- [ ] Register without special char → rejected
- [ ] Valid password created successfully
- [ ] Login 5 times with wrong password → account locked
- [ ] Wait 30 seconds, login again → still locked
- [ ] Wait full 30 minutes, login → unlocked
- [ ] Admin login with wrong password → lockout works
- [ ] Instagram token in POST body (not URL visible in logs)
- [ ] Password policy error messages clear to user

---

## Deployment Checklist

- [ ] Redis running (for brute force tracking)
- [ ] HTTPS certificate valid (for HSTS)
- [ ] `.env` not in git, using environment variables
- [ ] Database backups automated
- [ ] Monitoring/logging configured
- [ ] Admin password set securely (not default)
- [ ] All environment variables configured on server

---

**Estimated Time**: 2-3 hours to implement all fixes  
**Difficulty**: Medium (mostly copy-paste patterns)  
**Testing Time**: 1 hour
