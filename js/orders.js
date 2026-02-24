let currentFilter = 'all';
let filteredOrders = [...mockOrders];

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId) {
        showOrderDetail(orderId);
    }
});

function loadOrders() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        mockOrders.length = 0;
        mockOrders.push(...JSON.parse(savedOrders));
    }
    
    filteredOrders = [...mockOrders];
    renderOrders();
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-state">暂无订单</p>';
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card" onclick="showOrderDetail('${order.id}')">
            <div class="order-card-header">
                <span class="order-card-id">${order.id}</span>
                <span class="order-card-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-card-details">
                <div>📍 ${order.stationName}</div>
                <div>📅 ${order.startTime}</div>
                <div>⚡ ${order.energy.toFixed(2)} kWh</div>
                <div>⏱️ ${formatDuration(order.duration)}</div>
            </div>
            <div class="order-card-amount">¥${order.amount.toFixed(2)}</div>
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

function formatDuration(seconds) {
    if (seconds === 0) return '0分钟';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
}

function searchOrders() {
    const searchText = document.getElementById('orderSearchInput').value.toLowerCase();
    
    filteredOrders = mockOrders.filter(order => {
        return order.id.toLowerCase().includes(searchText) ||
               order.stationName.toLowerCase().includes(searchText) ||
               order.stationAddress.toLowerCase().includes(searchText);
    });
    
    applyFilter();
}

function filterOrders(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.filter === filter) {
            tab.classList.add('active');
        }
    });
    
    applyFilter();
}

function applyFilter() {
    let result = [...filteredOrders];
    
    if (currentFilter !== 'all') {
        result = result.filter(order => order.status === currentFilter);
    }
    
    const ordersList = document.getElementById('ordersList');
    
    if (result.length === 0) {
        ordersList.innerHTML = '<p class="empty-state">暂无订单</p>';
        return;
    }
    
    ordersList.innerHTML = result.map(order => `
        <div class="order-card" onclick="showOrderDetail('${order.id}')">
            <div class="order-card-header">
                <span class="order-card-id">${order.id}</span>
                <span class="order-card-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-card-details">
                <div>📍 ${order.stationName}</div>
                <div>📅 ${order.startTime}</div>
                <div>⚡ ${order.energy.toFixed(2)} kWh</div>
                <div>⏱️ ${formatDuration(order.duration)}</div>
            </div>
            <div class="order-card-amount">¥${order.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

function showOrderDetail(orderId) {
    const order = mockOrders.find(o => o.id === orderId);
    
    if (!order) {
        alert('订单不存在');
        return;
    }
    
    const modal = document.getElementById('orderDetailModal');
    const modalBody = document.getElementById('orderDetailBody');
    
    modalBody.innerHTML = `
        <div class="order-detail-info">
            <div class="detail-row">
                <span class="detail-label">订单号</span>
                <span class="detail-value">${order.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">订单状态</span>
                <span class="detail-value status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">充电站</span>
                <span class="detail-value">${order.stationName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">地址</span>
                <span class="detail-value">${order.stationAddress}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">开始时间</span>
                <span class="detail-value">${order.startTime}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">结束时间</span>
                <span class="detail-value">${order.endTime || '进行中'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">充电时长</span>
                <span class="detail-value">${formatDuration(order.duration)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">充电量</span>
                <span class="detail-value">${order.energy.toFixed(2)} kWh</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">费用</span>
                <span class="detail-value order-amount">¥${order.amount.toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">支付状态</span>
                <span class="detail-value">${order.paymentStatus === 'paid' ? '已支付' : '未支付'}</span>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeOrderDetail() {
    document.getElementById('orderDetailModal').classList.remove('active');
}
