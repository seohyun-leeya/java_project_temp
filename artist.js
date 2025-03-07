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
    artistAlbumList(artistID); // 아티스트 앨범 검색
  } else {
    console.error("아티스트를 찾을 수 없습니다.");
  }
};

// artistID로 아티스트 트랙 검색
const searchArtistInfo = async (artistID) => {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=us`;

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

      // 곡 제목이 10자를 초과하면 '...'으로 끝냄 (모바일에서만 적용)
      let trackName = track.name;
      if (window.innerWidth <= 768) {  // 모바일 화면일 경우
        trackName = track.name.length > 15 ? track.name.substring(0, 15) + "..." : track.name;
      }

      trackElement.innerHTML = `
        <img src="${track.album.images[0].url}" alt="${track.name}" class="track_image">
        <div class="artist_space">
          <div>${trackName}</div>
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

// artistID로 아티스트 앨범 검색 (여러 개의 앨범을 로드)
const artistAlbumList = async (artistID) => {
  const token = await getAccessToken();
  const limit = 10; // 한 번에 불러올 앨범 수
  let offset = 0; // 첫 번째 페이지의 offset 값

  // 여러 페이지에 걸쳐 앨범을 불러오기
  let hasMoreAlbums = true;
  const container = document.querySelector(".artist_feat_img");
  container.innerHTML = ""; // 기존 앨범 초기화

  while (hasMoreAlbums) {
    const url = `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=us&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const albums = data.items;

      albums.forEach((album) => {
        const albumElement = document.createElement("div");
        albumElement.classList.add("artist_feat_title");

        // 화면 크기(모바일) 확인 후, 앨범 제목을 자르도록 처리
        let albumTitle;
        if (window.innerWidth <= 768) {
          albumTitle = album.name.length > 20 ? album.name.substring(0, 20) + "..." : album.name; // 모바일 화면에서만 제목 잘림
        } else {
          albumTitle = album.name; // 데스크탑에서는 전체 제목을 그대로 표시
        }
        // 앨범 이미지와 제목을 표시
        albumElement.innerHTML = `
          <p><img class="artist_feat" src="${album.images[0].url}" alt="${album.name}" /></p>
          <div>${album.name}</div>
        `;

        container.appendChild(albumElement);
      });

      // 다음 페이지로 이동
      offset += limit;
    } else {
      hasMoreAlbums = false; // 더 이상 앨범이 없다면 종료
    }
  }
};


// 초기화
searchArtistID("샤이니");  // "G-Dragon"을 검색하여 아티스트 정보를 표시
/* API 연계 END */
