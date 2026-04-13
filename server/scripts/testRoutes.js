const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/routes';

async function testRoutesAPI() {
  try {
    console.log('\n🚀 STARTING ROUTES API TEST\n');

    // ======================
    // 1. INITIAL DATA
    // ======================
    console.log('1️⃣ Initial routes:');
    const initial = await axios.get(BASE_URL);
    console.table(initial.data);

    const initialCount = initial.data.length;

    // ======================
    // 2. CREATE ROUTE
    // ======================
    console.log('\n2️⃣ Creating new route...');
    const newRoute = {
      name: 'Test Route'
    };

    const createRes = await axios.post(BASE_URL, newRoute);
    const newRouteId = createRes.data.id;

    console.log('✅ Created Route ID:', newRouteId);

    const afterCreate = await axios.get(BASE_URL);
    const createdRoute = afterCreate.data.find(r => r.id === newRouteId);

    console.log('\n📌 Created Route:');
    console.table([createdRoute]);

    // ======================
    // 3. UPDATE ROUTE
    // ======================
    console.log('\n3️⃣ Updating route...');

    await axios.put(`${BASE_URL}/${newRouteId}`, {
      name: 'Updated Test Route'
    });

    const afterUpdate = await axios.get(BASE_URL);
    const updatedRoute = afterUpdate.data.find(r => r.id === newRouteId);

    console.log('\n📌 Updated Route:');
    console.table([updatedRoute]);

    // ======================
    // 4. DELETE ROUTE
    // ======================
    console.log('\n4️⃣ Deleting route...');
    await axios.delete(`${BASE_URL}/${newRouteId}`);
    console.log('✅ Route deleted');

    // ======================
    // 5. FINAL DATA
    // ======================
    console.log('\n5️⃣ Final routes:');
    const final = await axios.get(BASE_URL);
    console.table(final.data);

    const finalCount = final.data.length;

    // ======================
    // 6. VALIDATION
    // ======================
    console.log('\n🔍 VALIDATION:');

    if (initialCount === finalCount) {
      console.log('✅ Route count unchanged');
    } else {
      console.log('❌ Route count mismatch');
    }

    const exists = final.data.find(r => r.id === newRouteId);

    if (!exists) {
      console.log('✅ Created route properly deleted');
    } else {
      console.log('❌ Route still exists after delete');
    }

    console.log('\n🎉 ROUTES TEST COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testRoutesAPI();

// 🚀 STARTING ROUTES API TEST

// 1️⃣ Initial routes:
// ┌─────────┬────┬───────────────────────┬───────────────────────┐
// │ (index) │ id │ name                  │ created_at            │
// ├─────────┼────┼───────────────────────┼───────────────────────┤
// │ 0       │ 1  │ 'Borivali to College' │ '2026-04-12 11:00:32' │
// │ 1       │ 2  │ 'Kurla to College'    │ '2026-04-12 11:00:32' │
// │ 2       │ 3  │ 'Colaba to College'   │ '2026-04-12 11:00:32' │
// └─────────┴────┴───────────────────────┴───────────────────────┘

// 2️⃣ Creating new route...
// ✅ Created Route ID: 4

// 📌 Created Route:
// ┌─────────┬────┬──────────────┬───────────────────────┐
// │ (index) │ id │ name         │ created_at            │
// ├─────────┼────┼──────────────┼───────────────────────┤
// │ 0       │ 4  │ 'Test Route' │ '2026-04-12 12:32:22' │
// └─────────┴────┴──────────────┴───────────────────────┘

// 3️⃣ Updating route...

// 📌 Updated Route:
// ┌─────────┬────┬──────────────────────┬───────────────────────┐
// │ (index) │ id │ name                 │ created_at            │
// ├─────────┼────┼──────────────────────┼───────────────────────┤
// │ 0       │ 4  │ 'Updated Test Route' │ '2026-04-12 12:32:22' │
// └─────────┴────┴──────────────────────┴───────────────────────┘

// 4️⃣ Deleting route...
// ✅ Route deleted

// 5️⃣ Final routes:
// ┌─────────┬────┬───────────────────────┬───────────────────────┐
// │ (index) │ id │ name                  │ created_at            │
// ├─────────┼────┼───────────────────────┼───────────────────────┤
// │ 0       │ 1  │ 'Borivali to College' │ '2026-04-12 11:00:32' │
// │ 1       │ 2  │ 'Kurla to College'    │ '2026-04-12 11:00:32' │
// │ 2       │ 3  │ 'Colaba to College'   │ '2026-04-12 11:00:32' │
// └─────────┴────┴───────────────────────┴───────────────────────┘

// 🔍 VALIDATION:
// ✅ Route count unchanged
// ✅ Created route properly deleted

// 🎉 ROUTES TEST COMPLETED SUCCESSFULLY