// Spotify API PKCE Authentication and Fetching module

const SCOPES = 'user-read-private user-read-email user-top-read playlist-modify-public';

// Helper to generate a random string for the code verifier
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

// Helper to hash the code verifier (SHA-256)
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

// Helper to base64url encode the digest
function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Redirect the user to the Spotify authorization page
export async function redirectToSpotify(clientId) {
  const codeVerifier = generateRandomString(64);
  window.localStorage.setItem('spotify_code_verifier', codeVerifier);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);

  const redirectUri = window.location.origin + window.location.pathname;
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

// Exchange the authorization code for access and refresh tokens
export async function exchangeCodeForToken(clientId, code) {
  const codeVerifier = window.localStorage.getItem('spotify_code_verifier');
  const redirectUri = window.location.origin + window.location.pathname;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error_description || 'Failed to exchange token');
  }

  const data = await response.json();
  saveTokenData(data);
  return data.access_token;
}

// Refresh the access token using the refresh token
export async function refreshAccessToken(clientId) {
  const refreshToken = window.localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body
  });

  if (!response.ok) {
    // If the refresh token is invalid or expired, log the user out
    logout();
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  saveTokenData(data);
  return data.access_token;
}

// Check and return valid access token (refreshes if expired)
export async function getAccessToken(clientId) {
  const token = window.localStorage.getItem('spotify_access_token');
  const expiresAt = window.localStorage.getItem('spotify_token_expires_at');

  if (!token || !expiresAt) return null;

  // Refresh token if it expires in less than 5 minutes
  if (Date.now() > parseInt(expiresAt) - 5 * 60 * 1000) {
    try {
      return await refreshAccessToken(clientId);
    } catch (e) {
      console.error('Error refreshing token, signing out...', e);
      return null;
    }
  }

  return token;
}

function saveTokenData(data) {
  window.localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    window.localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  const expiresAt = Date.now() + data.expires_in * 1000;
  window.localStorage.setItem('spotify_token_expires_at', expiresAt.toString());
}

export function logout() {
  window.localStorage.removeItem('spotify_access_token');
  window.localStorage.removeItem('spotify_refresh_token');
  window.localStorage.removeItem('spotify_token_expires_at');
  window.localStorage.removeItem('spotify_code_verifier');
}

// Fetch user profile data
export async function fetchUserProfile(token) {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

// Fetch user's top tracks
// timeRange: 'short_term' (4 weeks), 'medium_term' (6 months), 'long_term' (all time)
export async function fetchTopTracks(token, timeRange = 'medium_term', limit = 10) {
  const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch top tracks');
  }

  const data = await response.json();
  return data.items;
}

// Create a new playlist containing the top tracks in the user's account
export async function createSpotifyPlaylist(token, userId, trackUris, timeRangeText = 'Medium Term') {
  // 1. Create the playlist
  const createResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `TuneTicket: My Top Tracks (${timeRangeText})`,
      description: `My top Spotify tracks boarding pass playlist generated by TuneTicket for ${timeRangeText}.`,
      public: true
    })
  });

  if (!createResponse.ok) {
    const errData = await createResponse.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to create Spotify playlist');
  }

  const playlist = await createResponse.json();

  // 2. Add tracks to the playlist
  const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: trackUris
    })
  });

  if (!addTracksResponse.ok) {
    const errData = await addTracksResponse.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to add tracks to playlist');
  }

  return playlist;
}
