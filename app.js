/* =========================================================
   Takamatsu Oct 2026 App 核心邏輯 (含行程資料解析)
   ========================================================= */

// 全域 State
let currentTheme = 'dusty-rose';
let currentNav = 'home';
let currentDay = 1;
let isReorderMode = false;
let currentEditingItinId = null;
let currentEditingHotelId = null;

// 匯率 (基準: 1 JPY = 0.0515 HKD)
const JPY_TO_HKD_RATE = 0.0515;

// Word 檔行程資料庫初始化
let itineraryData = {
  1: [
    { id: 'i101', cat: '交通', title: '高松機場 取車', startTime: '09:45', endTime: '11:10', loc: '高松機場', phone: '', mapcode: '', tips: ['JL477抵達高松', '取車自駕'], notes: '', img: '' },
    { id: 'i102', cat: '景點', title: '呆呆獸公園（ヤドン公園）', startTime: '13:00', endTime: '13:30', loc: 'ヤドン公園駐車場', phone: '+81 878-76-5280', mapcode: '228 877 247*20', tips: ['必買伴手禮: 呆呆獸限定週邊'], notes: '〒761-2304 香川県綾歌郡綾川町萱原253-7', img: '' },
    { id: 'i103', cat: '景點', title: '金刀比羅宮', startTime: '14:00', endTime: '15:30', loc: '金刀比羅宮 Nice Parking', phone: '+81 877-75-2121', mapcode: '77 353 864*26', tips: ['參道石階多', '預約: 禦守參拜'], notes: '香川縣最著名神社，挑戰785階至本宮。', img: '' },
    { id: 'i104', cat: '景點', title: '四國水族館', startTime: '16:30', endTime: '18:00', loc: '四國水族館 停車場', phone: '+81 0877-49-4590', mapcode: '77 832 128*42', tips: ['門票: 大人 2,600日圓', '營業至18:00'], notes: '瀨戶內海景緻水族館。', img: '' },
    { id: 'i105', cat: '住宿', title: 'Fav Hotel 入住', startTime: '19:00', endTime: '20:00', loc: 'Fav Hotel Takamatsu', phone: '', mapcode: '60 607 301*65', tips: ['重要預約代號: FAV-8829'], notes: '〒760-0062 香川県高松市塩上町２丁目４−２0', img: '' }
  ],
  2: [
    { id: 'i201', cat: '交通', title: '高松港 → 土庄港 (小豆島渡輪)', startTime: '08:02', endTime: '09:02', loc: '高松のりば', phone: '087-822-4383', mapcode: '60 666 095*58', tips: ['提前15分鐘排隊登船'], notes: '搭乘小豆島渡輪', img: '' },
    { id: 'i202', cat: '景點', title: '中山千枚田 (擁抱小豆島)', startTime: '09:30', endTime: '10:15', loc: '中山千枚田 臨時駐車場', phone: '+81 0879-82-1775', mapcode: '364 884 883*85', tips: ['梯田景觀'], notes: '香川県小豆郡小豆島町中山', img: '' },
    { id: 'i203', cat: '景點', title: '天使の散步道 (エンジェルロード)', startTime: '10:45', endTime: '11:30', loc: '天使之路 第一駐車場', phone: '+81 0879-62-2801', mapcode: '364 787 899*84', tips: ['白天乾潮: 05:12–11:12', '乾潮高峰: 08:12'], notes: '退潮時才會出現的浪漫沙洲。', img: '' },
    { id: 'i204', cat: '美食', title: '小豆島ラーメン Hishio', startTime: '11:45', endTime: '12:45', loc: '小豆島ラーメン Hishio エンジェルロード店', phone: '+81 0879-62-8720', mapcode: '', tips: ['必吃美食: 醬油拉麵', '必點菜單: 醬油叉燒麵'], notes: '營業時間：11:00～20:00', img: '' },
    { id: 'i205', cat: '景點', title: '橄欖公園 (道の駅 小豆島オリーブ公園)', startTime: '13:30', endTime: '15:00', loc: '道の駅 第3駐車場', phone: '+81 879-82-2200', mapcode: '364 798 305*82', tips: ['必買伴手禮: 橄欖油美容液', '借掃帚拍魔女宅急便'], notes: '經典白色風車打卡點。', img: '' },
    { id: 'i206', cat: '景點', title: '丸金醬油紀念館 醤の郷', startTime: '15:15', endTime: '16:00', loc: '丸金醬油紀念館停車場', phone: '+81 0879-82-1011', mapcode: '364 773 589*62', tips: ['必吃美食: 醬油霜淇淋', '門票: 500円'], notes: '百年醬油工廠與紀念館。', img: '' }
  ],
  3: [
    { id: 'i301', cat: '美食', title: 'Minori Gelato', startTime: '12:00', endTime: '12:05', loc: 'Minori Gelato', phone: '+81 0879-62-8181', mapcode: '364 831 124*37', tips: ['必吃美食: 橄欖牛奶義式冰淇淋'], notes: '小豆島在地食材冰淇淋店。', img: '' },
    { id: 'i302', cat: '交通', title: '土庄 (小豆島) → 唐櫃 (豊島)', startTime: '13:10', endTime: '13:40', loc: '土庄港 フェリー乗り場', phone: '+81 87-962-1348', mapcode: '364 846 300*51', tips: ['船程約30分鐘'], notes: '搭乘小豆島豊島渡輪', img: '' },
    { id: 'i303', cat: '景點', title: '唐櫃 | 豊島美術館', startTime: '14:00', endTime: '16:00', loc: '豐島美術館專用停車場', phone: '+81 879683555', mapcode: '871 251 334*74', tips: ['重要預約代號: TESHIMA-9012', '線上票 1,800円'], notes: '自然與建築結合的水滴形藝術空間。', img: '' }
  ],
  4: [
    { id: 'i401', cat: '交通', title: '宇野 → 宮浦 (直島)', startTime: '08:22', endTime: '08:42', loc: '四國汽船 宇野港', phone: '0863-31-1641', mapcode: '19 264 704*85', tips: ['渡輪約20分鐘'], notes: '前往直島藝術之島', img: '' },
    { id: 'i402', cat: '景點', title: '地中美術館', startTime: '10:00', endTime: '11:00', loc: '地中美術館 停車場', phone: '', mapcode: '19 118 560*02', tips: ['重要預約代号: CHICHU-7721', '線上票 2,700円'], notes: '安藤忠雄設計，藏有莫內睡蓮。', img: '' },
    { id: 'i403', cat: '活動', title: '杉本博司 時間的迴廊', startTime: '12:00', endTime: '12:30', loc: 'Benesse House', phone: '', mapcode: '', tips: ['Booked 12:00', '含 Tea and sweets'], notes: '線上 1,600円', img: '' },
    { id: 'i404', cat: '景點', title: '草間彌生 黃南瓜 (黄かぼちゃ)', startTime: '12:30', endTime: '12:45', loc: '直島海岸', phone: '', mapcode: '', tips: ['經典地標打卡'], notes: '直島著名地標黃南瓜。', img: '' },
    { id: 'i405', cat: '美食', title: 'カフェサロン中奥', startTime: '13:45', endTime: '14:30', loc: 'カフェサロン中奥', phone: '+81 087-892-3887', mapcode: '', tips: ['必吃美食: 咖哩蛋包飯'], notes: '隱藏在古民家中的人氣咖啡廳。', img: '' }
  ],
  5: [
    { id: 'i501', cat: '交通', title: '還車與高松市區採購', startTime: '12:30', endTime: '13:30', loc: '高松租車營業所', phone: '', mapcode: '', tips: ['記得加滿油還車'], notes: '結束自駕行程', img: '' }
  ],
  6: [
    { id: 'i601', cat: '活動', title: 'USJ 日本環球影城', startTime: '08:30', endTime: '20:00', loc: 'Universal Studios Japan', phone: '', mapcode: '', tips: ['重要預約代號: USJ-EXPRESS-4', '必買伴手禮: 瑪利歐賽車週邊'], notes: '全天暢玩環球影城', img: '' }
  ],
  7: [
    { id: 'i701', cat: '交通', title: '關西機場 (KIX) → 香港 (HKG)', startTime: '20:40', endTime: '23:50', loc: 'KIX Airport', phone: '', mapcode: '', tips: ['UO689', '提前2.5小時報到'], notes: '順利賦歸', img: '' }
  ]
};

