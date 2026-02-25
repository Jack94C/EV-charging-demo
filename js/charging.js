let chargingInterval = null;
let chargingSeconds = 0;

// 初始化充电桩数据
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== 充电页面加载 ===');
    
    try {
        await initStations();
        console.log('充电桩数据初始化完成，当前充电桩数量:', mockStations.length);
    } catch (error) {
        console.error('初始化充电桩数据失败:', error);
    }
    
    // 添加一些默认充电桩数据，确保充电页面能找到
    if (mockStations.length === 0) {
        console.log('没有充电桩数据，添加默认数据...');
        mockStations.push(
            {
                id: 'B0FFI0YO72',
                name: '国家电网充电站(怀柔区长哨营政府)',
                address: '长哨营政府内地面停车场',
                price: 1.2,
                status: 'available',
                availablePiles: 5,
                operatingHours: '24小时',
                distance: 1000
            },
            {
                id: 'B0IUYLJ2VO',
                name: '国家电网汽车充电站(喇叭沟原始森林)',
                address: '高寒植物园停车场',
                price: 1.3,
                status: 'available',
                availablePiles: 3,
                operatingHours: '24小时',
                distance: 2000
            },
            {
                id: 'B0FFI0YO74',
                name: '国家电网汽车充电站(中榆店村)',
                address: '017县道北50米停车场',
                price: 1.1,
                status: 'available',
                availablePiles: 4,
                operatingHours: '24小时',
                distance: 1500
            }
        );
        console.log('默认充电桩数据添加完成，当前充电桩数量:', mockStations.length);
    }
    
    loadChargingSession();
    startChargingSimulation();
});

function loadChargingSession() {
    console.log('loadChargingSession: 开始加载充电会话');
    try {
        const session = JSON.parse(localStorage.getItem('currentChargingSession'));
        console.log('loadChargingSession: localStorage 中的会话 =', session);
        
        if (!session || session.status !== 'charging') {
            console.log('loadChargingSession: 没有正在进行的充电订单');
            showCustomAlert('没有正在进行的充电订单');
            window.location.href = 'index.html';
            return;
        }
        
        currentChargingSession.orderId = session.orderId;
        currentChargingSession.stationId = session.stationId;
        currentChargingSession.startTime = new Date(session.startTime);
        currentChargingSession.energy = session.energy || 0;
        currentChargingSession.amount = session.amount || 0;
        currentChargingSession.status = session.status;
        
        console.log('loadChargingSession: 充电会话已加载 =', currentChargingSession);
        
        const station = mockStations.find(s => s.id === currentChargingSession.stationId);
        console.log('loadChargingSession: 找到的充电桩 =', station);
        
        if (station) {
            document.getElementById('chargingStationId').textContent = station.name;
            console.log('loadChargingSession: 充电桩名称已显示');
        } else {
            console.error('loadChargingSession: 充电站信息不存在');
            showCustomAlert('充电站信息不存在');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('loadChargingSession: 加载充电会话失败:', error);
        showCustomAlert('加载充电会话失败，请重新开始');
        window.location.href = 'index.html';
    }
}

function startChargingSimulation() {
    chargingInterval = setInterval(() => {
        chargingSeconds++;
        
        const hours = Math.floor(chargingSeconds / 3600);
        const minutes = Math.floor((chargingSeconds % 3600) / 60);
        const seconds = chargingSeconds % 60;
        
        document.getElementById('chargingDuration').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        currentChargingSession.energy += 0.05;
        document.getElementById('chargingEnergy').textContent = 
            `${currentChargingSession.energy.toFixed(2)} kWh`;
        
        const station = mockStations.find(s => s.id === currentChargingSession.stationId);
        if (station) {
            currentChargingSession.amount = currentChargingSession.energy * station.price;
            document.getElementById('chargingAmount').textContent = 
                `¥${currentChargingSession.amount.toFixed(2)}`;
        }
        
        const progress = (currentChargingSession.energy / currentChargingSession.targetEnergy) * 100;
        document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('progressPercent').textContent = `${Math.min(progress, 100).toFixed(0)}%`;
        
        const remainingEnergy = currentChargingSession.targetEnergy - currentChargingSession.energy;
        const remainingSeconds = (remainingEnergy / 0.05);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);
        
        const now = new Date();
        now.setMinutes(now.getMinutes() + remainingMinutes);
        document.getElementById('estimatedTime').textContent = 
            `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (currentChargingSession.energy >= currentChargingSession.targetEnergy) {
            completeCharging();
        }
        
        localStorage.setItem('currentChargingSession', JSON.stringify(currentChargingSession));
        
    }, 1000);
}

function pauseCharging() {
    if (chargingInterval) {
        clearInterval(chargingInterval);
        chargingInterval = null;
        showCustomAlert('充电已暂停');
    }
}

function stopCharging() {
    // 使用自定义确认弹窗，只显示确定和取消按钮
    if (confirm('确定要结束充电吗？')) {
        if (chargingInterval) {
            clearInterval(chargingInterval);
        }
        
        completeCharging();
    }
}

function completeCharging() {
    if (chargingInterval) {
        clearInterval(chargingInterval);
    }
    
    const order = mockOrders.find(o => o.id === currentChargingSession.orderId);
    if (order) {
        order.endTime = new Date().toLocaleString('zh-CN');
        order.duration = chargingSeconds;
        order.energy = currentChargingSession.energy;
        order.amount = currentChargingSession.amount;
        order.status = 'completed';
    }
    
    currentChargingSession.status = 'completed';
    
    localStorage.setItem('orders', JSON.stringify(mockOrders));
    localStorage.setItem('currentChargingSession', JSON.stringify(currentChargingSession));
    
    showCustomAlert(`充电完成！\n充电量: ${currentChargingSession.energy.toFixed(2)} kWh\n费用: ¥${currentChargingSession.amount.toFixed(2)}`);
    
    window.location.href = 'orders.html';
}

// 自定义弹窗，只显示确定按钮
function showCustomAlert(message) {
    if (typeof CustomAlert === 'function') {
        CustomAlert(message);
    } else {
        // 如果没有自定义弹窗，使用默认alert，但在移动设备上会有确定和关闭按钮
        alert(message);
    }
}
