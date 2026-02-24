const mockStations = [];

let orderCounter = 1;

function generateOrderId(districtCode) {
    const year = 2026;
    const code = districtCode || '110000';
    const sequence = String(orderCounter++).padStart(3, '0');
    return `${year}${code}${sequence}`;
}

const mockOrders = [
    {
        id: '20261161001',
        userId: 'U001',
        stationId: 'B0FFI0YO72',
        stationName: '国家电网充电站(怀柔区长哨营政府)',
        stationAddress: '长哨营政府内地面停车场',
        startTime: '2024-01-15 14:30:00',
        endTime: '2024-01-15 16:45:00',
        duration: 135,
        energy: 25.5,
        amount: 30.60,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-01-15 14:30:00'
    },
    {
        id: '20261161002',
        userId: 'U001',
        stationId: 'B0IUYLJ2VO',
        stationName: '国家电网汽车充电站(北京市怀柔区喇叭沟原始森林风景区)',
        stationAddress: '高寒植物园停车场',
        startTime: '2024-01-14 09:00:00',
        endTime: '2024-01-14 11:30:00',
        duration: 150,
        energy: 32.0,
        amount: 41.60,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-01-14 09:00:00'
    },
    {
        id: '20261161003',
        userId: 'U001',
        stationId: 'B0FFI0YO74',
        stationName: '国家电网汽车充电站(北京市怀柔区中榆店村)',
        stationAddress: '017县道北50米停车场(中榆树店村)',
        startTime: '2024-01-13 18:00:00',
        endTime: null,
        duration: 0,
        energy: 0,
        amount: 0,
        status: 'cancelled',
        paymentStatus: 'unpaid',
        createdAt: '2024-01-13 18:00:00'
    },
    {
        id: '20261161004',
        userId: 'U001',
        stationId: 'B0HK3UQ5Q7',
        stationName: '国家电网汽车充电站(北京市怀柔区汤河口)',
        stationAddress: '汤河口供电所',
        startTime: '2024-01-12 10:15:00',
        endTime: '2024-01-12 12:00:00',
        duration: 105,
        energy: 18.5,
        amount: 27.75,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-01-12 10:15:00'
    },
    {
        id: '20261161005',
        userId: 'U001',
        stationId: 'B0FFHJJ4VM',
        stationName: '特来电汽车充电站(特来电北京大石窑农家院充电站)',
        stationAddress: '琉璃庙镇狼虎哨村村委会东1000米',
        startTime: '2024-01-11 15:30:00',
        endTime: '2024-01-11 17:00:00',
        duration: 90,
        energy: 15.0,
        amount: 21.00,
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: '2024-01-11 15:30:00'
    }
];

const mockUser = {
    id: 'U001',
    name: '张三',
    phone: '138****8888',
    email: 'zhangsan@example.com',
    avatar: 'https://via.placeholder.com/80',
    balance: 500.00,
    totalOrders: 5,
    totalEnergy: 91.0,
    totalAmount: 120.95
};

const currentChargingSession = {
    orderId: null,
    stationId: null,
    startTime: null,
    energy: 0,
    amount: 0,
    targetEnergy: 50,
    status: 'idle'
};

let allStations = [];

async function initStations() {
    if (allStations.length === 0) {
        allStations = await loadCSVData();
        if (allStations.length > 0) {
            mockStations.length = 0;
            mockStations.push(...allStations.slice(0, 50));
        }
    }
    return mockStations;
}

async function getNearbyStations(lat, lon, radius = 10000) {
    await initStations();
    
    const nearbyStations = allStations.filter(station => {
        const distance = calculateDistance(lat, lon, station.latitude, station.longitude);
        station.distance = distance;
        return distance <= radius;
    });
    
    return nearbyStations.sort((a, b) => a.distance - b.distance);
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
