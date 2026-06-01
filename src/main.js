import './style.css';
import { 
  redirectToSpotify, 
  exchangeCodeForToken, 
  getAccessToken, 
  fetchUserProfile, 
  fetchTopTracks, 
  logout 
} from './spotify';
import { exportElementAsImage } from './exporter';

// Default Client ID check from environment variables
const ENV_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';

// Generic placeholder tracks shown before user logs in
const MOCK_TRACKS = [
  { name: 'TRACK NAME 01', artists: [{ name: 'ARTIST 01' }], duration_ms: 210000 },
  { name: 'TRACK NAME 02', artists: [{ name: 'ARTIST 02' }], duration_ms: 185000 },
  { name: 'TRACK NAME 03', artists: [{ name: 'ARTIST 03' }], duration_ms: 240000 },
  { name: 'TRACK NAME 04', artists: [{ name: 'ARTIST 04' }], duration_ms: 195000 },
  { name: 'TRACK NAME 05', artists: [{ name: 'ARTIST 05' }], duration_ms: 220000 },
  { name: 'TRACK NAME 06', artists: [{ name: 'ARTIST 06' }], duration_ms: 175000 },
  { name: 'TRACK NAME 07', artists: [{ name: 'ARTIST 07' }], duration_ms: 205000 },
  { name: 'TRACK NAME 08', artists: [{ name: 'ARTIST 08' }], duration_ms: 230000 },
  { name: 'TRACK NAME 09', artists: [{ name: 'ARTIST 09' }], duration_ms: 190000 },
  { name: 'TRACK NAME 10', artists: [{ name: 'ARTIST 10' }], duration_ms: 215000 }
];

const MOCK_PROFILE = {
  display_name: 'TRAVELER / CHRIS MR',
  images: [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }]
};

// Application State
const state = {
  clientId: window.localStorage.getItem('spotify_client_id') || ENV_CLIENT_ID,
  isLoggedIn: false,
  token: null,
  userProfile: null,
  topTracks: [],
  timeRange: 'medium_term', // 'short_term' | 'medium_term' | 'long_term'
  theme: 'classic',         // 'classic' | 'midnight' | 'stark' | 'forest'
  customPassengerName: '',
  customSeat: '01A',
  isMockData: true,
  isLoading: false,
  errorMessage: ''
};

