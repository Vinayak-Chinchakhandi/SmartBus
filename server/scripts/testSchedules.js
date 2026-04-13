const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/schedules';

async function testSchedulesAPI() {
  try {
    console.log('\n🚀 STARTING SCHEDULES API TEST\n');

    // ======================
    // 1. INITIAL DATA
    // ======================
    console.log('1️⃣ Initial schedules:');
    const initial = await axios.get(BASE_URL);
    console.table(initial.data);

    const initialCount = initial.data.length;

    // ======================
    // 2. CREATE SCHEDULE
    // ======================
    console.log('\n2️⃣ Creating new schedule...');

    const newSchedule = {
      route_id: 1,
      day_of_week: 'Monday',
      trip_type: 'pickup',
      pickup_time: '09:30',
      drop_time: '10:30'
    };

    const createRes = await axios.post(BASE_URL, newSchedule);
    const newId = createRes.data.id;

    console.log('✅ Created Schedule ID:', newId);

    const afterCreate = await axios.get(BASE_URL);
    const created = afterCreate.data.find(s => s.id === newId);

    console.log('\n📌 Created Schedule:');
    console.table([created]);

    // ======================
    // 3. UPDATE SCHEDULE
    // ======================
    console.log('\n3️⃣ Updating schedule...');

    await axios.put(`${BASE_URL}/${newId}`, {
      route_id: 1,
      day_of_week: 'Monday',
      trip_type: 'pickup',
      pickup_time: '11:00',
      drop_time: '12:00'
    });

    const afterUpdate = await axios.get(BASE_URL);
    const updated = afterUpdate.data.find(s => s.id === newId);

    console.log('\n📌 Updated Schedule:');
    console.table([updated]);

    // ======================
    // 4. DELETE SCHEDULE
    // ======================
    console.log('\n4️⃣ Deleting schedule...');
    await axios.delete(`${BASE_URL}/${newId}`);
    console.log('✅ Schedule deleted');

    // ======================
    // 5. FINAL DATA
    // ======================
    console.log('\n5️⃣ Final schedules:');
    const final = await axios.get(BASE_URL);
    console.table(final.data);

    const finalCount = final.data.length;

    // ======================
    // 6. VALIDATION
    // ======================
    console.log('\n🔍 VALIDATION:');

    if (initialCount === finalCount) {
      console.log('✅ Schedule count unchanged');
    } else {
      console.log('❌ Count mismatch');
    }

    const exists = final.data.find(s => s.id === newId);

    if (!exists) {
      console.log('✅ Schedule properly deleted');
    } else {
      console.log('❌ Schedule still exists');
    }

    console.log('\n🎉 SCHEDULE TEST COMPLETED SUCCESSFULLY\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testSchedulesAPI();

// 🚀 STARTING SCHEDULES API TEST

// 1️⃣ Initial schedules:
// ┌─────────┬────┬──────────┬───────────────────────┬─────────────┬───────────┬─────────────┬───────────┐
// │ (index) │ id │ route_id │ route_name            │ day_of_week │ trip_type │ pickup_time │ drop_time │
// ├─────────┼────┼──────────┼───────────────────────┼─────────────┼───────────┼─────────────┼───────────┤
// │ 0       │ 9  │ 1        │ 'Borivali to College' │ 'Friday'    │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 1       │ 10 │ 1        │ 'Borivali to College' │ 'Friday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 2       │ 1  │ 1        │ 'Borivali to College' │ 'Monday'    │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 3       │ 2  │ 1        │ 'Borivali to College' │ 'Monday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 4       │ 11 │ 1        │ 'Borivali to College' │ 'Saturday'  │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 5       │ 12 │ 1        │ 'Borivali to College' │ 'Saturday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 6       │ 7  │ 1        │ 'Borivali to College' │ 'Thursday'  │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 7       │ 8  │ 1        │ 'Borivali to College' │ 'Thursday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 8       │ 3  │ 1        │ 'Borivali to College' │ 'Tuesday'   │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 9       │ 4  │ 1        │ 'Borivali to College' │ 'Tuesday'   │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 10      │ 5  │ 1        │ 'Borivali to College' │ 'Wednesday' │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 11      │ 6  │ 1        │ 'Borivali to College' │ 'Wednesday' │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 12      │ 21 │ 2        │ 'Kurla to College'    │ 'Friday'    │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 13      │ 22 │ 2        │ 'Kurla to College'    │ 'Friday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 14      │ 13 │ 2        │ 'Kurla to College'    │ 'Monday'    │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 15      │ 14 │ 2        │ 'Kurla to College'    │ 'Monday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 16      │ 23 │ 2        │ 'Kurla to College'    │ 'Saturday'  │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 17      │ 24 │ 2        │ 'Kurla to College'    │ 'Saturday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 18      │ 19 │ 2        │ 'Kurla to College'    │ 'Thursday'  │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 19      │ 20 │ 2        │ 'Kurla to College'    │ 'Thursday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 20      │ 15 │ 2        │ 'Kurla to College'    │ 'Tuesday'   │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 21      │ 16 │ 2        │ 'Kurla to College'    │ 'Tuesday'   │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 22      │ 17 │ 2        │ 'Kurla to College'    │ 'Wednesday' │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 23      │ 18 │ 2        │ 'Kurla to College'    │ 'Wednesday' │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 24      │ 33 │ 3        │ 'Colaba to College'   │ 'Friday'    │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 25      │ 34 │ 3        │ 'Colaba to College'   │ 'Friday'    │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 26      │ 25 │ 3        │ 'Colaba to College'   │ 'Monday'    │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 27      │ 26 │ 3        │ 'Colaba to College'   │ 'Monday'    │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 28      │ 35 │ 3        │ 'Colaba to College'   │ 'Saturday'  │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 29      │ 36 │ 3        │ 'Colaba to College'   │ 'Saturday'  │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 30      │ 31 │ 3        │ 'Colaba to College'   │ 'Thursday'  │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 31      │ 32 │ 3        │ 'Colaba to College'   │ 'Thursday'  │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 32      │ 27 │ 3        │ 'Colaba to College'   │ 'Tuesday'   │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 33      │ 28 │ 3        │ 'Colaba to College'   │ 'Tuesday'   │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 34      │ 29 │ 3        │ 'Colaba to College'   │ 'Wednesday' │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 35      │ 30 │ 3        │ 'Colaba to College'   │ 'Wednesday' │ 'drop'    │ '16:30'     │ '18:00'   │
// └─────────┴────┴──────────┴───────────────────────┴─────────────┴───────────┴─────────────┴───────────┘

// 2️⃣ Creating new schedule...
// ✅ Created Schedule ID: 37

// 📌 Created Schedule:
// ┌─────────┬────┬──────────┬───────────────────────┬─────────────┬───────────┬─────────────┬───────────┐
// │ (index) │ id │ route_id │ route_name            │ day_of_week │ trip_type │ pickup_time │ drop_time │
// ├─────────┼────┼──────────┼───────────────────────┼─────────────┼───────────┼─────────────┼───────────┤
// │ 0       │ 37 │ 1        │ 'Borivali to College' │ 'Monday'    │ 'pickup'  │ '09:30'     │ '10:30'   │
// └─────────┴────┴──────────┴───────────────────────┴─────────────┴───────────┴─────────────┴───────────┘

// 3️⃣ Updating schedule...

// 📌 Updated Schedule:
// ┌─────────┬────┬──────────┬───────────────────────┬─────────────┬───────────┬─────────────┬───────────┐
// │ (index) │ id │ route_id │ route_name            │ day_of_week │ trip_type │ pickup_time │ drop_time │
// ├─────────┼────┼──────────┼───────────────────────┼─────────────┼───────────┼─────────────┼───────────┤
// │ 0       │ 37 │ 1        │ 'Borivali to College' │ 'Monday'    │ 'pickup'  │ '11:00'     │ '12:00'   │
// └─────────┴────┴──────────┴───────────────────────┴─────────────┴───────────┴─────────────┴───────────┘

// 4️⃣ Deleting schedule...
// ✅ Schedule deleted

// 5️⃣ Final schedules:
// ┌─────────┬────┬──────────┬───────────────────────┬─────────────┬───────────┬─────────────┬───────────┐
// │ (index) │ id │ route_id │ route_name            │ day_of_week │ trip_type │ pickup_time │ drop_time │
// ├─────────┼────┼──────────┼───────────────────────┼─────────────┼───────────┼─────────────┼───────────┤
// │ 0       │ 9  │ 1        │ 'Borivali to College' │ 'Friday'    │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 1       │ 10 │ 1        │ 'Borivali to College' │ 'Friday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 2       │ 1  │ 1        │ 'Borivali to College' │ 'Monday'    │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 3       │ 2  │ 1        │ 'Borivali to College' │ 'Monday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 4       │ 11 │ 1        │ 'Borivali to College' │ 'Saturday'  │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 5       │ 12 │ 1        │ 'Borivali to College' │ 'Saturday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 6       │ 7  │ 1        │ 'Borivali to College' │ 'Thursday'  │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 7       │ 8  │ 1        │ 'Borivali to College' │ 'Thursday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 8       │ 3  │ 1        │ 'Borivali to College' │ 'Tuesday'   │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 9       │ 4  │ 1        │ 'Borivali to College' │ 'Tuesday'   │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 10      │ 5  │ 1        │ 'Borivali to College' │ 'Wednesday' │ 'pickup'  │ '07:30'     │ '08:30'   │
// │ 11      │ 6  │ 1        │ 'Borivali to College' │ 'Wednesday' │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 12      │ 21 │ 2        │ 'Kurla to College'    │ 'Friday'    │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 13      │ 22 │ 2        │ 'Kurla to College'    │ 'Friday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 14      │ 13 │ 2        │ 'Kurla to College'    │ 'Monday'    │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 15      │ 14 │ 2        │ 'Kurla to College'    │ 'Monday'    │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 16      │ 23 │ 2        │ 'Kurla to College'    │ 'Saturday'  │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 17      │ 24 │ 2        │ 'Kurla to College'    │ 'Saturday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 18      │ 19 │ 2        │ 'Kurla to College'    │ 'Thursday'  │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 19      │ 20 │ 2        │ 'Kurla to College'    │ 'Thursday'  │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 20      │ 15 │ 2        │ 'Kurla to College'    │ 'Tuesday'   │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 21      │ 16 │ 2        │ 'Kurla to College'    │ 'Tuesday'   │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 22      │ 17 │ 2        │ 'Kurla to College'    │ 'Wednesday' │ 'pickup'  │ '07:45'     │ '08:30'   │
// │ 23      │ 18 │ 2        │ 'Kurla to College'    │ 'Wednesday' │ 'drop'    │ '16:30'     │ '17:30'   │
// │ 24      │ 33 │ 3        │ 'Colaba to College'   │ 'Friday'    │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 25      │ 34 │ 3        │ 'Colaba to College'   │ 'Friday'    │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 26      │ 25 │ 3        │ 'Colaba to College'   │ 'Monday'    │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 27      │ 26 │ 3        │ 'Colaba to College'   │ 'Monday'    │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 28      │ 35 │ 3        │ 'Colaba to College'   │ 'Saturday'  │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 29      │ 36 │ 3        │ 'Colaba to College'   │ 'Saturday'  │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 30      │ 31 │ 3        │ 'Colaba to College'   │ 'Thursday'  │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 31      │ 32 │ 3        │ 'Colaba to College'   │ 'Thursday'  │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 32      │ 27 │ 3        │ 'Colaba to College'   │ 'Tuesday'   │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 33      │ 28 │ 3        │ 'Colaba to College'   │ 'Tuesday'   │ 'drop'    │ '16:30'     │ '18:00'   │
// │ 34      │ 29 │ 3        │ 'Colaba to College'   │ 'Wednesday' │ 'pickup'  │ '07:00'     │ '08:30'   │
// │ 35      │ 30 │ 3        │ 'Colaba to College'   │ 'Wednesday' │ 'drop'    │ '16:30'     │ '18:00'   │
// └─────────┴────┴──────────┴───────────────────────┴─────────────┴───────────┴─────────────┴───────────┘

// 🔍 VALIDATION:
// ✅ Schedule count unchanged
// ✅ Schedule properly deleted

// 🎉 SCHEDULE TEST COMPLETED SUCCESSFULLY