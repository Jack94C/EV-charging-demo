let filteredStations = [...mockStations];

document.addEventListener('DOMContentLoaded', async function() {
    await initStations();
    filteredStations = [...mockStations];
    renderStations();
});

function loadStations() {
    filteredStations = [...mockStations];
    renderStations();
}

function renderStations() {
    const stationsList = document.getElementById('stationsList');
    
    if (filteredStations.length === 0) {
        stationsList.innerHTML = '<p class="empty-state">未找到充电站</p>';
        return;
    }
    
    stationsList.innerHTML = filteredStations.map(station => `
        <div class="station-card" onclick="selectStation('${station.id}')">
            <div class="station-header">
                <div class="station-name">${station.name}</div>
                <div class="station-status status-${station.status}">${getStationStatusText(station.status)}</div>
            </div>
            <div class="station-info">
                <div>📍 ${station.address}</div>
                <div>📏 距离: ${formatDistance(station.distance)}</div>
                <div>🔌 可用: ${station.availablePiles || 0}</div>
                <div>💰 单价: ¥${station.price}/kWh</div>
                <div>⏰ ${station.operatingHours}</div>
            </div>
            <div class="station-actions">
                <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); goToPayment('${station.id}')">立即充电</button>
                <button class="btn btn-secondary btn-small" onclick="event.stopPropagation(); showNavigation('${station.id}')">导航</button>
            </div>
        </div>
    `).join('');
}

function formatDistance(meters) {
    if (meters === 0) return '未知';
    if (meters < 1000) {
        return `${Math.round(meters)}米`;
    }
    return `${(meters / 1000).toFixed(1)}公里`;
}

function getStationStatusText(status) {
    const statusMap = {
        'available': '可用',
        'busy': '忙碌',
        'offline': '离线'
    };
    return statusMap[status] || status;
}

function filterStations() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    filteredStations = mockStations.filter(station => {
        const matchSearch = station.name.toLowerCase().includes(searchText) || 
                           station.address.toLowerCase().includes(searchText);
        const matchStatus = statusFilter === 'all' || station.status === statusFilter;
        
        return matchSearch && matchStatus;
    });
    
    filteredStations.sort((a, b) => {
        switch(sortFilter) {
            case 'distance':
                return a.distance - b.distance;
            case 'price':
                return a.price - b.price;
            case 'available':
                return (b.availablePiles || 0) - (a.availablePiles || 0);
            default:
                return 0;
        }
    });
    
    renderStations();
}

function selectStation(stationId) {
    const station = mockStations.find(s => s.id === stationId);
    if (station) {
        alert(`充电站: ${station.name}\n地址: ${station.address}\n可用桩数: ${station.availableCount}/${station.totalCount}`);
    }
}

function goToPayment(stationId) {
    const station = mockStations.find(s => s.id === stationId);
    if (station) {
        const params = new URLSearchParams({
            stationId: station.id,
            stationName: station.name,
            stationAddress: station.address,
            price: station.price
        });
        
        window.location.href = `payment.html?${params.toString()}`;
    }
}

function showNavigation(stationId) {
    const station = mockStations.find(s => s.id === stationId);
    if (station) {
        window.location.href = `stations-map.html?stationId=${station.id}`;
    }
}
