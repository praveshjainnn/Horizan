async function loadMapData(map) {
  try {
    // Load static data from mapData.json
    const res = await fetch('../data/mapData.json');
    const staticData = await res.json();

    // Load dynamic check-ins from localStorage
    const localData = JSON.parse(localStorage.getItem('checkins') || '[]');

    // Combine both sources
    const combinedData = [...staticData, ...localData];

    combinedData.forEach(point => {
      let color = point.color === 'green' ? 'green' :
                  point.color === 'yellow' ? 'orange' :
                  point.color === 'orange' ? 'orange' : 'red';

      const marker = L.circleMarker(point.coords, {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`<strong>${point.location}</strong><br>Mood: ${point.mood}`);
    });

  } catch (error) {
    console.error("Error loading map data:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Try to get user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const map = L.map('map').setView([userLat, userLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        loadMapData(map);
      },
      (error) => {
        console.warn("User denied location access or error occurred:", error.message);

        // Fallback to Delhi
        const map = L.map('map').setView([28.6139, 77.2090], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        loadMapData(map);
      }
    );
  } else {
    // Geolocation not supported
    alert("Geolocation is not supported by your browser.");
    const map = L.map('map').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    loadMapData(map);
  }
});
