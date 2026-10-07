import * as api from './api.js';
document.addEventListener('DOMContentLoaded', async () => {

    await api.startMQTT();
    
    // ดึง DOM Elements จากหน้า HTML
    const sendModeSelect = document.getElementById('sendModeSelect');
    const targetContainer = document.getElementById('targetContainer');
    const targetIdSelect = document.getElementById('targetIdSelect');
    const selectbox = document.getElementById('selectbox');
    const customTargetContainer = document.getElementById('customTargetContainer');
    const customTargetInput = document.getElementById('customTargetInput');
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    const pagerForm = document.getElementById('pagerForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // Elements ของ Checkbox Dropdown
    const CheckBoxDropdown = document.getElementById('CheckBoxDropdown');
    const toggleDropdownBtn = document.getElementById('toggleDropdown');
    const checkboxDropdownMenu = document.getElementById('checkboxDropdownMenu');
    const chevronIcon = document.getElementById('chevronIcon');
    const selectedBadgesContainer = document.getElementById('selectedBadgesContainer');
    const dropdownLabelText = document.getElementById('dropdownLabelText');
    const targetCheckboxes = document.querySelectorAll('.target-checkbox');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // ซ่อน Dropdown ตั้งแต่เริ่มต้น
    CheckBoxDropdown.classList.add('hide');

    // ----------------------------------------------------
    // 1. ระบบนับตัวอักษร Real-time (สูงสุด 80 ตัวอักษร)
    // ----------------------------------------------------
    const MAX_CHARS = 80;
    messageInput.addEventListener('input', function() {
        const len = this.value.length;
        charCount.textContent = `${len} / ${MAX_CHARS} ตัวอักษร`;
        if (len >= MAX_CHARS) {
            charCount.classList.add('text-danger', 'fw-bold');
        } else {
            charCount.classList.remove('text-danger', 'fw-bold');
        }
    });

    // ----------------------------------------------------
    // 2. ระบบสั่งเปิด-ปิด Checkbox Dropdown (1:N / SOME)
    // ----------------------------------------------------
    function toggleDropdownMenu(show) {
        const isShow = show !== undefined ? show : !checkboxDropdownMenu.classList.contains('show');
        if (isShow) {
            checkboxDropdownMenu.classList.add('show');
            CheckBoxDropdown.classList.add('active');
            chevronIcon.classList.add('rotate');
        } else {
            checkboxDropdownMenu.classList.remove('show');
            CheckBoxDropdown.classList.remove('active');
            chevronIcon.classList.remove('rotate');
        }
    }

    toggleDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdownMenu();
    });

    // คลิกพื้นที่อื่นนอก Dropdown เพื่อปิดเมนู
    document.addEventListener('click', (e) => {
        if (!CheckBoxDropdown.contains(e.target)) {
            toggleDropdownMenu(false);
        }
    });

    // อัปเดตป้าย Badge แสดงเครื่องที่เลือก
    function updateSelectedBadges() {
        const selectedValues = Array.from(targetCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // ล้าง Badge เดิม
        selectedBadgesContainer.querySelectorAll('.badge-kmitl').forEach(badge => badge.remove());

        if (selectedValues.length === 0) {
            dropdownLabelText.style.display = 'inline';
        } else {
            dropdownLabelText.style.display = 'none';
            selectedValues.forEach(val => {
                const badge = document.createElement('span');
                badge.className = 'badge-kmitl';
                badge.textContent = val;
                selectedBadgesContainer.appendChild(badge);
            });
        }
    }

    targetCheckboxes.forEach(cb => cb.addEventListener('change', updateSelectedBadges));

    selectAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        targetCheckboxes.forEach(cb => cb.checked = true);
        updateSelectedBadges();
    });

    clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        targetCheckboxes.forEach(cb => cb.checked = false);
        updateSelectedBadges();
    });

    // ----------------------------------------------------
    // 3. ควบคุมการสลับโหมดการส่ง (1:1, 1:SOME, 1:ALL)
    // ----------------------------------------------------
    sendModeSelect.addEventListener('change', function() {
        targetContainer.classList.add('hidden');
        customTargetContainer.classList.add('hidden');
        toggleDropdownMenu(false);

        if (this.value === '1_TO_ALL') {
            // โหมดส่งหาทุกคน
            targetContainer.classList.add('hidden');
        } else if (this.value === '1_TO_SOME') {
            // โหมดส่งหาหลายคน (1:N)
            targetContainer.classList.remove('hidden');
            CheckBoxDropdown.classList.remove('hide');
            selectbox.classList.add('hide');
        } else {
            // โหมดส่งรายบุคคล (1:1)
            targetContainer.classList.remove('hidden');
            selectbox.classList.remove('hide');
            CheckBoxDropdown.classList.add('hide');

            if (targetIdSelect.value === 'OTHER') {
                customTargetContainer.classList.remove('hidden');
            }
        }
    });

    targetIdSelect.addEventListener('change', function() {
        if (this.value === 'OTHER' && sendModeSelect.value === '1_TO_1') {
            customTargetContainer.classList.remove('hidden');
        } else {
            customTargetContainer.classList.add('hidden');
        }
    });

    // ----------------------------------------------------
    // 4. ส่งข้อมูลเมื่อกด Submit
    // ----------------------------------------------------
    pagerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const mode = sendModeSelect.value;
        let sendToArray = [];

        if (mode === '1_TO_ALL') {
            sendToArray = ["ALL"];
        } else if (mode === '1_TO_SOME') {
            sendToArray = Array.from(targetCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (sendToArray.length === 0) {
                alert('กรุณาติ๊กเลือกเครื่องอย่างน้อย 1 เครื่อง');
                return;
            }
        } else if (mode === '1_TO_1') {
            let target = targetIdSelect.value;
            if (target === 'OTHER') {
                target = customTargetInput.value.trim() || 'UNKNOWN';
            }
            sendToArray = [target];
        }

        const msgContent = messageInput.value.trim();
        if (!msgContent) return;

        const payload = {
            sendTo: sendToArray,
            msg: msgContent
        };

        setLoadingState(true);
        const result = api.sendMessage(payload);
        console.log(result);
        setLoadingState(!result);
        resetFormState();
    });

    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.innerHTML = isLoading 
            ? `<i class="fa-solid fa-spinner fa-spin me-2"></i> กำลังส่ง...` 
            : `<i class="fa-solid fa-satellite-dish me-2"></i> ส่งข้อความ`;
    }

    function resetFormState() {
        pagerForm.reset();
        clearAllBtn.click();
        charCount.textContent = `0 / ${MAX_CHARS} ตัวอักษร`;
        charCount.classList.remove('text-danger', 'fw-bold');
        sendModeSelect.dispatchEvent(new Event('change'));
    }
});
