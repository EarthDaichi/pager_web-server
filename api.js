function loadMQTT() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/mqtt/dist/mqtt.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('โหลด MQTT.js ไม่สำเร็จ'));
        document.head.appendChild(script);
    });
}

let client;

export async function startMQTT() {
    await loadMQTT()
    const MQTT_BROKER = 'wss://s1ad7df7.ala.asia-southeast1.emqxsl.com:8084/mqtt';
    client = mqtt.connect(MQTT_BROKER, {
        username: 'Pager_Project',
        password: 'CE_05',
        clientId: 'web_pager_' + Math.random().toString(16).substring(2, 10)
    });

    client.on('connect', () => {
        console.log('MQTT Broker Connected');
    });

    client.on('error', () => {
        console.log('MQTT Connection Failed');
    });
}

export function sendMessage(data){
    client.publish(
            'Pager/webmsg/',
            (JSON.stringify(data))
        );
    console.log(data);
    return 1;
}
