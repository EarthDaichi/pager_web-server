<?php

$data = json_decode(file_get_contents('php://input'), true);

$message = $data['message'] ?? '';
$sendMode = $data['send_mode'] ?? '';
$targetId = $data['target_id'] ?? '';

echo json_encode([
    'success' => true,
    'message' => $message,
    'send_mode' => $sendMode,
    'target_id' => $targetId
]);