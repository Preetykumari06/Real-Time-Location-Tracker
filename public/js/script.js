const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit("send-location", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    (error) => {
      console.error("Unable to retrieve your location", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap"
}).addTo(map);

const markers = {};

// Get all active users when connected
socket.on("active-users", (users) => {
  Object.values(users).forEach(({ id, latitude, longitude }) => {
    if (!markers[id]) {
      markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
  });
});

// Update location when received
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude]);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

// Remove marker when user disconnects
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