// 住宿資料庫
let hotelData = [
  { id: 'h1', cat: 'Hotel', name: 'Fav Hotel Takamatsu', dayText: 'Day 1 (10/13)', checkIn: '15:00', checkOut: '10:00', confNo: 'FAV-8829', mapcode: '60 607 301*65', phone: '+81 87-802-1234', tips: ['櫃檯服務至22:00', '需現場支付住宿稅'], roomType: '雙人房/高樓層禁菸', notes: '香川県高松市塩上町２丁目４−２０', img: '' },
  { id: 'h2', cat: 'Airbnb', name: 'Yado Storo (岡山玉野)', dayText: 'Day 3 (10/15)', checkIn: '16:00', checkOut: '11:00', confNo: 'HM-9921', mapcode: '19 082 173*77', phone: '+81 863-31-0000', tips: ['自助入住門鎖密碼由簡訊發送'], roomType: '包棟獨棟古民家', notes: '岡山県玉野市宇野2丁目4-8', img: '' }
];

// 記帳流水帳資料庫
let expenseData = [
  { id: 'e1', name: '一鶴骨付鳥晚餐', cat: '美食', amount: 4800 },
  { id: 'e2', name: '栗林公園入園門票+和船', cat: '景點', amount: 1220 },
  { id: 'e3', name: '高松5日自駕租車全包', cat: '交通', amount: 32000 }
];

