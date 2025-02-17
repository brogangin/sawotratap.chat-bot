import { floodDatas } from "/data/floodData.js";

const map = L.map("map-container").setView([-7.2575, 112.7521], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const commoditySelect = document.getElementById("commodity");

const addMarkers = (filter = "all") => {
    floodDatas.forEach((floodData) => {
        if (filter === "all" || floodData.komoditas === filter) {
            const marker = L.marker([floodData.koordinat.lat, floodData.koordinat.lng]).addTo(map);

            marker.bindPopup(`
                <strong>${floodData.nama_floodData}</strong><br>
                ${floodData.alamat}<br>
                Tingkat banjir : ${floodData.tingkat_banjir}
            `);
        }
    });
};

addMarkers();

commoditySelect.addEventListener("change", () => {
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const selectedCommodity = commoditySelect.value;
    addMarkers(selectedCommodity);
});
