document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadStats();
});

function loadUserInfo() {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profilePhone').textContent = user.phone;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileAvatar').src = user.avatar;
    } else {
        document.getElementById('profileName').textContent = mockUser.name;
        document.getElementById('profilePhone').textContent = mockUser.phone;
        document.getElementById('profileEmail').textContent = mockUser.email;
        document.getElementById('profileAvatar').src = mockUser.avatar;
    }
}

function loadStats() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        
        const totalOrders = orders.length;
        const totalEnergy = orders.reduce((sum, order) => sum + order.energy, 0);
        const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
        
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('totalEnergy').textContent = totalEnergy.toFixed(1);
        document.getElementById('totalAmount').textContent = `¥${totalAmount.toFixed(2)}`;
    } else {
        document.getElementById('totalOrders').textContent = mockUser.totalOrders;
        document.getElementById('totalEnergy').textContent = mockUser.totalEnergy.toFixed(1);
        document.getElementById('totalAmount').textContent = `¥${mockUser.totalAmount.toFixed(2)}`;
    }
}

function editAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('图片大小不能超过2MB');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                alert('只支持JPG、PNG、GIF格式的图片');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(event) {
                const avatarUrl = event.target.result;
                document.getElementById('profileAvatar').src = avatarUrl;
                
                const savedUser = localStorage.getItem('userInfo');
                let user = savedUser ? JSON.parse(savedUser) : {...mockUser};
                user.avatar = avatarUrl;
                localStorage.setItem('userInfo', JSON.stringify(user));
                
                alert('头像更换成功');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function editProfile() {
    const modal = document.getElementById('profileEditModal');
    
    const savedUser = localStorage.getItem('userInfo');
    const user = savedUser ? JSON.parse(savedUser) : mockUser;
    
    document.getElementById('editName').value = user.name;
    document.getElementById('editPhone').value = user.phone.replace(/\*/g, '8');
    document.getElementById('editEmail').value = user.email;
    
    modal.classList.add('active');
}

function closeProfileEdit() {
    document.getElementById('profileEditModal').classList.remove('active');
}

function saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    
    if (!name || !phone || !email) {
        alert('请填写完整信息');
        return;
    }
    
    const savedUser = localStorage.getItem('userInfo');
    let user = savedUser ? JSON.parse(savedUser) : {...mockUser};
    
    user.name = name;
    user.phone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    user.email = email;
    
    localStorage.setItem('userInfo', JSON.stringify(user));
    
    loadUserInfo();
    closeProfileEdit();
    
    alert('资料保存成功');
}

function showBalance() {
    const savedUser = localStorage.getItem('userInfo');
    const user = savedUser ? JSON.parse(savedUser) : mockUser;
    alert(`当前余额: ¥${user.balance.toFixed(2)}\n\n充值功能待开发`);
}

function showCoupons() {
    alert('优惠券功能待开发');
}

function showVehicles() {
    alert('我的车辆功能待开发');
}

function showSettings() {
    alert('设置功能待开发');
}

function showHelp() {
    alert('帮助中心\n\n常见问题：\n1. 如何开始充电？\n   点击"扫码充电"或选择附近电站\n\n2. 如何支付？\n   支持微信、支付宝、余额支付\n\n3. 充电费用如何计算？\n   按实际充电量 × 单价计算\n\n4. 如何联系客服？\n   客服电话: 400-123-4567');
}

function showAbout() {
    alert('关于我们\n\n电动车充电助手 v1.0.0\n\n一款便捷的电动车充电管理应用\n\n由首经贸充电桩小组成员开发');
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.clear();
        alert('已退出登录');
        window.location.href = 'index.html';
    }
}