// DOM 初始化
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderItinerary();
  renderHotels();
  renderExpenses();
});

// 主題切換
function setTheme(themeName) {
  currentTheme = themeName;
  document.body.className = `theme-${themeName}`;
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.classList.contains(`theme-${themeName}`));
  });
}

// 主選單切換
function switchNav(navId) {
  currentNav = navId;
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(`tab-${navId}`).classList.add('active');

  // FAB 浮動按鈕只在 行程 與 住宿 頁面顯示
  const fab = document.getElementById('fabAddBtn');
  if (navId === 'itinerary' || navId === 'hotel') {
    fab.style.display = 'flex';
  } else {
    fab.style.display = 'none';
  }
}

// 首頁 Sub-mode 切換 (入境/自駕)
function switchSubMode(mode) {
  document.getElementById('btnModeEntry').classList.toggle('active', mode === 'entry');
  document.getElementById('btnModeDrive').classList.toggle('active', mode === 'drive');
  document.getElementById('mode-entry-content').style.display = mode === 'entry' ? 'block' : 'none';
  document.getElementById('mode-drive-content').style.display = mode === 'drive' ? 'block' : 'none';
}

// 首頁 航班 Tab 切換
function switchFlightTab(flightId) {
  document.querySelectorAll('.flight-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.flight-info-card').forEach(card => card.style.display = 'none');
  
  event.currentTarget.classList.add('active');
  document.getElementById(`flight-${flightId}`).style.display = 'block';
}

/* 匯率計算邏輯 */
function calcFromJPY(val) {
  const jpy = parseFloat(val) || 0;
  const hkd = (jpy * JPY_TO_HKD_RATE).toFixed(1);
  document.getElementById('hkdInput').value = jpy ? hkd : '';
  updateTaxFreeHint(jpy);
}