// SVG Icons (Plane & Other UI icons inlined to ensure html2canvas loads them natively)
const ICONS = {
  plane: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.8.3-2.1 1.2-.3.9.1 1.8 1 2.1l8 3.5-3.5 3.5-3.5-1-1.2.7.7 2.1 2.1.7.7-1.2-1-3.5 3.5-3.5 3.5 8c.3.9 1.2 1.3 2.1 1 .9-.3 1.4-1.2 1.2-2.1z"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  spotify: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.076-.336.135-.668.47-.743 3.856-.88 7.15-.51 9.822 1.13.296.18.387.563.206.858zm1.225-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.847-.107-.972-.52-.125-.413.107-.847.52-.972 3.67-1.114 8.24-.57 11.35 1.343.366.226.486.707.26 1.073zm.105-2.81c-3.26-1.937-8.64-2.12-11.75-1.176-.5.15-1.026-.135-1.177-.635-.15-.5.135-1.026.635-1.177 3.61-1.096 9.54-.886 13.3 1.346.45.267.6.843.333 1.293-.267.45-.843.6-1.29.333z"/></svg>`
};

// Barcode inline SVGs for perfect html2canvas capturing support
const BARCODES = {
  horizontal: `
    <svg class="barcode-horizontal" viewBox="0 0 100 20" preserveAspectRatio="none" style="fill: var(--barcode-color); width: 100%; height: 26px;">
      <rect x="0" width="3" height="20"/><rect x="5" width="1" height="20"/><rect x="7" width="2" height="20"/><rect x="11" width="4" height="20"/><rect x="17" width="1" height="20"/><rect x="19" width="3" height="20"/><rect x="24" width="2" height="20"/><rect x="28" width="1" height="20"/><rect x="30" width="4" height="20"/><rect x="36" width="2" height="20"/><rect x="39" width="3" height="20"/><rect x="44" width="1" height="20"/><rect x="47" width="2" height="20"/><rect x="51" width="4" height="20"/><rect x="57" width="1" height="20"/><rect x="60" width="3" height="20"/><rect x="65" width="2" height="20"/><rect x="69" width="1" height="20"/><rect x="72" width="4" height="20"/><rect x="78" width="2" height="20"/><rect x="82" width="3" height="20"/><rect x="87" width="1" height="20"/><rect x="89" width="2" height="20"/><rect x="93" width="4" height="20"/><rect x="98" width="2" height="20"/>
    </svg>
  `,
  vertical: `
    <svg class="barcode-vertical" viewBox="0 0 100 20" preserveAspectRatio="none" style="fill: var(--barcode-color); width: 100%; height: 36px;">
      <rect x="0" width="2" height="20"/><rect x="3" width="1" height="20"/><rect x="5" width="3" height="20"/><rect x="10" width="1" height="20"/><rect x="12" width="4" height="20"/><rect x="18" width="2" height="20"/><rect x="21" width="1" height="20"/><rect x="23" width="3" height="20"/><rect x="28" width="2" height="20"/><rect x="31" width="4" height="20"/><rect x="37" width="1" height="20"/><rect x="39" width="3" height="20"/><rect x="44" width="2" height="20"/><rect x="48" width="1" height="20"/><rect x="50" width="4" height="20"/><rect x="56" width="1" height="20"/><rect x="58" width="3" height="20"/><rect x="63" width="2" height="20"/><rect x="66" width="1" height="20"/><rect x="68" width="4" height="20"/><rect x="74" width="2" height="20"/><rect x="77" width="3" height="20"/><rect x="82" width="1" height="20"/><rect x="84" width="4" height="20"/><rect x="90" width="2" height="20"/><rect x="94" width="3" height="20"/><rect x="98" width="2" height="20"/>
    </svg>
  `
};

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Resizes and scales the boarding pass to perfectly fit mobile screen widths
function resizeCard() {
  const container = document.querySelector('.card-scroll-wrapper');
  const card = document.querySelector('.card-wrapper-shadow');
  if (!container || !card) return;
  
  const containerWidth = container.offsetWidth;
  const cardWidth = 780; // Fixed width of card
  
  if (containerWidth < cardWidth) {
    const scale = containerWidth / cardWidth;
    card.style.transform = `scale(${scale})`;
    // Keep it vertically aligned at the top during scaling
    card.style.transformOrigin = 'center top';
    // Shrink the height dynamically to prevent empty spaces beneath the scaled card
    container.style.height = `${440 * scale}px`;
  } else {
    card.style.transform = 'none';
    container.style.height = '460px'; // Reset to standard height
  }
}

const COUNTRY_NAMES = {
  TH: 'THAILAND',
  US: 'UNITED STATES',
  JP: 'JAPAN',
  KR: 'SOUTH KOREA',
  GB: 'UNITED KINGDOM',
  DE: 'GERMANY',
  FR: 'FRANCE',
  CA: 'CANADA',
  AU: 'AUSTRALIA',
  SG: 'SINGAPORE',
  MY: 'MALAYSIA',
  ID: 'INDONESIA',
  VN: 'VIETNAM',
  PH: 'PHILIPPINES',
  IN: 'INDIA',
  BR: 'BRAZIL',
  MX: 'MEXICO',
  ES: 'SPAIN',
  IT: 'ITALY',
  NL: 'NETHERLANDS',
  SE: 'SWEDEN',
  NO: 'NORWAY',
  FI: 'FINLAND',
  DK: 'DENMARK',
  NZ: 'NEW ZEALAND',
  HK: 'HONG KONG',
  TW: 'TAIWAN'
};

function getCountryName(code) {
  return COUNTRY_NAMES[code] || 'WORLD CITIZEN';
}

function detectUserCountry() {
  const locale = navigator.language || '';
  if (locale.includes('-')) {
    return locale.split('-')[1].toUpperCase();
  }
  if (locale.length === 2) {
    return locale.toUpperCase();
  }
  return 'US';
}

// Generate PNR / Flight details deterministically
function getTicketMetadata() {
  const user = state.isMockData ? MOCK_PROFILE.display_name : (state.userProfile?.display_name || 'TRAVELER');
  
  // Format user name like airline standard (LAST/FIRST MR)
  let formattedUser = user.toUpperCase();
  if (!formattedUser.includes('/') && formattedUser.split(' ').length > 1) {
    const parts = formattedUser.split(' ');
    formattedUser = `${parts[1]}/${parts[0]} MR`;
  }
  
  let gate = 'G12';
  let dateText = '01 JUN 26';
  let classText = 'PREMIUM CLASS';
  let pnr = 'S5N8C1'; // Deterministic booking reference
  
  if (state.timeRange === 'short_term') {
    gate = 'S04';
    classText = 'EXPRESS CLASS';
    pnr = 'SH4WKS';
  } else if (state.timeRange === 'medium_term') {
    gate = 'M06';
    classText = 'PREMIUM CLASS';
    pnr = 'MD6MTS';
  } else if (state.timeRange === 'long_term') {
    gate = 'L99';
    classText = 'FIRST CLASS';
    pnr = 'LGALLT';
  }

  // Easter egg: dynamically detect country code for destination
  const countryCode = state.isMockData ? detectUserCountry() : (state.userProfile?.country || 'US');
  const destCode = countryCode ? countryCode.toUpperCase().slice(0, 3) : 'TUN';
  const destCity = getCountryName(destCode);

  // Easter egg: dynamic barcode value showing the country code and a fun message
  const barcodeMainVal = `TKT-${destCode}-${pnr}-MUSIC-FLY`;

  return {
    passenger: state.customPassengerName || formattedUser,
    seat: state.customSeat || '01A',
    gate,
    dateText,
    classText,
    pnr,
    barcodeMainVal,
    destCode,
    destCity
  };
}

// Main HTML Generator
function renderApp() {
  const root = document.querySelector('#app');
  if (!root) return;

  const meta = getTicketMetadata();
  const tracksList = state.isMockData ? MOCK_TRACKS : state.topTracks;

  root.innerHTML = `
    <header>
      <div class="brand">
        <div class="brand-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1DB954" />
                <stop offset="100%" stop-color="#00b0ff" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="40" fill="url(#logoGrad)" opacity="0.1"/>
            <g fill="none" stroke="url(#logoGrad)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M45,70 L45,30 Q45,20 60,25 L75,30 M45,45 L70,40 M45,55 L65,52" />
              <circle cx="34" cy="70" r="11" fill="url(#logoGrad)" stroke="none" />
            </g>
          </svg>
        </div>
        <h1>TuneTicket</h1>
      </div>
      <p>Your musical journey, printed on a premium flight ticket. Safe client-side authorization, custom themes, and full multi-language support.</p>
    </header>

    <main class="dashboard">
      <!-- Left side: Clean controls panel -->
      <section class="controls-panel">
        
        <!-- Step 1: Spotify Auth -->
        <div class="panel-section">
          <h3>1. Spotify Account</h3>
          
          ${state.isLoggedIn ? `
            <div class="user-profile">
              <img class="user-avatar" src="${state.userProfile?.images?.[0]?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="Avatar">
              <div class="user-details">
                <span class="user-name">${state.userProfile?.display_name || 'Traveler'}</span>
                <span class="user-sub">${state.userProfile?.email || 'Connected'}</span>
              </div>
              <button id="logout-btn" class="btn btn-outline btn-logout" title="Logout">
                ${ICONS.logout}
              </button>
            </div>
          ` : `
            ${!ENV_CLIENT_ID ? `
              <div class="input-group">
                <label class="input-label" for="client-id-field">Spotify Client ID</label>
                <input type="text" id="client-id-field" class="input-field" placeholder="Enter your Spotify Client ID..." value="${state.clientId}">
                <p class="help-text">
                  Need a client ID? Check <a href="#explainer-sec">instructions below</a> to set up in 2 minutes. Authentication runs client-side only.
                </p>
              </div>
            ` : ''}
            
            <button id="login-btn" class="btn btn-spotify" ${!state.clientId ? 'disabled' : ''}>
              ${ICONS.spotify} Connect with Spotify
            </button>
          `}
        </div>

        <!-- Step 2: Flight Options -->
        <div class="panel-section">
          <h3>2. Ticket Details</h3>
          
          <div class="input-group">
            <span class="input-label">Flight Duration (Time Period)</span>
            <div class="tabs-selector">
              <button class="tab-btn ${state.timeRange === 'short_term' ? 'active' : ''}" data-range="short_term">4 Weeks</button>
              <button class="tab-btn ${state.timeRange === 'medium_term' ? 'active' : ''}" data-range="medium_term">6 Months</button>
              <button class="tab-btn ${state.timeRange === 'long_term' ? 'active' : ''}" data-range="long_term">All-Time</button>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label" for="passenger-name-field">Passenger Name Override</label>
            <input type="text" id="passenger-name-field" class="input-field" placeholder="e.g. SMITH / JOHN MR" value="${state.customPassengerName}">
          </div>

          <div class="input-group">
            <label class="input-label" for="seat-field">Seat Code</label>
            <input type="text" id="seat-field" class="input-field" placeholder="e.g. 01A" value="${state.customSeat}" maxlength="4">
          </div>
        </div>

        <!-- Step 3: Aesthetic Styles -->
        <div class="panel-section">
          <h3>3. Boarding Pass Style</h3>
          <div class="theme-picker">
            <button class="theme-btn ${state.theme === 'classic' ? 'active' : ''}" data-theme-val="classic">Classic</button>
            <button class="theme-btn ${state.theme === 'midnight' ? 'active' : ''}" data-theme-val="midnight">Midnight</button>
            <button class="theme-btn ${state.theme === 'stark' ? 'active' : ''}" data-theme-val="stark">Stark</button>
            <button class="theme-btn ${state.theme === 'forest' ? 'active' : ''}" data-theme-val="forest">Forest</button>
          </div>
        </div>

        <!-- Step 4: Export -->
        <div class="panel-section">
          <h3>4. Get Ticket</h3>
          <button id="download-btn" class="btn btn-spotify">
            ${ICONS.download} Save Boarding Pass
          </button>
        </div>

      </section>

      <!-- Right side: Realistic Visual Live Preview -->
      <section class="preview-container">
        
        <!-- Error notification if any -->
        ${state.errorMessage ? `
          <div class="error-container">
            ${ICONS.warning}
            <span>${state.errorMessage}</span>
          </div>
        ` : ''}

        ${state.isLoading ? `
          <div class="loading-container">
            <div class="spinner"></div>
            <p>Scanning flight pathways...</p>
          </div>
        ` : `
          <div class="card-scroll-wrapper">
            <div class="card-wrapper-shadow">
              <!-- The Boarding Pass component (Split: main ticket + passenger stub) -->
              <div class="boarding-pass" data-theme="${state.theme}">
                
                <!-- 1. LEFT SIDE: MAIN TICKET -->
                <div class="pass-main">
                  
                  <div class="header-row">
                    <div class="airline-info">
                      ${ICONS.plane}
                      <span class="airline-name">TUNETICKET AIRWAYS</span>
                    </div>
                    <span class="flight-class-badge">${meta.classText}</span>
                  </div>

                  <div class="route-row">
                    <div class="airport-info">
                      <span class="val-large">SPO</span>
                      <span class="airport-city">Spotify Hub</span>
                    </div>
                    
                    <div class="route-connector">
                      <div class="route-line-wrapper">
                        <span class="route-line"></span>
                        <span class="route-plane">${ICONS.plane}</span>
                      </div>
                      <span class="flight-duration-lbl">FLIGHT TT26</span>
                    </div>

                    <div class="airport-info" style="text-align: right;">
                       <span class="val-large">${meta.destCode}</span>
                       <span class="airport-city">${meta.destCity}</span>
                     </div>
                  </div>

                  <!-- Flight Detail Grid -->
                  <div class="data-matrix">
                    <div class="data-cell passenger-name">
                      <div class="lbl">Passenger Name</div>
                      <div class="val">${meta.passenger}</div>
                    </div>
                    <div class="data-cell">
                      <div class="lbl">Seat</div>
                      <div class="val" style="color: var(--accent-secondary);">${meta.seat}</div>
                    </div>
                    <div class="data-cell">
                      <div class="lbl">Date</div>
                      <div class="val">${meta.dateText}</div>
                    </div>
                    <div class="data-cell">
                      <div class="lbl">Gate</div>
                      <div class="val">${meta.gate}</div>
                    </div>
                    <div class="data-cell">
                      <div class="lbl">Boarding</div>
                      <div class="val" style="color: var(--accent-secondary);">12:00</div>
                    </div>
                    <div class="data-cell">
                      <div class="lbl">Zone</div>
                      <div class="val">ZONE 2</div>
                    </div>
                    <div class="data-cell">
                      <div class="lbl">Sequence</div>
                      <div class="val">001</div>
                    </div>
                  </div>

                  <!-- Left manifest: Top Tracks 01-05 -->
                  <div class="manifest-table">
                    <div class="manifest-title">Stopover Manifest / Flight Itinerary</div>
                    <div class="manifest-list">
                      ${tracksList.slice(0, 5).map((track, i) => `
                        <div class="manifest-row">
                          <span class="manifest-col-seq">${(i + 1).toString().padStart(2, '0')}</span>
                          <div class="manifest-col-desc">
                            <strong>${track.name}</strong> <span>- ${track.artists.map(a => a.name).join(', ')}</span>
                          </div>
                          <span class="manifest-col-carrier">SPOTIFY</span>
                          <span class="manifest-col-dur">${formatDuration(track.duration_ms)}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Bottom main footer barcode -->
                  <div class="pass-main-footer">
                    <div class="barcode-horizontal-box">
                      ${BARCODES.horizontal}
                      <span class="barcode-horizontal-num">${meta.barcodeMainVal}</span>
                    </div>
                    <span class="sec-pnr">PNR: ${meta.pnr}</span>
                  </div>

                </div>

                <!-- 2. RIGHT SIDE: PASSENGER STUB -->
                <div class="pass-stub">
                  
                  <div class="stub-header">
                    <span>PASSENGER STUB</span>
                    ${ICONS.plane}
                  </div>

                  <div class="stub-route">
                    <div>
                      <div class="val-large" style="font-size: 1.6rem; line-height:1;">SPO</div>
                      <div class="lbl" style="font-size:0.5rem;">Spotify Hub</div>
                    </div>
                    <span class="lbl" style="font-size:0.8rem; margin:0 0.25rem;">&gt;</span>
                    <div style="text-align: right;">
                      <div class="val-large" style="font-size: 1.6rem; line-height:1;">${meta.destCode}</div>
                      <div class="lbl" style="font-size:0.5rem;">${meta.destCity}</div>
                    </div>
                  </div>

                  <div class="stub-grid" style="margin-bottom: 0.5rem;">
                    <div class="cell-wide">
                      <div class="lbl">Passenger</div>
                      <div class="val" style="font-size: 0.72rem;">${meta.passenger}</div>
                    </div>
                    <div>
                      <div class="lbl">Seat</div>
                      <div class="val" style="font-size: 0.72rem; color: var(--accent-secondary);">${meta.seat}</div>
                    </div>
                    <div>
                      <div class="lbl">Gate</div>
                      <div class="val" style="font-size: 0.72rem;">${meta.gate}</div>
                    </div>
                    <div>
                      <div class="lbl">Flight</div>
                      <div class="val" style="font-size: 0.72rem;">SW26</div>
                    </div>
                    <div>
                      <div class="lbl">Seq</div>
                      <div class="val" style="font-size: 0.72rem;">001</div>
                    </div>
                  </div>

                  <!-- Right manifest: Connection Tracks 06-10 -->
                  <div class="stub-manifest-table" style="margin-top: 0.4rem; margin-bottom: auto; border-top: 1px solid var(--dotted-line-color); padding-top: 0.4rem; overflow: hidden;">
                    <div class="lbl" style="font-size: 0.55rem; font-weight: 850; color: var(--accent-secondary); margin-bottom: 0.3rem;">Connection Stops 06-10</div>
                    <div class="manifest-list" style="gap: 0.3rem;">
                      ${tracksList.slice(5, 10).map((track, i) => `
                        <div class="manifest-row" style="font-size: 0.65rem; height: 16px; display: flex; justify-content: space-between; font-weight: 700; align-items: center; overflow: hidden; line-height: 1;">
                          <span style="color: var(--accent-secondary); width: 14px; font-weight: 800;">${(i + 6).toString().padStart(2, '0')}</span>
                          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 0.25rem; text-align: left;">
                            <strong>${track.name}</strong> <span style="font-weight:500; color: var(--card-text-muted);">- ${track.artists[0].name}</span>
                          </span>
                          <span style="font-family: var(--font-mono); color: var(--card-text-muted); font-size: 0.6rem;">${formatDuration(track.duration_ms)}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <div class="barcode-vertical-box">
                    ${BARCODES.vertical}
                    <span class="barcode-vertical-num">*PNR-${meta.pnr}*</span>
                  </div>

                </div>

              </div>
            </div>
          </div>
        `}
      </section>
    </main>

    <!-- Detailed Instruction Panel -->
    ${!ENV_CLIENT_ID ? `
      <section class="explainer" id="explainer-sec">
        <h2>How to run this with your Spotify Developer Account</h2>
        <ol>
          <li>Log in to the <strong><a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">Spotify Developer Dashboard</a></strong>.</li>
          <li>Select <strong>Create App</strong> (Name it anything: e.g. <em>My Boarding Pass</em>).</li>
          <li>Configure the <strong>Redirect URI</strong> field to exactly match your current URL: 
            <code>${window.location.origin + window.location.pathname}</code>
          </li>
          <li>Enable <strong>Web API</strong> checkbox under settings and Save.</li>
          <li>Copy your <strong>Client ID</strong> from the app info, paste it in the sidebar box, and click <strong>Connect Spotify</strong>!</li>
        </ol>
      </section>
    ` : ''}
  `;

  bindEvents();
  
  // Calculate dynamic scale factor to make it responsive on page load
  resizeCard();
}

function bindEvents() {
  const idField = document.getElementById('client-id-field');
  if (idField) {
    idField.addEventListener('input', (e) => {
      state.clientId = e.target.value.trim();
      window.localStorage.setItem('spotify_client_id', state.clientId);
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) {
        loginBtn.disabled = !state.clientId;
      }
    });
  }

  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      if (!state.clientId) return;
      state.isLoading = true;
      renderApp();
      try {
        await redirectToSpotify(state.clientId);
      } catch (err) {
        state.errorMessage = err.message;
        state.isLoading = false;
        renderApp();
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      state.isLoggedIn = false;
      state.token = null;
      state.userProfile = null;
      state.topTracks = [];
      state.isMockData = true;
      state.errorMessage = '';
      renderApp();
    });
  }

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const range = e.target.getAttribute('data-range');
      if (range === state.timeRange) return;
      
      state.timeRange = range;
      
      if (range === 'short_term') state.customSeat = '22A';
      else if (range === 'medium_term') state.customSeat = '01A';
      else if (range === 'long_term') state.customSeat = '07F';

      if (!state.isMockData && state.token) {
        state.isLoading = true;
        renderApp();
        try {
          state.topTracks = await fetchTopTracks(state.token, state.timeRange);
          state.errorMessage = '';
        } catch (err) {
          state.errorMessage = 'Failed to fetch tracks for the selected time range.';
          console.error(err);
        } finally {
          state.isLoading = false;
        }
      }
      renderApp();
    });
  });

  const passNameField = document.getElementById('passenger-name-field');
  if (passNameField) {
    passNameField.addEventListener('input', (e) => {
      state.customPassengerName = e.target.value.toUpperCase();
      
      // Update values in real-time across both the main ticket and passenger stub
      const mainNameDisplay = document.querySelector('.pass-main .passenger-name .val');
      const stubNameDisplay = document.querySelector('.pass-stub .val');
      
      const fallback = state.isMockData ? MOCK_PROFILE.display_name : (state.userProfile?.display_name || 'TRAVELER');
      const targetText = state.customPassengerName || fallback;
      
      if (mainNameDisplay) mainNameDisplay.textContent = targetText;
      if (stubNameDisplay) stubNameDisplay.textContent = targetText;
    });
  }

  const seatField = document.getElementById('seat-field');
  if (seatField) {
    seatField.addEventListener('input', (e) => {
      state.customSeat = e.target.value.toUpperCase();
      
      // Update seat values in real-time on both main ticket and stub
      const mainSeatDisplay = document.querySelector('.pass-main .val[style*="accent-secondary"]');
      const stubSeatDisplay = document.querySelector('.pass-stub .val[style*="accent-secondary"]');
      
      const targetText = state.customSeat || '01A';
      if (mainSeatDisplay) mainSeatDisplay.textContent = targetText;
      if (stubSeatDisplay) stubSeatDisplay.textContent = targetText;
    });
  }

  const themeBtns = document.querySelectorAll('.theme-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const themeName = e.currentTarget.getAttribute('data-theme-val');
      state.theme = themeName;
      
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      const passCard = document.querySelector('.boarding-pass');
      if (passCard) {
        passCard.setAttribute('data-theme', themeName);
      }
    });
  });

  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const passCard = document.querySelector('.boarding-pass');
      if (!passCard) return;

      const oldBtnText = downloadBtn.innerHTML;
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;margin:0;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Saving...';
      
      try {
        const cleanName = (state.customPassengerName || (state.isMockData ? MOCK_PROFILE.display_name : state.userProfile?.display_name) || 'boardingpass')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');
        
        await exportElementAsImage(passCard, `tuneticket-boarding-pass-${cleanName}.png`);
        state.errorMessage = '';
      } catch (err) {
        state.errorMessage = err.message;
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = oldBtnText;
        renderApp();
      }
    });
  }
}

// Check tokens on redirect callback
async function initApp() {
  state.isLoading = true;
  renderApp();

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  try {
    if (code) {
      if (!state.clientId) {
        throw new Error('Spotify Client ID is required to authorize. Please configure it first.');
      }
      
      state.token = await exchangeCodeForToken(state.clientId, code);
      state.isLoggedIn = true;
      state.isMockData = false;

      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      if (state.clientId) {
        const token = await getAccessToken(state.clientId);
        if (token) {
          state.token = token;
          state.isLoggedIn = true;
          state.isMockData = false;
        }
      }
    }

    if (state.isLoggedIn && state.token) {
      const [profile, tracks] = await Promise.all([
        fetchUserProfile(state.token),
        fetchTopTracks(state.token, state.timeRange)
      ]);
      state.userProfile = profile;
      state.topTracks = tracks;
    }
  } catch (err) {
    state.errorMessage = err.message || 'An error occurred during authentication.';
    console.error(err);
    state.isMockData = true;
    state.isLoggedIn = false;
  } finally {
    state.isLoading = false;
    renderApp();
  }
}

// Hook resize observer for dynamic scale adjustments
window.addEventListener('resize', resizeCard);

initApp();
