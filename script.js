document.addEventListener('DOMContentLoaded', () => {

    // ====================================================
    // เมื่อเพื่อนฝั่ง Backend ทำเสร็จ ให้เปลี่ยน URL ตรงนี้
    // เช่น 'http://192.168.1.50/api.php'
    // ====================================================
    const api = 'wss://s1ad7df7.ala.asia-southeast1.emqxsl.com:8084/mqtt'; 

    // ดึง DOM Elements จากหน้า HTML
    const sendModeSelect = document.getElementById('sendModeSelect');
    const targetContainer = document.getElementById('targetContainer');
    const targetIdSelect = document.getElementById('targetIdSelect');
    const targetId = document.getElementById('targetId');
    const customTargetContainer = document.getElementById('customTargetContainer');
    const customTargetInput = document.getElementById('customTargetInput');
    const messageInput = document.getElementById('messageInput');
    const pagerForm = document.getElementById('pagerForm');
    const submitBtn = document.getElementById('submitBtn');
    const CheckBoxDropdown = document.getElementById('CheckBoxDropdown');
    const toggleDropdown = document.getElementById('toggleDropdown');
    CheckBoxDropdown.classList.add('hide');

    // 1. ควบคุมการแสดงผลเมื่อเปลี่ยนรูปแบบการส่ง (1:1 หรือ 1:ALL)
    sendModeSelect.addEventListener('change', function() {
        if (this.value === '1_TO_ALL') { //all
            targetContainer.classList.add('hidden');
        } else if (this.value === '1_TO_SOME') { //some
            targetContainer.classList.remove('hidden');
            CheckBoxDropdown.classList.remove('hide');
            targetIdSelect.classList.add('hide');
            toggleDropdown.addEventListener('click', function() {
                console.log("67")
            })
        } 
        else { //one
            targetContainer.classList.remove('hidden');
            targetIdSelect.classList.remove('hide');
            CheckBoxDropdown.classList.add('hide');
            if (targetIdSelect.value === 'OTHER') {
                customTargetContainer.classList.remove('hidden');
            }
        }
    });

    // 2. ควบคุมการแสดงผลเมื่อเลือกรหัสเครื่องปลายทาง
    targetIdSelect.addEventListener('change', function() {
        if (this.value === 'OTHER' && sendModeSelect.value === '1_TO_1') {
            customTargetContainer.classList.remove('hidden');
        } else {
            customTargetContainer.classList.add('hidden');
        }
    });

    // 3. ส่งข้อมูลหา Backend เมื่อกด Submit ปุ่มส่งข้อความ
    pagerForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช

        // คำนวณหา Target ID ที่ถูกต้อง
        const mode = sendModeSelect.value;
        let target = (mode === '1_TO_ALL') ? 'ALL' : targetIdSelect.value;
        if (mode === '1_TO_1' && target === 'OTHER') {
            target = customTargetInput.value.trim() || 'UNKNOWN';
        }

        // แพ็กข้อมูลใส่ FormData (ส่งแบบ Form ปกติ เพื่อให้ฝั่ง PHP / Backend ดึงข้อมูลง่ายๆ)
        const formData = new FormData();
        formData.append('mode', mode);
        formData.append('target_id', target);
        formData.append('message', messageInput.value.trim());

        // แสดงสถานะกำลังส่ง (เปลี่ยนปุ่มเป็นหมุนๆ)
        setLoadingState(true);
        console.log(formData);
        try {
            // ยิงข้อมูลไปยัง Backend ด้วยวิธี POST
            const response = await fetch(api, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP Status: ${response.status}`);
            }

            const result = await response.text();
            alert('ส่งข้อความสำเร็จ!');
            resetFormState();

        } catch (error) {
            console.error('Fetch Error:', error);
            alert(`ส่งไม่สำเร็จ: ${error.message}`);
        } finally {
            // คืนค่าปุ่มให้กลับมากดได้เหมือนเดิม
            setLoadingState(false);
        }
    });

    // ฟังก์ชันเปลี่ยนสถานะปุ่มกด (เปิด/ปิด สปินเนอร์หมุนๆ)
    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> กำลังส่ง...`;
        } else {
            submitBtn.innerHTML = `<i class="fa-solid fa-satellite-dish me-2"></i> ส่งข้อความ`;
        }
    }

    // ฟังก์ชันล้างค่าหน้าฟอร์มเมื่อส่งสำเร็จ
    function resetFormState() {
        pagerForm.reset();
        sendModeSelect.dispatchEvent(new Event('change'));
    }
});
