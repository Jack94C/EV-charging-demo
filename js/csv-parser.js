function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const stations = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        if (values.length < headers.length) continue;
        
        const station = {
            id: values[0] || '',
            name: values[1] || '',
            type: values[2] || '',
            typeCode: values[3] || '',
            businessType: values[4] || '',
            longitudeGCJ02: parseFloat(values[5]) || 0,
            latitudeGCJ02: parseFloat(values[6]) || 0,
            longitudeWGS84: parseFloat(values[7]) || 0,
            latitudeWGS84: parseFloat(values[8]) || 0,
            provinceName: values[9] || '',
            cityName: values[10] || '',
            districtName: values[11] || '',
            detailedAddress: values[12] || '',
            postalCode: values[13] || '',
            contactPhone: values[14] || '',
            contactEmail: values[15] || '',
            officialWebsite: values[16] || '',
            provinceCode: values[17] || '',
            cityCode: values[18] || '',
            districtCode: values[19] || ''
        };
        
        if (station.id && station.longitudeGCJ02 && station.latitudeGCJ02) {
            stations.push(station);
        }
    }
    
    return stations;
}

function convertToAppFormat(stations) {
    return stations.map(station => {
        const isFastChargingStation = station.type && station.type.includes('快充');
        const basePrice = isFastChargingStation ? 1.5 : 1.0;
        const serviceFee = isFastChargingStation ? 0.5 : 0.3;
        const randomVariation = (Math.random() - 0.5) * 0.4;
        const totalPrice = basePrice + serviceFee + randomVariation;
        
        return {
            id: station.id,
            name: station.name.replace(/汽车充电站|充电站/g, '').trim(),
            address: station.detailedAddress || `${station.provinceName}${station.cityName}${station.districtName}`,
            latitudeGCJ02: station.latitudeGCJ02,
            longitudeGCJ02: station.longitudeGCJ02,
            distance: 0,
            availablePiles: Math.floor(Math.random() * 10) + 1,
            price: Math.max(0.8, Math.min(2.5, totalPrice)).toFixed(2),
            operatingHours: '24小时',
            facilities: ['快充', '慢充'],
            status: Math.random() > 0.3 ? 'available' : (Math.random() > 0.5 ? 'busy' : 'offline'),
            contactPhone: station.contactPhone,
            district: station.districtName,
            districtCode: station.districtCode
        };
    });
}

function filterBeijingStations(stations) {
    return stations.filter(station => 
        station.cityName === '北京市' || station.cityCode === '10'
    );
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function loadCSVData() {
    try {
        const response = await fetch('data/stations.csv');
        const csvText = await response.text();
        const parsedStations = parseCSV(csvText);
        const beijingStations = filterBeijingStations(parsedStations);
        const appStations = convertToAppFormat(beijingStations);
        
        return appStations;
    } catch (error) {
        console.error('加载CSV数据失败:', error);
        return [];
    }
}
