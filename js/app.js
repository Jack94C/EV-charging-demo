document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadRecentOrders();
    initCustomAlert();
});

function loadUserInfo() {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').src = user.avatar;
    } else {
        document.getElementById('userName').textContent = mockUser.name;
        document.getElementById('userAvatar').src = mockUser.avatar;
    }
}

function loadRecentOrders() {
    const recentOrdersContainer = document.getElementById('recentOrders');
    const recentOrders = mockOrders.slice(0, 3);
    
    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="empty-state">暂无订单</p>';
        return;
    }
    
    recentOrdersContainer.innerHTML = recentOrders.map(order => `
        <div class="order-item" onclick="viewOrderDetail('${order.id}')">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-info">
                <span>${order.stationName}</span>
                <span class="order-amount">¥${order.amount.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'completed': '已完成',
        'charging': '充电中',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

function viewOrderDetail(orderId) {
    window.location.href = `orders.html?orderId=${orderId}`;
}

function initCustomAlert() {
    if (!document.getElementById('customAlert')) {
        const alertHtml = `
            <div id="customAlert" class="custom-alert">
                <div class="alert-content">
                    <div class="alert-message" id="alertMessage"></div>
                    <button class="btn btn-primary" onclick="closeCustomAlert()">确定</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', alertHtml);
    }
}

function showCustomAlert(message) {
    const alertElement = document.getElementById('customAlert');
    const messageElement = document.getElementById('alertMessage');
    
    if (alertElement && messageElement) {
        messageElement.textContent = message;
        alertElement.style.display = 'flex';
    } else {
        alert(message);
    }
}

function closeCustomAlert() {
    const alertElement = document.getElementById('customAlert');
    if (alertElement) {
        alertElement.style.display = 'none';
    }
}
