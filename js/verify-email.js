document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('verify-form');
  const resendLink = document.getElementById('resend-link');
  const emailInput = document.getElementById('verify-email');
  const otpInput = document.getElementById('otp');
  const errorMsg = document.getElementById('error-msg');
  const successMsg = document.getElementById('success-msg');
  const verifyBtn = document.getElementById('verify-btn');

  const queryEmail = new URLSearchParams(window.location.search).get('email');
  if (queryEmail) {
    emailInput.value = queryEmail;
    const sub = document.getElementById('verify-sub');
    if (sub) sub.textContent = `Enter the 6-digit code sent to ${queryEmail}.`;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim().toLowerCase();
      const otp = otpInput.value.trim();

      errorMsg.style.display = 'none';
      successMsg.style.display = 'none';
      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying...';

      try {
        const data = await verifyEmailOtp(email, otp);
        localStorage.setItem('pg_user', JSON.stringify({
          plan: data.plan || 'Free',
          instagram_connected: !!data.instagram_connected
        }));
        successMsg.style.display = 'block';
        successMsg.textContent = 'Email verified. Redirecting to dashboard...';
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 700);
      } catch (err) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = err.message || 'Verification failed';
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify & Continue';
      }
    });
  }

  if (resendLink) {
    resendLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();
      if (!email) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Enter your email first.';
        return;
      }

      errorMsg.style.display = 'none';
      successMsg.style.display = 'none';

      try {
        await resendEmailOtp(email);
        successMsg.style.display = 'block';
        successMsg.textContent = 'New OTP sent to your email.';
      } catch (err) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = err.message || 'Failed to resend OTP';
      }
    });
  }

  if (otpInput) {
    otpInput.addEventListener('input', () => {
      otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
    });
  }
});
