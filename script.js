//-- JavaScript สำหรับควบคุมระบบซ่อน/แสดง และจำลอง Log --

// ดึง Element จาก HTML มาเตรียมใช้งาน
const sendModeSelect = document.getElementById('sendModeSelect');
const targetContainer = document.getElementById('targetContainer');
const targetIdSelect = document.getElementById('targetIdSelect');
const customTargetContainer = document.getElementById('customTargetContainer');
const pagerForm = document.getElementById('pagerForm');
const submitBtn = document.getElementById('submitBtn');
const logConsole = document.getElementById('logConsole');
const clearLogBtn = document.getElementById('clearLogBtn');

function addLog(text, type = 'INFO') {
    const time = new Date().toLocaleTimeString();
    let colorClass = '#33ff77'; // สีเขียวปกติ
    if (type === 'SENDING') colorClass = '#ffcc00'; // สีเหลืองกำลังส่ง
    if (type === 'SUCCESS') colorClass = '#00ffff'; // สีฟ้าสำเร็จ

    const logLine = document.createElement('div');
    logLine.style.color = colorClass;
    logLine.innerText = `[${time}] [${type}] ${text}`;
    logConsole.appendChild(logLine);
    logConsole.scrollTop = logConsole.scrollHeight; // เลื่อน Log ลงล่างสุดอัตโนมัติ
}

// 1. Logic ซ่อน/แสดง กล่องเลือกเครื่อง (1:1 vs 1:ALL)
sendModeSelect.addEventListener('change', function() {
    if (this.value === '1_TO_ALL') {
        targetContainer.classList.add('hidden'); // ซ่อนกล่องรหัสเครื่อง
        customTargetContainer.classList.add('hidden'); // ซ่อนช่องระบุเองด้วย
    } else {
        targetContainer.classList.remove('hidden'); // โชว์กล่องรหัสเครื่อง
        if (targetIdSelect.value === 'OTHER') {
            customTargetContainer.classList.remove('hidden');
        }
    }
});

// 2. Logic ซ่อน/แสดง ช่องระบุเอง เมื่อเลือก 'อื่นๆ'
targetIdSelect.addEventListener('change', function() {
    if (this.value === 'OTHER' && sendModeSelect.value === '1_TO_1') {
        customTargetContainer.classList.remove('hidden');
    } else {
        customTargetContainer.classList.add('hidden');
    }
});

// 3. Logic เมื่อกดปุ่ม "ส่งข้อความ" (จำลองการทำงานของ Fetch API)
pagerForm.addEventListener('submit', function(e) {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

    const mode = sendModeSelect.value;
    let target = (mode === '1_TO_ALL') ? 'ทุกเครื่อง (ALL)' : targetIdSelect.value;
    if (target === 'OTHER') {
        target = document.getElementById('customTargetInput').value || 'ไม่ระบุ';
    }
    const msg = document.getElementById('messageInput').value;

    // ล็อคปุ่มส่งชั่วคราว (Cooldown) กันกดซ้ำ
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> กำลังส่ง...`;

    // แสดง Log: กำลังส่ง...
    addLog(`กำลังส่งข้อความ: "${msg}" ไปยัง [${target}]...`, 'SENDING');

    // จำลองว่าหลังบ้านตอบกลับมาใน 1.5 วินาที
    setTimeout(() => {
        // แสดง Log: ส่งสำเร็จ
        addLog(`ส่งข้อความสำเร็จ! (Message published to MQTT)`, 'SUCCESS');
        
        // คืนค่าปุ่มส่ง
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-satellite-dish me-2"></i> สั่งการ / ส่งข้อความ`;
    }, 1500);
});

// 4. ล้าง Log
clearLogBtn.addEventListener('click', function() {
    logConsole.innerHTML = '<div>[SYSTEM] ล้างข้อมูล Log เรียบร้อย</div>';
});
