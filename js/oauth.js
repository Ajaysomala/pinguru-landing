/**
 * OAuth.js — Google Sign-In integration for PinGuru
 * Handles Google OAuth 2.0 authentication flow
 */

/**
 * Callback function called by Google Sign-In button
 * After user authorizes, Google provides ID token (JWT)
 */
async function handleGoogleSignIn(response) {
  const idToken = response.credential;
  
  if (!idToken) {
    console.error('No ID token received from Google');
    return;
  }

  try {
    // Send ID token to backend for verification and user creation/login
    const res = await fetch(`${API}/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
      credentials: 'include'  // Include httpOnly cookies
    });

    const data = await res.json();
    
    if (!res.ok) {
      const errorMsg = document.getElementById('error-msg');
      if (errorMsg) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = data.detail || 'Google sign-in failed';
      }
      return;
    }

    // Store user preference
    localStorage.setItem('pg_user', JSON.stringify({
      plan: data.plan,
      instagram_connected: data.instagram_connected
    }));

    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (err) {
    console.error('Google sign-in error:', err);
    const errorMsg = document.getElementById('error-msg');
    if (errorMsg) {
      errorMsg.style.display = 'block';
      errorMsg.textContent = err.message || 'Sign-in failed';
    }
  }
}

/**
 * Handle Google Sign-In errors
 */
window.onload = function() {
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    callback: handleGoogleSignIn
  });
};
