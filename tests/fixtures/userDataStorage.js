/**
 * chrome.storage.sync USER_DATA helpers — matches production (service-worker / popup).
 * BlockedSites live under Vars.UserData.BlockedSites, persisted as key USER_DATA.
 *
 * After mutating storage, call syncServiceWorkerFromStorage() so the service worker's
 * in-memory Vars match storage (get_data otherwise returns stale Vars).
 */

const USER_DATA_KEY = 'USER_DATA';

/**
 * Push USER_DATA and/or Histogram from chrome.storage.sync into Vars via set_data.
 * @param {import('@playwright/test').Page} page
 * @param {('USER_DATA'|'Histogram')[]} keys
 */
async function syncServiceWorkerFromStorage(page, keys) {
  await page.evaluate((keysToSync) => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keysToSync, (storage) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        chrome.runtime.sendMessage({ sender: 'popup', msg: 'get_data' }, (r) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          if (!r?.complete) {
            reject(new Error('get_data incomplete'));
            return;
          }
          const vars = r.vars;
          if (keysToSync.includes('USER_DATA') && storage.USER_DATA) {
            Object.assign(vars.UserData, storage.USER_DATA);
            if (storage.USER_DATA.BlockedSites) {
              vars.UserData.BlockedSites = Object.assign(
                {},
                vars.UserData.BlockedSites ?? {},
                storage.USER_DATA.BlockedSites,
              );
            }
          }
          if (keysToSync.includes('Histogram')) {
            vars.Histogram = storage.Histogram ?? {};
          }
          chrome.runtime.sendMessage(
            { sender: 'popup', msg: 'set_data', data: { vars } },
            () => resolve(),
          );
        });
      });
    });
  }, keys);
}

/**
 * Merge a hostname entry into BlockedSites inside USER_DATA.
 * @returns {Promise<object|null>} previous USER_DATA snapshot for restoreUserData()
 */
async function injectBlockedSite(page, hostname, siteData) {
  const original = await page.evaluate(({ key, hostname, siteData }) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        const orig = result[key] ?? null;
        const updated = Object.assign({}, orig ?? {});
        updated.BlockedSites = Object.assign({}, updated.BlockedSites ?? {}, { [hostname]: siteData });
        // Ensure HideEdit is off so block-link is always visible in site-blocker tests,
        // regardless of state left behind by other tests (e.g. settings-blocker 7.3).
        updated.HideEdit = false;
        chrome.storage.sync.set({ [key]: updated }, () => resolve(orig));
      });
    });
  }, { key: USER_DATA_KEY, hostname, siteData });
  await syncServiceWorkerFromStorage(page, ['USER_DATA']);
  return original;
}

/** Restore full USER_DATA to a snapshot from injectBlockedSite (or null = remove key). */
async function restoreUserData(page, original) {
  await page.evaluate(({ key, original }) => {
    return new Promise((resolve) => {
      if (original === null) {
        chrome.storage.sync.remove(key, resolve);
      } else {
        chrome.storage.sync.set({ [key]: original }, resolve);
      }
    });
  }, { key: USER_DATA_KEY, original });
  await syncServiceWorkerFromStorage(page, ['USER_DATA']);
}

/**
 * Remove one hostname from BlockedSites without discarding other USER_DATA fields.
 * Used after tests that block a site via the UI (no prior inject snapshot).
 */
async function removeBlockedHostname(page, hostname) {
  await page.evaluate(({ key, hostname }) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        const ud = Object.assign({}, result[key] ?? {});
        ud.BlockedSites = Object.assign({}, ud.BlockedSites ?? {});
        delete ud.BlockedSites[hostname];
        chrome.storage.sync.set({ [key]: ud }, resolve);
      });
    });
  }, { key: USER_DATA_KEY, hostname });
  await syncServiceWorkerFromStorage(page, ['USER_DATA']);
}

/** Read current USER_DATA snapshot without modifying it. */
async function snapshotUserData(page) {
  return page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.sync.get('USER_DATA', (result) => resolve(result['USER_DATA'] ?? null));
    });
  });
}

/**
 * Fire-and-forget timer reset via the service worker's pomoReset function.
 * Does NOT wait for the popup UI to reflect the change.
 * @param {import('@playwright/test').Page} page
 */
async function resetServiceWorkerPomodoro(page) {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { sender: 'popup', msg: 'run_function', functionName: 'pomoReset' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(response);
        },
      );
    });
  });
}

exports.syncServiceWorkerFromStorage = syncServiceWorkerFromStorage;
exports.injectBlockedSite = injectBlockedSite;
exports.restoreUserData = restoreUserData;
exports.removeBlockedHostname = removeBlockedHostname;
exports.snapshotUserData = snapshotUserData;
exports.resetServiceWorkerPomodoro = resetServiceWorkerPomodoro;
