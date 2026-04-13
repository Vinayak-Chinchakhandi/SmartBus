const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/buses';

async function testBusesAPI() {
  try {
    console.log('\n🚀 STARTING BUSES API TEST\n');

    // ======================
    // 1. GET INITIAL DATA
    // ======================
    console.log('1️⃣ Initial buses:');
    const initial = await axios.get(BASE_URL);
    console.table(initial.data);

    const initialCount = initial.data.length;

    // ======================
    // 2. CREATE BUS
    // ======================
    console.log('\n2️⃣ Creating new bus...');
    const newBus = {
      bus_number: 'TEST-1234',
      route_id: 1,
      driver_name: 'Test Driver',
      driver_phone: '9999999999'
    };

    const createRes = await axios.post(BASE_URL, newBus);
    const newBusId = createRes.data.id;

    console.log('✅ Created Bus ID:', newBusId);

    // Fetch created bus
    const afterCreate = await axios.get(BASE_URL);
    const createdBus = afterCreate.data.find(b => b.id === newBusId);

    console.log('\n📌 Created Bus Data:');
    console.table([createdBus]);

    // ======================
    // 3. UPDATE BUS
    // ======================
    console.log('\n3️⃣ Updating created bus...');

    const updatedData = {
      bus_number: 'TEST-UPDATED',
      route_id: 2,
      driver_name: 'Updated Driver',
      driver_phone: '8888888888'
    };

    await axios.put(`${BASE_URL}/${newBusId}`, updatedData);

    // Fetch updated bus
    const afterUpdate = await axios.get(BASE_URL);
    const updatedBus = afterUpdate.data.find(b => b.id === newBusId);

    console.log('\n📌 Updated Bus Data:');
    console.table([updatedBus]);

    // ======================
    // 4. DELETE BUS
    // ======================
    console.log('\n4️⃣ Deleting created bus...');
    await axios.delete(`${BASE_URL}/${newBusId}`);
    console.log('✅ Bus deleted');

    // ======================
    // 5. FINAL DATA CHECK
    // ======================
    console.log('\n5️⃣ Final buses:');
    const final = await axios.get(BASE_URL);
    console.table(final.data);

    const finalCount = final.data.length;

    // ======================
    // 6. VALIDATION
    // ======================
    console.log('\n🔍 VALIDATION:');

    if (initialCount === finalCount) {
      console.log('✅ Bus count unchanged');
    } else {
      console.log('❌ Bus count mismatch');
    }

    const exists = final.data.find(b => b.id === newBusId);

    if (!exists) {
      console.log('✅ Created bus properly deleted');
    } else {
      console.log('❌ Bus still exists after delete');
    }

    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testBusesAPI();

// 🚀 STARTING BUSES API TEST

// 1️⃣ Initial buses:
// ┌─────────┬────┬─────────────────┬──────────┬────────────────┬──────────────┬───────────────────────┐
// │ (index) │ id │ bus_number      │ route_id │ driver_name    │ driver_phone │ route_name            │
// ├─────────┼────┼─────────────────┼──────────┼────────────────┼──────────────┼───────────────────────┤
// │ 0       │ 1  │ 'MH-01-AB-1234' │ 1        │ 'Ramesh Patil' │ '9876543210' │ 'Borivali to College' │
// │ 1       │ 2  │ 'MH-02-CD-5678' │ 2        │ 'Suresh Kumar' │ '9876543211' │ 'Kurla to College'    │
// │ 2       │ 3  │ 'MH-03-EF-9012' │ 3        │ 'Mahesh Singh' │ '9876543212' │ 'Colaba to College'   │
// └─────────┴────┴─────────────────┴──────────┴────────────────┴──────────────┴───────────────────────┘

// 2️⃣ Creating new bus...
// ✅ Created Bus ID: 4

// 📌 Created Bus Data:
// ┌─────────┬────┬─────────────┬──────────┬───────────────┬──────────────┬───────────────────────┐
// │ (index) │ id │ bus_number  │ route_id │ driver_name   │ driver_phone │ route_name            │
// ├─────────┼────┼─────────────┼──────────┼───────────────┼──────────────┼───────────────────────┤
// │ 0       │ 4  │ 'TEST-1234' │ 1        │ 'Test Driver' │ '9999999999' │ 'Borivali to College' │
// └─────────┴────┴─────────────┴──────────┴───────────────┴──────────────┴───────────────────────┘

// 3️⃣ Updating created bus...

// 📌 Updated Bus Data:
// ┌─────────┬────┬────────────────┬──────────┬──────────────────┬──────────────┬────────────────────┐
// │ (index) │ id │ bus_number     │ route_id │ driver_name      │ driver_phone │ route_name         │
// ├─────────┼────┼────────────────┼──────────┼──────────────────┼──────────────┼────────────────────┤
// │ 0       │ 4  │ 'TEST-UPDATED' │ 2        │ 'Updated Driver' │ '8888888888' │ 'Kurla to College' │
// └─────────┴────┴────────────────┴──────────┴──────────────────┴──────────────┴────────────────────┘

// 4️⃣ Deleting created bus...
// ✅ Bus deleted

// 5️⃣ Final buses:
// ┌─────────┬────┬─────────────────┬──────────┬────────────────┬──────────────┬───────────────────────┐
// │ (index) │ id │ bus_number      │ route_id │ driver_name    │ driver_phone │ route_name            │
// ├─────────┼────┼─────────────────┼──────────┼────────────────┼──────────────┼───────────────────────┤
// │ 0       │ 1  │ 'MH-01-AB-1234' │ 1        │ 'Ramesh Patil' │ '9876543210' │ 'Borivali to College' │
// │ 1       │ 2  │ 'MH-02-CD-5678' │ 2        │ 'Suresh Kumar' │ '9876543211' │ 'Kurla to College'    │
// │ 2       │ 3  │ 'MH-03-EF-9012' │ 3        │ 'Mahesh Singh' │ '9876543212' │ 'Colaba to College'   │
// └─────────┴────┴─────────────────┴──────────┴────────────────┴──────────────┴───────────────────────┘

// 🔍 VALIDATION:
// ✅ Bus count unchanged
// ✅ Created bus properly deleted

// 🎉 TEST COMPLETED SUCCESSFULLY