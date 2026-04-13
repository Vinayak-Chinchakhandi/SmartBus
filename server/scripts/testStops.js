const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/stops';
const ROUTE_ID = 1; // test on route 1

function printWithNeighbors(stops) {
  console.log('\n📊 Stops with neighbors:\n');

  stops.forEach((stop, index) => {
    const prev = stops[index - 1]?.name || 'NONE';
    const next = stops[index + 1]?.name || 'NONE';

    console.log(
      `[${stop.stop_order}] ${stop.name}  |  ← ${prev}  |  → ${next}`
    );
  });
}

async function testStopsAPI() {
  try {
    console.log('\n🚀 STARTING STOPS API TEST\n');

    // ======================
    // 1. INITIAL STOPS
    // ======================
    console.log('1️⃣ Initial stops:');
    const initial = await axios.get(`${BASE_URL}/${ROUTE_ID}`);
    printWithNeighbors(initial.data);

    const initialCount = initial.data.length;

    // ======================
    // 2. CREATE STOP (POSITION 3)
    // ======================
    console.log('\n2️⃣ Adding new stop at position 3...');

    const newStop = {
      route_id: ROUTE_ID,
      name: 'TEST STOP',
      latitude: 19.2000,
      longitude: 72.8500,
      stop_order: 3
    };

    const createRes = await axios.post(BASE_URL, newStop);
    const newStopId = createRes.data.id;

    const afterCreate = await axios.get(`${BASE_URL}/${ROUTE_ID}`);
    printWithNeighbors(afterCreate.data);

    // Show created stop neighbors
    const idxCreate = afterCreate.data.findIndex(s => s.id === newStopId);
    console.log('\n📌 Created Stop Neighbors:');
    console.log('Prev:', afterCreate.data[idxCreate - 1]?.name);
    console.log('Current:', afterCreate.data[idxCreate]?.name);
    console.log('Next:', afterCreate.data[idxCreate + 1]?.name);

    // ======================
    // 3. UPDATE STOP (MOVE TO POSITION 5)
    // ======================
    console.log('\n3️⃣ Moving stop to position 5...');

    await axios.put(`${BASE_URL}/${newStopId}`, {
      name: 'TEST STOP UPDATED',
      latitude: 19.2000,
      longitude: 72.8500,
      stop_order: 5
    });

    const afterUpdate = await axios.get(`${BASE_URL}/${ROUTE_ID}`);
    printWithNeighbors(afterUpdate.data);

    const idxUpdate = afterUpdate.data.findIndex(s => s.id === newStopId);

    console.log('\n📌 Updated Stop Neighbors:');
    console.log('Prev:', afterUpdate.data[idxUpdate - 1]?.name);
    console.log('Current:', afterUpdate.data[idxUpdate]?.name);
    console.log('Next:', afterUpdate.data[idxUpdate + 1]?.name);

    // ======================
    // 4. DELETE STOP
    // ======================
    console.log('\n4️⃣ Deleting test stop...');
    await axios.delete(`${BASE_URL}/${newStopId}`);

    const final = await axios.get(`${BASE_URL}/${ROUTE_ID}`);
    printWithNeighbors(final.data);

    // ======================
    // 5. VALIDATION
    // ======================
    console.log('\n🔍 VALIDATION:');

    if (final.data.length === initialCount) {
      console.log('✅ Stop count restored');
    } else {
      console.log('❌ Count mismatch');
    }

    const exists = final.data.find(s => s.id === newStopId);

    if (!exists) {
      console.log('✅ Stop properly deleted');
    } else {
      console.log('❌ Stop still exists');
    }

    console.log('\n🎉 STOPS TEST COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testStopsAPI();

// 🚀 STARTING STOPS API TEST

// 1️⃣ Initial stops:

// 📊 Stops with neighbors:

// [1] Borivali East  |  ← NONE  |  → Kandivali East
// [2] Kandivali East  |  ← Borivali East  |  → Malad East
// [3] Malad East  |  ← Kandivali East  |  → Goregaon East
// [4] Goregaon East  |  ← Malad East  |  → Jogeshwari East
// [5] Jogeshwari East  |  ← Goregaon East  |  → Andheri East
// [6] Andheri East  |  ← Jogeshwari East  |  → College Campus
// [7] College Campus  |  ← Andheri East  |  → NONE

// 2️⃣ Adding new stop at position 3...

// 📊 Stops with neighbors:

// [1] Borivali East  |  ← NONE  |  → Kandivali East
// [2] Kandivali East  |  ← Borivali East  |  → TEST STOP
// [3] TEST STOP  |  ← Kandivali East  |  → Malad East
// [4] Malad East  |  ← TEST STOP  |  → Goregaon East
// [5] Goregaon East  |  ← Malad East  |  → Jogeshwari East
// [6] Jogeshwari East  |  ← Goregaon East  |  → Andheri East
// [7] Andheri East  |  ← Jogeshwari East  |  → College Campus
// [8] College Campus  |  ← Andheri East  |  → NONE

// 📌 Created Stop Neighbors:
// Prev: Kandivali East
// Current: TEST STOP
// Next: Malad East

// 3️⃣ Moving stop to position 5...

// 📊 Stops with neighbors:

// [1] Borivali East  |  ← NONE  |  → Kandivali East
// [2] Kandivali East  |  ← Borivali East  |  → Malad East
// [3] Malad East  |  ← Kandivali East  |  → Goregaon East
// [4] Goregaon East  |  ← Malad East  |  → TEST STOP UPDATED
// [5] TEST STOP UPDATED  |  ← Goregaon East  |  → Jogeshwari East
// [6] Jogeshwari East  |  ← TEST STOP UPDATED  |  → Andheri East
// [7] Andheri East  |  ← Jogeshwari East  |  → College Campus
// [8] College Campus  |  ← Andheri East  |  → NONE

// 📌 Updated Stop Neighbors:
// Prev: Goregaon East
// Current: TEST STOP UPDATED
// Next: Jogeshwari East

// 4️⃣ Deleting test stop...

// 📊 Stops with neighbors:

// [1] Borivali East  |  ← NONE  |  → Kandivali East
// [2] Kandivali East  |  ← Borivali East  |  → Malad East
// [3] Malad East  |  ← Kandivali East  |  → Goregaon East
// [4] Goregaon East  |  ← Malad East  |  → Jogeshwari East
// [5] Jogeshwari East  |  ← Goregaon East  |  → Andheri East
// [6] Andheri East  |  ← Jogeshwari East  |  → College Campus
// [7] College Campus  |  ← Andheri East  |  → NONE

// 🔍 VALIDATION:
// ✅ Stop count restored
// ✅ Stop properly deleted

// 🎉 STOPS TEST COMPLETED SUCCESSFULLY