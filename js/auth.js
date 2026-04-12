document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lockoutMsg = document.getElementById('lockout-msg');
      const errorMsg = document.getElementById('error-msg');
      const submitBtn = document.getElementById('login-btn');

      if (isLockedOut()) {
        startLockoutCountdown(lockoutMsg);
        return;
      }

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';

      try {
        const data = await loginUser(email, password);
        resetAttempts();
        // Token is now stored in httpOnly cookie by server (not accessible to JavaScript)
        // Store only non-sensitive user preferences
        localStorage.setItem('pg_user', JSON.stringify({
          plan: data.plan,
          instagram_connected: data.instagram_connected
        }));
        window.location.href = '/dashboard.html';
      } catch (err) {
        const result = recordAttempt();
        if (result.locked) {
          startLockoutCountdown(lockoutMsg);
        } else {
          const warn = document.getElementById('attempts-warning');
          if (warn) {
            warn.style.display = 'block';
            warn.textContent = `${result.remaining} attempt${result.remaining !== 1 ? 's' : ''} remaining before lockout`;
          }
        }
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.textContent = err.message || 'Invalid email or password';
        }
        if (err.message && err.message.includes('not verified')) {
          setTimeout(() => {
            localStorage.setItem('pg_verify_email', email);
            window.location.href = `/verify-email.html?email=${encodeURIComponent(email)}`;
          }, 1500);
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorMsg = document.getElementById('error-msg');
      const successMsg = document.getElementById('success-msg');
      const submitBtn = document.getElementById('register-btn');

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm-password').value;

      // Validate password strength
      const validation = validatePassword(password);
      if (!validation.valid) {
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.textContent = `Password must have: ${validation.errors[0]}`;
        }
        return;
      }

      if (password !== confirm) {
        if (errorMsg) { errorMsg.style.display = 'block'; errorMsg.textContent = 'Passwords do not match'; }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';

      try {
        await registerUser(email, password);
        localStorage.setItem('pg_verify_email', email);
        window.location.href = `/verify-email.html?email=${encodeURIComponent(email)}`;
      } catch (err) {
        if (errorMsg) {
          errorMsg.style.display = 'block';
          errorMsg.textContent = err.message || 'Registration failed';
        }
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
      }
    });
  }
});
