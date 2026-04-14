function toTitleCase(value = "") {
  if (!value) return "Free";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getDisplayName(profile) {
  if (profile?.instagram_username) return `@${profile.instagram_username}`;
  if (profile?.email) return profile.email.split("@")[0];
  return "Pinguru User";
}

function loadLocalPrefs() {
  try {
    const raw = localStorage.getItem("pg_settings_prefs");
    return raw ? JSON.parse(raw) : { pauseOutsideHours: false, notifyAt80: true };
  } catch {
    return { pauseOutsideHours: false, notifyAt80: true };
  }
}

function saveLocalPrefs() {
  const pause = Boolean(document.getElementById("pref-pause")?.checked);
  const notify = Boolean(document.getElementById("pref-notify")?.checked);
  localStorage.setItem(
    "pg_settings_prefs",
    JSON.stringify({ pauseOutsideHours: pause, notifyAt80: notify }),
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const ok = await requireAuth();
  if (!ok) return;

  document.getElementById("logout-btn")?.addEventListener("click", logout);

  const prefs = loadLocalPrefs();
  const pauseToggle = document.getElementById("pref-pause");
  const notifyToggle = document.getElementById("pref-notify");
  if (pauseToggle) pauseToggle.checked = Boolean(prefs.pauseOutsideHours);
  if (notifyToggle) notifyToggle.checked = Boolean(prefs.notifyAt80);

  document
    .getElementById("save-pref-btn")
    ?.addEventListener("click", saveLocalPrefs);

  try {
    const profile = await getProfile();
    if (profile) {
      setEl("display-name", getDisplayName(profile));
      setEl("user-email", profile.email || "unknown@pinguru.me");
      setEl("plan-tier", toTitleCase(profile.plan || "free"));
      setEl(
        "ig-state",
        profile.instagram_connected
          ? `Connected (${profile.instagram_username || "Instagram"})`
          : "Not connected",
      );
    }
  } catch (err) {
    console.error("Profile load failed:", err);
  }

  try {
    const stats = await getDashboardStats();
    if (stats) {
      const used = stats.dms_sent_this_month ?? 0;
      const limit = stats.dm_limit ?? 200;
      const pct = Math.min(100, Math.round((used / limit) * 100));
      setEl("usage-text", `${used} / ${limit} DMs used`);
      const fill = document.getElementById("usage-fill");
      if (fill) fill.style.width = `${pct}%`;
    }
  } catch (err) {
    console.error("Stats load failed:", err);
  }
});
