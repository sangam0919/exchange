const STORAGE_KEY = 'sa-exchange-paper-account-v1';
export const STARTING_KRW = 10_000_000;

export function getDemoAccount() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved.krwBalance === 'number') {
      return { krwBalance: STARTING_KRW, holdings: {}, orders: [], ...saved };
    }
  } catch (error) {
    console.warn('Could not read paper-trading account:', error);
  }
  return { krwBalance: STARTING_KRW, holdings: {}, orders: [] };
}

export function saveDemoAccount(account) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  window.dispatchEvent(new Event('sa-demo-account-updated'));
}
