let currentStation = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 支付页面加载 ===');
    loadStationInfo();
    setupPaymentMethodSelection();
});

function loadStationInfo() {
    console.log('loadStationInfo: 开始加载充电桩信息');
    const params = new URLSearchParams(window.location.search);
    
    console.log('loadStationInfo: URL 参数:', window.location.search);
    console.log('loadStationInfo: stationId =', params.get('stationId'));
    console.log('loadStationInfo: stationName =', params.get('stationName'));
    console.log('loadStationInfo: stationAddress =', params.get('stationAddress'));
    console.log('loadStationInfo: price =', params.get('price'));
    
    currentStation = {
        id: params.get('stationId'),
        name: params.get('stationName'),
        address: params.get('stationAddress'),
        price: parseFloat(params.get('price')) || 1.2
    };
    
    console.log('loadStationInfo: 解析后的充电桩信息:', currentStation);
    
    if (!currentStation.id) {
        console.error('loadStationInfo: 充电桩 ID 为空！');
        document.getElementById('stationId').textContent = '错误';
        return;
    }
    
    document.getElementById('stationId').textContent = currentStation.id;
    document.getElementById('stationName').textContent = currentStation.name;
    document.getElementById('stationAddress').textContent = currentStation.address;
    document.getElementById('price').textContent = `¥${currentStation.price.toFixed(2)}/kWh`;
    
    console.log('loadStationInfo: 充电桩信息已显示在页面上');
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
    console.log('=== confirmPayment 被调用 ===');
    
    const payButton = document.getElementById('payButton');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    console.log('confirmPayment: 支付方式 =', paymentMethod);
    console.log('confirmPayment: 当前充电桩 =', currentStation);
    
    if (!currentStation || !currentStation.id) {
        console.error('confirmPayment: 充电桩信息无效！');
        showCustomAlert('充电桩信息错误，请重新选择');
        return;
    }
    
    payButton.disabled = true;
    payButton.textContent = '支付中...';
    console.log('confirmPayment: 开始支付模拟');
    
    setTimeout(() => {
        console.log('confirmPayment: 支付成功');
        payButton.textContent = '支付成功！';
        payButton.style.background = '#28a745';
        
        setTimeout(() => {
            console.log('confirmPayment: 准备创建订单并跳转');
            createOrder();
            goToCharging();
        }, 1000);
    }, 2000);
}

function createOrder() {
    console.log('=== createOrder 被调用 ===');
    
    const station = mockStations.find(s => s.id === currentStation.id);
    const districtCode = station ? station.districtCode || '110000' : '110000';
    const orderId = generateOrderId(districtCode);
    
    console.log('createOrder: 订单ID =', orderId);
    console.log('createOrder: 充电桩ID =', currentStation.id);
    
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
    
    console.log('createOrder: 新订单 =', newOrder);
    
    mockOrders.unshift(newOrder);
    
    currentChargingSession.orderId = orderId;
    currentChargingSession.stationId = currentStation.id;
    currentChargingSession.startTime = new Date();
    currentChargingSession.status = 'charging';
    
    console.log('createOrder: 充电会话 =', currentChargingSession);
    
    localStorage.setItem('currentChargingSession', JSON.stringify(currentChargingSession));
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    
    console.log('createOrder: 订单和会话已保存到 localStorage');
}

function goToCharging() {
    console.log('=== goToCharging 被调用 ===');
    console.log('goToCharging: 准备跳转到 charging.html');
    window.location.href = 'charging.html';
}

// 自定义弹窗，只显示确定按钮
function showCustomAlert(message) {
    console.log('showCustomAlert: 显示弹窗 -', message);
    if (typeof CustomAlert === 'function') {
        CustomAlert(message);
    } else {
        console.log('showCustomAlert: 使用默认 alert');
        alert(message);
    }
}
