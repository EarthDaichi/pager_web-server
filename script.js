const sendModeSelect = document.getElementById('sendModeSelect');
const targetContainer = document.getElementById('targetContainer');
const targetIdSelect = document.getElementById('targetIdSelect');
const customTargetContainer = document.getElementById('customTargetContainer');
const pagerForm = document.getElementById('pagerForm');
const submitBtn = document.getElementById('submitBtn');

// ควบคุมการแสดงผลเมื่อเปลี่ยนรูปแบบการส่ง
sendModeSelect.addEventListener('change', function() {
    if (this.value === '1_TO_ALL') {
        targetContainer.classList.add('hidden');
        customTargetContainer.classList.add('hidden');
    } else {
        targetContainer.classList.remove('hidden');
        if (targetIdSelect.value === 'OTHER') {
            customTargetContainer.classList.remove('hidden');
        }
    }
});

// ควบคุมการแสดงผลเมื่อเลือกรหัสเครื่องปลายทาง
targetIdSelect.addEventListener('change', function() {
    if (this.value === 'OTHER' && sendModeSelect.value === '1_TO_1') {
        customTargetContainer.classList.remove('hidden');
    } else {
        customTargetContainer.classList.add('hidden');
    }
});

// การทำงานเมื่อกดปุ่มส่งข้อความ
pagerForm.addEventListener('submit', function(e) {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

    // --- Logic การดึงค่าข้อมูล (เตรียมไว้ส่งเข้า ESP32/MQTT) ---
    const mode = sendModeSelect.value;
    let target = (mode === '1_TO_ALL') ? 'ทุกเครื่อง (ALL)' : targetIdSelect.value;
    if (target === 'OTHER') {
        target = document.getElementById('customTargetInput').value || 'ไม่ระบุ';
    }
    const msg = document.getElementById('messageInput').value;
    // --------------------------------------------------------

    // ล็อคปุ่มส่งชั่วคราว (Cooldown) กันกดซ้ำ
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> กำลังส่ง...`;

    // จำลองตอบกลับใน 1.5 วินาที
    setTimeout(() => {
        // คืนค่าปุ่มส่ง
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-satellite-dish me-2"></i> ส่งข้อความ`;
    }, 1500);
});
