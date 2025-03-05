/* API 연계 START */
const CLIENT_ID = "c8d711dc82634030b278a15c3fc61d2d";
const CLIENT_SECRET = "10955bf5083b4c5c8fd51ddd71c2302f";

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token; // ✅ Access Token 반환
}

// artistName으로 아티스트 검색
const searchArtistID = async (artistName) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  // API 응답에서 아티스트 정보가 있는지 확인
  if (data && data.artists && data.artists.items && data.artists.items.length > 0) {
    const artistID = data.artists.items[0].id;
    const artistName = data.artists.items[0].name;
    const artistImage = data.artists.items[0].images[0]?.url || "기본 이미지 URL";

    // 아티스트 이미지 및 이름 업데이트
    document.getElementById('artist_img').src = artistImage;
    document.getElementById('artist_name').textContent = artistName;

    searchArtistInfo(artistID); // 아티스트 트랙 검색
  } else {
    console.error("아티스트를 찾을 수 없습니다.");
  }
};

// artistID로 아티스트 트랙 검색
const searchArtistInfo = async (artistID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=KR`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.tracks && data.tracks.length > 0) {
    const tracks = data.tracks;

    // 곡 리스트를 동적으로 추가
    const container = document.getElementById("artist_songs_container");
    container.innerHTML = ""; // 기존 트랙 초기화

    tracks.forEach((track) => {
      const trackElement = document.createElement("div");
      trackElement.classList.add("artist_song");

      trackElement.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}" class="track_image">
        <div class="artist_space">
          <div>${track.name}</div>
          <div>${track.artists.map(artist => artist.name).join(", ")}</div>
        </div>
        <div class="artist_time">${formatTrackDuration(track.duration_ms)}</div>
      `;

      container.appendChild(trackElement);
    });
  } else {
    console.error("아티스트의 트랙을 찾을 수 없습니다.");
  }
};

// 밀리초를 분:초 형식으로 변환하는 함수
const formatTrackDuration = (durationMs) => {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = ((durationMs % 60000) / 1000).toFixed(0);
  return `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
};

// 초기화
searchArtistID("g-dragon");  // "G-Dragon"을 검색하여 아티스트 정보를 표시
/* API 연계 END */
