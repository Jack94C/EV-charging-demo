let html5QrcodeScanner = null;

function startScan() {
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');
    
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    
    html5QrcodeScanner = new Html5Qrcode("reader");
    
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error("启动扫码失败:", err);
        alert("无法启动摄像头，请检查权限设置");
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
    
    const station = mockStations.find(s => s.id === decodedText);
    
    if (station) {
        goToPayment(station);
    } else {
        alert("未找到该充电桩，请检查二维码是否正确");
    }
}

function onScanFailure(error) {
}

function manualInput() {
    const stationId = document.getElementById('stationIdInput').value.trim();
    
    if (!stationId) {
        alert("请输入充电桩编号");
        return;
    }
    
    const station = mockStations.find(s => s.id === stationId);
    
    if (station) {
        goToPayment(station);
    } else {
        alert("未找到该充电桩，请检查编号是否正确");
    }
}

function goToPayment(station) {
    const params = new URLSearchParams({
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        price: station.price
    });
    
    window.location.href = `payment.html?${params.toString()}`;
}
