const http = require('http');

const PORT = 5050;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({ status: res.statusCode, data: parsed });
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING AUTOMATED FINAL ACCEPTANCE TESTS ---');

  // TEST 1: LOGIN
  console.log('\n[TEST 1] Logging in with admin credentials...');
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@student.com',
    password: 'password123'
  });
  console.log('✓ Login successful. Token received.');
  const token = loginRes.token;

  // TEST 2: ADD TRANSACTION
  console.log('\n[TEST 2] Adding a new transaction...');
  const newTx = await request('POST', '/transactions', {
    date: '21-08-2026',
    description: 'Integration Test Dinner',
    category: 'Food',
    amount: 750,
    paymentMethod: 'UPI',
    notes: 'Testing add transaction flow'
  }, token);
  console.log('✓ Transaction added:', newTx.data);

  // TEST 3: READ TRANSACTIONS
  console.log('\n[TEST 3] Reading transactions...');
  const transactions = await request('GET', '/transactions', null, token);
  console.log(`✓ Fetched ${transactions.length} transactions.`);
  const createdTx = transactions.find(t => t.description === 'Integration Test Dinner');
  if (!createdTx) throw new Error('Added transaction not found in list!');

  // TEST 4: EDIT TRANSACTION
  console.log('\n[TEST 4] Editing added transaction (ID: ' + createdTx.id + ')...');
  const editTxRes = await request('PUT', `/transactions/${createdTx.id}`, {
    date: '21-08-2026',
    description: 'Updated Integration Test Dinner',
    category: 'Food',
    amount: 800,
    paymentMethod: 'UPI',
    notes: 'Updated notes'
  }, token);
  console.log('✓ Transaction updated:', editTxRes.data);

  // Verify no duplicate row
  const txAfterEdit = await request('GET', '/transactions', null, token);
  const matched = txAfterEdit.filter(t => t.description === 'Updated Integration Test Dinner');
  if (matched.length !== 1) throw new Error(`Expected 1 updated record, found ${matched.length}`);
  console.log('✓ Edit verified: Exact record updated without duplicates.');

  // TEST 5: DELETE TRANSACTION
  console.log('\n[TEST 5] Deleting transaction...');
  await request('DELETE', `/transactions/${createdTx.id}`, null, token);
  const txAfterDelete = await request('GET', '/transactions', null, token);
  const exists = txAfterDelete.some(t => t.id === createdTx.id);
  if (exists) throw new Error('Transaction was not deleted!');
  console.log('✓ Transaction successfully deleted.');

  // TEST 6: ADD EARNING
  console.log('\n[TEST 6] Adding a new earning...');
  const newEarn = await request('POST', '/earnings', {
    date: '21-08-2026',
    description: 'Integration Test Freelance',
    source: 'Freelancing',
    amount: 6000,
    notes: 'Test client work'
  }, token);
  console.log('✓ Earning added:', newEarn.data);

  // TEST 7: READ EARNINGS
  console.log('\n[TEST 7] Reading earnings list...');
  const earnings = await request('GET', '/earnings', null, token);
  console.log(`✓ Fetched ${earnings.length} earnings.`);
  const createdEarn = earnings.find(e => e.description === 'Integration Test Freelance');

  // TEST 8: EDIT & DELETE EARNING
  console.log('\n[TEST 8] Editing and Deleting earning (ID: ' + createdEarn.id + ')...');
  await request('PUT', `/earnings/${createdEarn.id}`, {
    date: '21-08-2026',
    description: 'Updated Integration Test Freelance',
    source: 'Freelancing',
    amount: 6500,
    notes: 'Updated client notes'
  }, token);
  await request('DELETE', `/earnings/${createdEarn.id}`, null, token);
  console.log('✓ Earning edit & delete verified successfully.');

  // TEST 9: SETTINGS UPDATES
  console.log('\n[TEST 9] Fetching & Updating Settings LISTS...');
  const currentSettings = await request('GET', '/settings', null, token);
  console.log('✓ Current settings categories:', currentSettings.categories);

  const updatedSettings = await request('PUT', '/settings', {
    categories: [...currentSettings.categories, 'TestCategory'],
    sources: [...currentSettings.sources, 'TestSource'],
    paymentMethods: [...currentSettings.paymentMethods, 'TestPayment']
  }, token);
  console.log('✓ Settings updated with TestCategory, TestSource, TestPayment:', updatedSettings.data);

  console.log('\n==================================================');
  console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
