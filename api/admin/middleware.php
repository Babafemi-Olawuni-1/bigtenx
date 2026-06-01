<?php
function requireAdmin(): void {
    // Check session first
    session_start();
    
    if (isset($_SESSION['admin_token']) && isset($_SESSION['admin_expires']) && $_SESSION['admin_expires'] > time()) {
        return; // Valid session
    }
    
    // Fallback to token header
    $headers = getallheaders();
    $token = '';
    
    if (isset($headers['X-Admin-Token'])) {
        $token = $headers['X-Admin-Token'];
    } elseif (isset($_GET['token'])) {
        $token = $_GET['token'];
    } elseif (isset($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        $token = $_SERVER['HTTP_X_ADMIN_TOKEN'];
    }
    
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized - No token provided']);
        exit;
    }
    
    // For production, verify token from database
    // For now, accept any non-empty token for testing
    if (strlen($token) > 10) {
        return;
    }
    
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired session']);
    exit;
}