function calcFromHKD(val) {
  const hkd = parseFloat(val) || 0;
  const jpy = Math.round(hkd / JPY_TO_HKD_RATE);
  document.getElementById('jpyInput').value = hkd ? jpy : '';
  updateTaxFreeHint(jpy);
}

function resetCurrency() {
  document.getElementById('jpyInput').value = '';
  document.getElementById('hkdInput').value = '';
  updateTaxFreeHint(0);
}

function updateTaxFreeHint(jpy) {
  const hintEl = document.getElementById('taxFreeHint');
  if (jpy >= 5500) {
    hintEl.innerText = '✨已達免稅';
    hintEl.classList.add('reached');
  } else {
    const diff = 5500 - jpy;
    hintEl.innerText = `差 ¥${diff} 免稅`;
    hintEl.classList.remove('reached');
  }
}

/* 圖片上傳預覽通用函式 */
function triggerFileInput(inputId) {
  document.getElementById(inputId).click();
}

function previewImage(input, previewContainerId) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const container = document.getElementById(previewContainerId);
      container.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

function clearEntryImage() {
  document.getElementById('entryImgPreview').innerHTML = `<i data-lucide="image-plus" class="upload-icon"></i><span>點擊上載截圖</span>`;
  lucide.createIcons();
}

function clearDriveImage() {
  document.getElementById('driveImgPreview').innerHTML = `<i data-lucide="camera" class="upload-icon"></i><span>點擊上載截圖</span>`;
  lucide.createIcons();
}

function clearDriveData() {
  document.getElementById('parkingSpotText').value = '';
  clearDriveImage();
}

/* 行程 Rendering & Reorder */
function switchDay(dayNum) {
  currentDay = dayNum;
  document.querySelectorAll('.day-tab').forEach((tab, idx) => {
    tab.classList.toggle('active', (idx + 1) === dayNum);
  });
  renderItinerary();
}

function toggleReorderMode() {
  isReorderMode = !isReorderMode;
  const btn = document.getElementById('btnSortMgmt');
  btn.innerHTML = isReorderMode ? `<i data-lucide="check"></i> 完成排序` : `<i data-lucide="arrow-up-down"></i> 排序與管理`;
  lucide.createIcons();
  renderItinerary();
}

function renderItinerary() {
  const container = document.getElementById('itinerary-cards-container');
  const items = itineraryData[currentDay] || [];
  container.innerHTML = '';

  items.forEach((item, index) => {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'itin-card-wrapper';

    let reorderHtml = '';
    if (isReorderMode) {
      reorderHtml = `
        <div class="reorder-btns-col">
          <button class="btn-arrow-circle" onclick="moveItinItem(${index}, -1)"><i data-lucide="arrow-up"></i></button>
          <button class="btn-arrow-circle" onclick="moveItinItem(${index}, 1)"><i data-lucide="arrow-down"></i></button>
        </div>
      `;
    }

    let topActionIcon = isReorderMode 
      ? `<button class="icon-btn-delete" onclick="deleteItinCard('${item.id}')"><i data-lucide="trash-2"></i></button>`
      : `<button class="icon-btn-reset" onclick="openEditItineraryModal('${item.id}')"><i data-lucide="pencil"></i></button>`;

    let tipsHtml = (item.tips || []).map(t => `<span class="itin-tip-item">${t}</span>`).join(' ');
    let mapBtnHtml = `<button class="btn-nav-map" onclick="openGoogleMap('${item.loc || item.title}')"><i data-lucide="navigation"></i> 導航 (Google Maps)</button>`;

    cardWrapper.innerHTML = `
      ${reorderHtml}
      <div class="itin-card-main">
        <div class="itin-card-top">
          <span class="itin-time-badge">${item.startTime} ${item.endTime ? '- ' + item.endTime : ''}</span>
          <div class="flex-center" style="gap:8px;">
            <span class="itin-cat-tag">${getCatIcon(item.cat)} ${item.cat}</span>
            ${topActionIcon}
          </div>
        </div>
        <h3 class="itin-title">${item.title}</h3>
        ${item.loc ? `<div class="itin-detail-row"><i data-lucide="map-pin"></i> ${item.loc}</div>` : ''}
        ${item.phone ? `<div class="itin-detail-row"><i data-lucide="phone"></i> ${item.phone}</div>` : ''}
        ${item.mapcode ? `<div class="itin-mapcode-box">MAPCODE: ${item.mapcode}</div>` : ''}
        ${tipsHtml ? `<div class="itin-tips-list">${tipsHtml}</div>` : ''}
        ${item.notes ? `<div class="itin-notes">${item.notes}</div>` : ''}
        ${mapBtnHtml}
      </div>
    `;
    container.appendChild(cardWrapper);
  });
  lucide.createIcons();
}

