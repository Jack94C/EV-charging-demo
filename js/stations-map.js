let map;
let markers = [];
let currentView = 'map';
let userLocation = null;
let selectedStation = null;
let filteredStations = [];

document.addEventListener('DOMContentLoaded', async function() {
    await initStations();
    filteredStations = [...mockStations];
    
    getUserLocation();
    initMap();
    
    const urlParams = new URLSearchParams(window.location.search);
    const stationId = urlParams.get('stationId');
    if (stationId) {
        setTimeout(() => {
            const station = mockStations.find(s => s.id === stationId);
            if (station) {
                showStationInfo(station);
            }
        }, 1000);
    }
});

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateDistances();
            },
            (error) => {
                console.log('获取位置失败:', error);
            }
        );
    }
}

function initMap() {
    map = new AMap.Map('map', {
        zoom: 12,
        center: [116.397428, 39.90923],
        mapStyle: 'amap://styles/whitesmoke',
        viewMode: '2D'
    });

    AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
    });

    addStationMarkers();
}

function addStationMarkers() {
    clearMarkers();
    
    let stationsToShow = [];
    
    if (filteredStations.length <= 100) {
        stationsToShow = [...filteredStations];
    } else {
        stationsToShow = getDistributedStations(filteredStations, 100);
    }
    
    stationsToShow.forEach(station => {
        const marker = createMarker(station);
        markers.push(marker);
        map.add(marker);
    });

    if (stationsToShow.length > 0) {
        map.setFitView();
    }
}

function getDistributedStations(stations, targetCount) {
    const groupedByDistrict = {};
    
    stations.forEach(station => {
        const district = station.district || '未知';
        if (!groupedByDistrict[district]) {
            groupedByDistrict[district] = [];
        }
        groupedByDistrict[district].push(station);
    });
    
    const districts = Object.keys(groupedByDistrict);
    const stationsPerDistrict = Math.ceil(targetCount / districts.length);
    
    let result = [];
    
    districts.forEach(district => {
        const districtStations = groupedByDistrict[district];
        const count = Math.min(stationsPerDistrict, districtStations.length);
        
        if (districtStations.length <= count) {
            result.push(...districtStations);
        } else {
            const step = Math.floor(districtStations.length / count);
            for (let i = 0; i < count; i++) {
                result.push(districtStations[i * step]);
            }
        }
    });
    
    return result.slice(0, targetCount);
}

function createMarker(station) {
    const statusColor = getStatusColor(station.status);
    
    const content = `
        <div style="
            width: 30px;
            height: 30px;
            background: ${statusColor};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        ">
            ⚡
        </div>
    `;

    const marker = new AMap.Marker({
        position: [station.longitudeGCJ02, station.latitudeGCJ02],
        content: content,
        offset: new AMap.Pixel(-15, -15),
        title: station.name
    });

    marker.on('click', () => {
        showStationInfo(station);
    });

    return marker;
}

function getStatusColor(status) {
    switch (status) {
        case 'available':
            return '#28a745';
        case 'busy':
            return '#ffc107';
        case 'offline':
            return '#dc3545';
        default:
            return '#6c757d';
    }
}

function showStationInfo(station) {
    selectedStation = station;
    
    document.getElementById('panelStationName').textContent = station.name;
    document.getElementById('panelAddress').textContent = station.address || '暂无地址';
    document.getElementById('panelDistance').textContent = formatDistance(station.distance);
    document.getElementById('panelAvailablePiles').textContent = station.availablePiles || 0;
    document.getElementById('panelPrice').textContent = `¥${(station.price || 1.2).toFixed(2)}/度`;
    
    document.getElementById('stationInfoPanel').style.display = 'block';
    
    map.setCenter([station.longitudeGCJ02, station.latitudeGCJ02]);
    map.setZoom(15);
}

function closePanel() {
    document.getElementById('stationInfoPanel').style.display = 'none';
    selectedStation = null;
}

function navigateToStation() {
    if (!selectedStation) return;
    
    if (userLocation) {
        const url = `https://uri.amap.com/navigation?from=${userLocation.lng},${userLocation.lat},我的位置&to=${selectedStation.longitudeGCJ02},${selectedStation.latitudeGCJ02},${selectedStation.name}&mode=car&policy=1&coordinate=gaode&callnative=1`;
        window.open(url, '_blank');
    } else {
        alert('请先允许获取您的位置信息');
    }
}

function startCharging() {
    if (!selectedStation) return;
    
    localStorage.setItem('selectedStation', JSON.stringify(selectedStation));
    window.location.href = 'payment.html';
}

function searchOnMap() {
    const searchText = document.getElementById('mapSearchInput').value.toLowerCase();
    
    if (!searchText) {
        filteredStations = [...mockStations];
    } else {
        filteredStations = mockStations.filter(station => {
            const nameMatch = station.name.toLowerCase().includes(searchText);
            const addressMatch = (station.address || '').toLowerCase().includes(searchText);
            return nameMatch || addressMatch;
        });
    }
    
    addStationMarkers();
}

function switchView(view) {
    currentView = view;
    
    document.getElementById('listViewBtn').classList.remove('active');
    document.getElementById('mapViewBtn').classList.remove('active');
    document.getElementById(`${view}ViewBtn`).classList.add('active');
    
    if (view === 'list') {
        window.location.href = 'stations.html';
    }
}

function goBack() {
    window.location.href = 'index.html';
}

function clearMarkers() {
    markers.forEach(marker => {
        map.remove(marker);
    });
    markers = [];
}

function updateDistances() {
    if (!userLocation) return;
    
    mockStations.forEach(station => {
        station.distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            station.latitudeGCJ02,
            station.longitudeGCJ02
        );
    });
    
    mockStations.sort((a, b) => a.distance - b.distance);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
}

function formatDistance(meters) {
    if (meters === 0) return '未知';
    if (meters < 1000) {
        return `${Math.round(meters)}米`;
    }
    return `${(meters / 1000).toFixed(1)}公里`;
}