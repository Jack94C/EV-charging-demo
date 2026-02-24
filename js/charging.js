let chargingInterval = null;
let chargingSeconds = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadChargingSession();
    startChargingSimulation();
});

function loadChargingSession() {
    try {
        const session = JSON.parse(localStorage.getItem('currentChargingSession'));
        
        if (!session || session.status !== 'charging') {
            alert('没有正在进行的充电订单');
            window.location.href = 'index.html';
            return;
        }
        
        currentChargingSession.orderId = session.orderId;
        currentChargingSession.stationId = session.stationId;
        currentChargingSession.startTime = new Date(session.startTime);
        currentChargingSession.energy = session.energy || 0;
        currentChargingSession.amount = session.amount || 0;
        currentChargingSession.status = session.status;
        
        const station = mockStations.find(s => s.id === currentChargingSession.stationId);
        if (station) {
            document.getElementById('chargingStationId').textContent = station.name;
        } else {
            alert('充电站信息不存在');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('加载充电会话失败:', error);
        alert('加载充电会话失败，请重新开始');
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
        alert('充电已暂停');
    }
}

function stopCharging() {
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
    
    alert(`充电完成！\n充电量: ${currentChargingSession.energy.toFixed(2)} kWh\n费用: ¥${currentChargingSession.amount.toFixed(2)}`);
    
    window.location.href = 'orders.html';
}