function getCatIcon(cat) {
  switch(cat) {
    case '景點': return '📍';
    case '美食': return '🍽️';
    case '交通': return '🚗';
    case '住宿': return '🏨';
    case '活動': return '🎟️';
    default: return '📌';
  }
}

function moveItinItem(index, direction) {
  const list = itineraryData[currentDay];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= list.length) return;
  const temp = list[index];
  list[index] = list[targetIndex];
  list[targetIndex] = temp;
  renderItinerary();
}

function deleteItinCard(id) {
  itineraryData[currentDay] = itineraryData[currentDay].filter(item => item.id !== id);
  renderItinerary();
}

function openGoogleMap(query) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
}

/* Modal 行程編輯 */
function openEditItineraryModal(id) {
  currentEditingItinId = id;
  const item = (itineraryData[currentDay] || []).find(i => i.id === id);
  if (!item) return;

  document.getElementById('itineraryModalTitle').innerText = '編輯行程';
  document.getElementById('modalItinTitle').value = item.title;
  document.getElementById('modalItinLocation').value = item.loc;
  document.getElementById('modalItinStartTime').value = item.startTime;
  document.getElementById('modalItinEndTime').value = item.endTime;
  document.getElementById('modalItinMapcode').value = item.mapcode;
  document.getElementById('modalItinNotes').value = item.notes;

  // Tips
  const tipsContainer = document.getElementById('modalTipsContainer');
  tipsContainer.innerHTML = '';
  (item.tips || []).forEach(tip => addModalTipField(tip));

  document.getElementById('itineraryModal').classList.add('active');
}

function closeItineraryModal() {
  document.getElementById('itineraryModal').classList.remove('active');
}

function addModalTipField(val = '') {
  const container = document.getElementById('modalTipsContainer');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-text-standard modal-tip-input margin-top-xs';
  input.placeholder = '提醒內容 (如: 必吃美食、重要預約)';
  input.value = val;
  container.appendChild(input);
}

