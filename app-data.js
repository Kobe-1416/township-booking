/* ===========================================================
   Township Slots — shared app data & helpers
   Uses localStorage so "owner sees booking" actually works
   across pages/tabs in this prototype.
=========================================================== */

const STORAGE_KEY = 'township_slots_v1';

const SEED_BUSINESSES = [
  { id: 'b1', name: "Mama Joy's Kitchen", category: 'Home-cooked meals', area: 'Khayelitsha', icon: '🍲', openTime: '08:00', closeTime: '18:00', phone: '071 234 5678' },
  { id: 'b2', name: 'Sbu Fades Barbershop', category: 'Barber', area: 'Soweto', icon: '💈', openTime: '09:00', closeTime: '19:00', phone: '082 345 6789' },
  { id: 'b3', name: 'Thandi Braids & Beauty', category: 'Hair & beauty', area: 'Umlazi', icon: '💇🏾‍♀️', openTime: '08:00', closeTime: '17:00', phone: '073 456 7890' },
  { id: 'b4', name: 'Vusi Tyre & Repair', category: 'Mechanic', area: 'Mamelodi', icon: '🔧', openTime: '07:30', closeTime: '17:30', phone: '084 567 8901' },
  { id: 'b5', name: 'Nokuthula Spaza Shop', category: 'Spaza shop', area: 'Tembisa', icon: '🛒', openTime: '06:00', closeTime: '20:00', phone: '076 678 9012' },
  { id: 'b6', name: 'Sipho Phone Repairs', category: 'Phone & electronics', area: 'Gugulethu', icon: '📱', openTime: '09:00', closeTime: '18:00', phone: '079 789 0123' },
  { id: 'b7', name: "Lindiwe's Nails", category: 'Nail bar', area: 'Alexandra', icon: '💅🏾', openTime: '09:00', closeTime: '17:00', phone: '081 890 1234' },
  { id: 'b8', name: 'Bongani Driving School', category: 'Driving lessons', area: 'Khayelitsha', icon: '🚗', openTime: '08:00', closeTime: '16:00', phone: '072 901 2345' },
];

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through */ }
  }
  const fresh = { businesses: SEED_BUSINESSES, bookings: {} };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getBusinesses() {
  return loadState().businesses;
}

function getBusinessById(id) {
  return getBusinesses().find(b => b.id === id);
}

function addBusiness(biz) {
  const state = loadState();
  biz.id = 'b' + Date.now();
  state.businesses.unshift(biz);
  saveState(state);
  return biz;
}

// bookings key format: bookings[businessId][dayKey][slotStart] = { status, code, reminder, customerName }
// dayKey: 'today' | 'tomorrow'
// status: 'booked' | 'blocked' | 'late'

function getDayBookings(businessId, dayKey) {
  const state = loadState();
  return (state.bookings[businessId] && state.bookings[businessId][dayKey]) || {};
}

function setSlotStatus(businessId, dayKey, slotStart, data) {
  const state = loadState();
  if (!state.bookings[businessId]) state.bookings[businessId] = {};
  if (!state.bookings[businessId][dayKey]) state.bookings[businessId][dayKey] = {};
  state.bookings[businessId][dayKey][slotStart] = data;
  saveState(state);
}

function clearSlotStatus(businessId, dayKey, slotStart) {
  const state = loadState();
  if (state.bookings[businessId] && state.bookings[businessId][dayKey]) {
    delete state.bookings[businessId][dayKey][slotStart];
    saveState(state);
  }
}

function generateCode() {
  return 'TS-' + Math.floor(1000 + Math.random() * 9000);
}

// Build slot list between openTime and closeTime, 1-hour blocks
function buildSlots(openTime, closeTime) {
  const slots = [];
  let [oh] = openTime.split(':').map(Number);
  let [ch] = closeTime.split(':').map(Number);
  for (let h = oh; h < ch; h++) {
    const start = String(h).padStart(2, '0') + ':00';
    const end = String(h + 1).padStart(2, '0') + ':00';
    slots.push({ start, end });
  }
  return slots;
}

function pad(n) { return String(n).padStart(2, '0'); }

function isBusinessOpenNow(biz) {
  const now = new Date();
  const [oh, om] = biz.openTime.split(':').map(Number);
  const [ch, cm] = biz.closeTime.split(':').map(Number);
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= openMins && nowMins < closeMins;
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
