let html5QrcodeScanner = null;

// 初始化充电桩数据
document.addEventListener('DOMContentLoaded', async function() {
    console.log('=== 扫码页面加载开始 ===');
    console.log('当前充电桩数量:', mockStations.length);
    
    try {
        await initStations();
        console.log('充电桩数据初始化完成，当前充电桩数量:', mockStations.length);
    } catch (error) {
        console.error('初始化充电桩数据失败:', error);
    }
    
    // 添加一些默认充电桩数据，确保扫码和手动输入能找到
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
        console.log('充电桩列表:', mockStations.map(s => ({id: s.id, name: s.name})));
    }
    
    console.log('=== 扫码页面加载完成 ===');
});

function startScan() {
    console.log('=== startScan 被调用 ===');
    
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');
    
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    
    console.log('startScan: 检查 Html5Qrcode 是否可用');
    if (typeof Html5Qrcode === 'undefined') {
        console.error('startScan: Html5Qrcode 未定义！');
        showCustomAlert('扫码库加载失败，请刷新页面重试');
        stopScan();
        return;
    }
    
    console.log('startScan: 创建 Html5Qrcode 实例');
    html5QrcodeScanner = new Html5Qrcode("reader");
    
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    console.log('startScan: 开始扫码，配置:', config);
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).then(() => {
        console.log('startScan: 扫码启动成功');
    }).catch(err => {
        console.error("启动扫码失败:", err);
        console.error("错误详情:", JSON.stringify(err));
        
        let errorMessage = "无法启动摄像头，请检查权限设置";
        
        if (err.name === 'NotAllowedError') {
            errorMessage = "摄像头权限被拒绝，请在浏览器设置中允许摄像头访问";
        } else if (err.name === 'NotFoundError') {
            errorMessage = "未找到摄像头设备";
        } else if (err.name === 'NotSupportedError') {
            errorMessage = "浏览器不支持摄像头访问";
        } else if (err.name === 'NotReadableError') {
            errorMessage = "摄像头被其他应用占用";
        }
        
        showCustomAlert(errorMessage);
        stopScan();
    });
}

function stopScan() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            html5QrcodeScanner = null;
        }).catch(err => {
            console.error("停止扫码失败:", err);
        });
    }
    
    document.getElementById('startScanBtn').style.display = 'inline-block';
    document.getElementById('stopScanBtn').style.display = 'none';
}

function onScanSuccess(decodedText, decodedResult) {
    console.log("扫码成功:", decodedText);
    
    stopScan();
    
    // 尝试找到对应的充电桩
    let station = mockStations.find(s => s.id === decodedText);
    
    // 如果没找到，使用默认充电桩
    if (!station) {
        // 模拟扫码成功，使用第一个充电桩
        station = mockStations[0];
    }
    
    goToPayment(station);
}

function onScanFailure(error) {
}

function manualInput() {
    console.log('=== 手动输入被调用 ===');
    const stationId = document.getElementById('stationIdInput').value.trim();
    
    console.log('输入的充电桩编号:', stationId);
    console.log('当前充电桩数量:', mockStations.length);
    
    if (!stationId) {
        console.log('充电桩编号为空，显示提示');
        showCustomAlert("请输入充电桩编号");
        return;
    }
    
    // 尝试找到对应的充电桩
    let station = mockStations.find(s => s.id === stationId);
    
    console.log('找到的充电桩:', station);
    
    // 如果没找到，使用默认充电桩
    if (!station) {
        console.log('未找到充电桩，使用默认充电桩');
        // 模拟输入成功，使用第一个充电桩
        station = mockStations[0];
    }
    
    console.log('准备跳转到支付页面，充电桩信息:', station);
    goToPayment(station);
}

function goToPayment(station) {
    console.log('=== goToPayment 被调用 ===');
    console.log('充电桩信息:', station);
    
    if (!station) {
        console.error('错误：充电桩信息为空！');
        showCustomAlert('充电桩信息错误，请重试');
        return;
    }
    
    const params = new URLSearchParams({
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        price: station.price
    });
    
    const url = `payment.html?${params.toString()}`;
    console.log('准备跳转到:', url);
    
    try {
        window.location.href = url;
        console.log('跳转命令已执行');
    } catch (error) {
        console.error('跳转失败:', error);
        showCustomAlert('页面跳转失败，请重试');
    }
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