function selectModalCategory(btn) {
  document.querySelectorAll('#itineraryCategoryGroup .capsule-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function saveItineraryCard() {
  const activeCatBtn = document.querySelector('#itineraryCategoryGroup .capsule-tag.active');
  const cat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : '景點';
  
  const tipsInputs = document.querySelectorAll('#modalTipsContainer .modal-tip-input');
  const tips = Array.from(tipsInputs).map(i => i.value).filter(v => v.trim() !== '');

  if (currentEditingItinId) {
    let item = itineraryData[currentDay].find(i => i.id === currentEditingItinId);
    if (item) {
      item.cat = cat;
      item.title = document.getElementById('modalItinTitle').value;
      item.loc = document.getElementById('modalItinLocation').value;
      item.startTime = document.getElementById('modalItinStartTime').value;
      item.endTime = document.getElementById('modalItinEndTime').value;
      item.mapcode = document.getElementById('modalItinMapcode').value;
      item.notes = document.getElementById('modalItinNotes').value;
      item.tips = tips;
    }
  } else {
    // 新增
    const newItem = {
      id: 'i_' + Date.now(),
      cat: cat,
      title: document.getElementById('modalItinTitle').value || '新行程',
      loc: document.getElementById('modalItinLocation').value,
      startTime: document.getElementById('modalItinStartTime').value || '12:00',
      endTime: document.getElementById('modalItinEndTime').value || '13:00',
      mapcode: document.getElementById('modalItinMapcode').value,
      notes: document.getElementById('modalItinNotes').value,
      tips: tips
    };
    if (!itineraryData[currentDay]) itineraryData[currentDay] = [];
    itineraryData[currentDay].push(newItem);
  }

  closeItineraryModal();
  renderItinerary();
}

/* 住宿 Render & Edit */
function renderHotels() {
  const container = document.getElementById('hotel-cards-container');
  container.innerHTML = '';

  hotelData.forEach(hotel => {
    const card = document.createElement('div');
    card.className = 'hotel-card';
    
    let tipsHtml = (hotel.tips || []).map(t => `<span class="itin-tip-item" style="background:#FFE5EC;color:#E63946;">⚠️ ${t}</span>`).join(' ');

    card.innerHTML = `
      <div class="itin-card-top">
        <span class="hotel-day-badge">${hotel.dayText}</span>
        <div class="flex-center" style="gap:8px;">
          <span class="itin-cat-tag">🏨 ${hotel.cat}</span>
          <button class="icon-btn-reset" onclick="openEditHotelModal('${hotel.id}')"><i data-lucide="pencil"></i></button>
        </div>
      </div>
      <h3 class="itin-title">${hotel.name}</h3>
      <div class="itin-detail-row"><i data-lucide="clock"></i> Check-in: ${hotel.checkIn} / Check-out: ${hotel.checkOut}</div>
      ${hotel.confNo ? `<div class="itin-detail-row"><i data-lucide="file-text"></i> Conf No: <strong>${hotel.confNo}</strong></div>` : ''}
      ${hotel.phone ? `<div class="itin-detail-row"><i data-lucide="phone"></i> ${hotel.phone}</div>` : ''}
      ${hotel.mapcode ? `<div class="itin-mapcode-box">MAPCODE: ${hotel.mapcode}</div>` : ''}
      ${tipsHtml ? `<div class="itin-tips-list">${tipsHtml}</div>` : ''}
      ${hotel.roomType ? `<div class="itin-detail-row margin-top-xs">房型: ${hotel.roomType}</div>` : ''}
      ${hotel.notes ? `<div class="itin-notes">${hotel.notes}</div>` : ''}
      <button class="btn-nav-map" onclick="openGoogleMap('${hotel.name}')"><i data-lucide="navigation"></i> 導航至飯店</button>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function openEditHotelModal(id) {
  currentEditingHotelId = id;
  const hotel = hotelData.find(h => h.id === id);
  if (!hotel) return;

  document.getElementById('modalHotelName').value = hotel.name;
  document.getElementById('modalHotelDayText').value = hotel.dayText;
  document.getElementById('modalHotelCheckIn').value = hotel.checkIn;
  document.getElementById('modalHotelCheckOut').value = hotel.checkOut;
  document.getElementById('modalHotelConfNo').value = hotel.confNo;
  document.getElementById('modalHotelMapcode').value = hotel.mapcode;
  document.getElementById('modalHotelPhone').value = hotel.phone;
  document.getElementById('modalHotelRoomType').value = hotel.roomType;
  document.getElementById('modalHotelNotes').value = hotel.notes;

  const container = document.getElementById('modalHotelTipsContainer');
  container.innerHTML = '';
  (hotel.tips || []).forEach(t => addHotelModalTipField(t));

  document.getElementById('hotelModal').classList.add('active');
}

function closeHotelModal() {
  document.getElementById('hotelModal').classList.remove('active');
}

function addHotelModalTipField(val = '') {
  const container = document.getElementById('modalHotelTipsContainer');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input-text-standard modal-hotel-tip-input margin-top-xs';
  input.placeholder = '入住須知 (如: 需現場支付住宿稅)';
  input.value = val;
  container.appendChild(input);
}

function selectHotelCategory(btn) {
  document.querySelectorAll('#hotelCategoryGroup .capsule-tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function saveHotelCard() {
  const hotel = hotelData.find(h => h.id === currentEditingHotelId);
  if (hotel) {
    const activeCatBtn = document.querySelector('#hotelCategoryGroup .capsule-tag.active');
    hotel.cat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'Hotel';
    hotel.name = document.getElementById('modalHotelName').value;
    hotel.dayText = document.getElementById('modalHotelDayText').value;
    hotel.checkIn = document.getElementById('modalHotelCheckIn').value;
    hotel.checkOut = document.getElementById('modalHotelCheckOut').value;
    hotel.confNo = document.getElementById('modalHotelConfNo').value;
    hotel.mapcode = document.getElementById('modalHotelMapcode').value;
    hotel.phone = document.getElementById('modalHotelPhone').value;
    hotel.roomType = document.getElementById('modalHotelRoomType').value;
    hotel.notes = document.getElementById('modalHotelNotes').value;

    const tipsInputs = document.querySelectorAll('#modalHotelTipsContainer .modal-hotel-tip-input');
    hotel.tips = Array.from(tipsInputs).map(i => i.value).filter(v => v.trim() !== '');
  }
  closeHotelModal();
  renderHotels();
}

/* 記帳 functionality */
function renderExpenses() {
  const container = document.getElementById('expense-list-container');
  container.innerHTML = '';

  let totalJpy = 0;

  expenseData.forEach(exp => {
    totalJpy += exp.amount;

    const item = document.createElement('div');
    item.className = 'expense-card-item';
    item.innerHTML = `
      <div class="expense-left">
        <span class="expense-cat-pill">${exp.cat}</span>
        <span class="expense-name">${exp.name}</span>
      </div>
      <div class="expense-right">
        <span class="expense-amount">¥${exp.amount.toLocaleString()}</span>
        <button class="icon-btn-delete" onclick="deleteExpense('${exp.id}')"><i data-lucide="trash-2"></i></button>
      </div>
    `;
    container.appendChild(item);
  });

  const totalHkd = (totalJpy * JPY_TO_HKD_RATE).toFixed(1);
  document.getElementById('totalJpyValue').innerText = `¥${totalJpy.toLocaleString()}`;
  document.getElementById('totalHkdValue').innerText = `$${totalHkd}`;

  lucide.createIcons();
}

function addExpense() {
  const name = document.getElementById('expenseName').value;
  const cat = document.getElementById('expenseCategory').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);

  if (!name || isNaN(amount)) {
    alert('請輸入有效的項目名稱與金額');
    return;
  }

  expenseData.unshift({
    id: 'e_' + Date.now(),
    name: name,
    cat: cat,
    amount: amount
  });

  document.getElementById('expenseName').value = '';
  document.getElementById('expenseAmount').value = '';

  renderExpenses();
}

function deleteExpense(id) {
  expenseData = expenseData.filter(e => e.id !== id);
  renderExpenses();
}

/* FAB 按鈕點擊 handler */
function handleFabClick() {
  if (currentNav === 'itinerary') {
    currentEditingItinId = null;
    document.getElementById('itineraryModalTitle').innerText = '新增行程';
    document.getElementById('modalItinTitle').value = '';
    document.getElementById('modalItinLocation').value = '';
    document.getElementById('modalItinStartTime').value = '12:00';
    document.getElementById('modalItinEndTime').value = '13:00';
    document.getElementById('modalItinMapcode').value = '';
    document.getElementById('modalItinNotes').value = '';
    document.getElementById('modalTipsContainer').innerHTML = '';
    document.getElementById('itineraryModal').classList.add('active');
  } else if (currentNav === 'hotel') {
    alert('提示：請點選住宿卡片右上角的鉛筆圖示進行編輯內容。');
  }
}
