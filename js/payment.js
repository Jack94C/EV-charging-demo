let currentStation = null;

document.addEventListener('DOMContentLoaded', function() {
    loadStationInfo();
    setupPaymentMethodSelection();
});

function loadStationInfo() {
    const params = new URLSearchParams(window.location.search);
    
    currentStation = {
        id: params.get('stationId'),
        name: params.get('stationName'),
        address: params.get('stationAddress'),
        price: parseFloat(params.get('price')) || 1.2
    };
    
    document.getElementById('stationId').textContent = currentStation.id;
    document.getElementById('stationName').textContent = currentStation.name;
    document.getElementById('stationAddress').textContent = currentStation.address;
    document.getElementById('price').textContent = `¥${currentStation.price.toFixed(2)}/kWh`;
}

function setupPaymentMethodSelection() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
    });
}

function confirmPayment() {
    const payButton = document.getElementById('payButton');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    payButton.disabled = true;
    payButton.textContent = '支付中...';
    
    setTimeout(() => {
        payButton.textContent = '支付成功！';
        payButton.style.background = '#28a745';
        
        setTimeout(() => {
            createOrder();
            goToCharging();
        }, 1000);
    }, 2000);
}

function createOrder() {
    const station = mockStations.find(s => s.id === currentStation.id);
    const districtCode = station ? station.districtCode || '110000' : '110000';
    const orderId = generateOrderId(districtCode);
    
    const newOrder = {
        id: orderId,
        userId: mockUser.id,
        stationId: currentStation.id,
        stationName: currentStation.name,
        stationAddress: currentStation.address,
        startTime: new Date().toLocaleString('zh-CN'),
        endTime: null,
        duration: 0,
        energy: 0,
        amount: 50.00,
        status: 'charging',
        paymentStatus: 'paid',
        createdAt: new Date().toLocaleString('zh-CN')
    };
    
    mockOrders.unshift(newOrder);
    
    currentChargingSession.orderId = orderId;
    currentChargingSession.stationId = currentStation.id;
    currentChargingSession.startTime = new Date();
    currentChargingSession.status = 'charging';
    
    localStorage.setItem('currentChargingSession', JSON.stringify(currentChargingSession));
    localStorage.setItem('orders', JSON.stringify(mockOrders));
}

function goToCharging() {
    window.location.href = 'charging.html';
}
