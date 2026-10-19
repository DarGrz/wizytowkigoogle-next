import { createHash } from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasPayuConfiguration, validPayuNotification } from '../lib/payu';

const config = {
  PAYU_ENV: process.env.PAYU_ENV,
  PAYU_POS_ID: process.env.PAYU_POS_ID,
  PAYU_CLIENT_ID: process.env.PAYU_CLIENT_ID,
  PAYU_CLIENT_SECRET: process.env.PAYU_CLIENT_SECRET,
  PAYU_SECOND_KEY: process.env.PAYU_SECOND_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

function useTestConfig() {
  Object.assign(process.env, {
    PAYU_ENV: 'sandbox',
    PAYU_POS_ID: 'test-pos',
    PAYU_CLIENT_ID: 'test-client',
    PAYU_CLIENT_SECRET: 'test-secret',
    PAYU_SECOND_KEY: 'test-second-key',
    NEXT_PUBLIC_SITE_URL: 'https://example.test',
  });
}

function restoreConfig() {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test('PayU cannot be considered configured without a secure endpoint and credentials', () => {
  useTestConfig();
  try {
    assert.equal(hasPayuConfiguration(), true);
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    assert.equal(hasPayuConfiguration(), false);
    delete process.env.PAYU_SECOND_KEY;
    assert.equal(hasPayuConfiguration(), false);
  } finally {
    restoreConfig();
  }
});

test('PayU notification signature authenticates the exact body', () => {
  useTestConfig();
  try {
    const body = '{"order":{"status":"COMPLETED"}}';
    const signature = createHash('md5').update(body + process.env.PAYU_SECOND_KEY).digest('hex');
    assert.equal(validPayuNotification(body, `signature=${signature};algorithm=MD5;sender=payu`), true);
    assert.equal(validPayuNotification(body + ' ', `signature=${signature};algorithm=MD5;sender=payu`), false);
    assert.equal(validPayuNotification(body, 'signature=00000000000000000000000000000000;algorithm=MD5'), false);
  } finally {
    restoreConfig();
  }
});
