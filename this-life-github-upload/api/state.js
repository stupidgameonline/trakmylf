import { getDb } from './_lib/mongodb.js';

const COLLECTION = 'app_state';
const DOCUMENT_ID = 'single_user';
const DEFAULT_ACCESS_CODE = 'Alpha#12345';

const unauthorized = (res) => res.status(401).json({ error: 'Unauthorized' });

const getHeaderValue = (headers, key) => {
  const value = headers?.[key];
  return Array.isArray(value) ? value[0] : value;
};

const parseJsonBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};

const isValidState = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

export default async function handler(req, res) {
  const accessCode = process.env.APP_ACCESS_CODE || DEFAULT_ACCESS_CODE;
  const incomingCode = getHeaderValue(req.headers, 'x-access-code');

  if (!incomingCode || incomingCode !== accessCode) {
    return unauthorized(res);
  }

  try {
    const db = await getDb();
    const collection = db.collection(COLLECTION);

    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: DOCUMENT_ID });
      return res.status(200).json({
        state: isValidState(doc?.state) ? doc.state : {},
        updatedAt: doc?.updatedAt || null
      });
    }

    if (req.method === 'PUT') {
      const payload = parseJsonBody(req);
      const state = isValidState(payload?.state) ? payload.state : {};

      await collection.updateOne(
        { _id: DOCUMENT_ID },
        {
          $set: {
            state,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({
      error: 'Database error',
      message: error?.message || 'Unknown error'
    });
  }
}
