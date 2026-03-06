const ONBOARDING_KEY_PREFIX = "onboarding_done_";

export function getOnboardingKey(userId: string): string {
  return `${ONBOARDING_KEY_PREFIX}${userId}`;
}

export function isOnboardingDone(userId: string | undefined): boolean {
  if (!userId) return true;
  try {
    return localStorage.getItem(getOnboardingKey(userId)) === "true";
  } catch {
    return true;
  }
}

export function setOnboardingDone(userId: string): void {
  try {
    localStorage.setItem(getOnboardingKey(userId), "true");
  } catch {
    // ignore
  }
}

export function clearOnboardingDone(userId: string): void {
  try {
    localStorage.removeItem(getOnboardingKey(userId));
  } catch {
    // ignore
  }
}
