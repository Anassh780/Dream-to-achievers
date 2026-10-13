export const SITE_URL = 'https://dream-to-achievers.vercel.app';

function getRtdbProductsUrl() {
  const dbUrl =
    process.env.FIREBASE_DATABASE_URL ||
    process.env.VITE_FIREBASE_DATABASE_URL ||
    'https://uc-store-b5265-default-rtdb.firebaseio.com';
  return `${dbUrl.replace(/\/$/, '')}/products.json`;
}

function getFirestoreProductsUrl() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'uc-store-b5265';
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/products`;
}

export function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function escapeHtml(value = '') {
  return escapeXml(value);
}

function firestoreValue(value) {
  if (!value || typeof value !== 'object') return undefined;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(firestoreValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return undefined;
}

function decodeFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, firestoreValue(value)])
  );
}

export async function getActiveProducts() {
  // Primary: Firebase Realtime Database (always publicly readable for catalog sync)
  try {
    const rtdbResponse = await fetch(getRtdbProductsUrl(), {
      headers: { Accept: 'application/json' },
    });
    if (rtdbResponse.ok) {
      const data = await rtdbResponse.json();
      if (data && typeof data === 'object') {
        const items = Object.entries(data).map(([id, item]) => ({
          id,
          ...(item || {}),
          updateTime: item?.updatedAt || item?.createdAt,
        }));
        const active = items.filter((product) => product.status === 'active' && product.slug);
        if (active.length > 0) return active;
      }
    }
  } catch {
    // Fall through to Firestore backup
  }

  // Secondary fallback: Cloud Firestore REST API
  try {
    const response = await fetch(`${getFirestoreProductsUrl()}?pageSize=1000`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.documents || [])
      .map((document) => ({
        id: document.name.split('/').pop(),
        ...decodeFields(document.fields || {}),
        updateTime: document.updateTime,
      }))
      .filter((product) => product.status === 'active' && product.slug);
  } catch {
    return [];
  }
}

export function send(res, status, contentType, body, cacheControl) {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}
