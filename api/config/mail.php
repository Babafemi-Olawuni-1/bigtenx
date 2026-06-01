<?php
require_once __DIR__ . '/../vendor/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../vendor/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sendVerificationEmail($toEmail, $username, $verificationToken) {
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host       = 'mail.bigtenx.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'noreply@bigtenx.com';
        $mail->Password   = 'Airdrop1234@';   password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        
        $mail->setFrom('noreply@bigtenx.com', 'BIGTENX');
        $mail->addAddress($toEmail, $username);
        
        $mail->isHTML(true);
        $mail->Subject = 'Verify Your Email - BIGTENX';
        
        $verifyLink = 'https://bigtenx.com/api/auth/verify_email.php?token=' . $verificationToken;
        
        $mail->Body = "
        <html>
        <body>
            <h2>Welcome to BIGTENX!</h2>
            <p>Hello <strong>$username</strong>,</p>
            <p>Please verify your email by clicking the link below:</p>
            <a href='$verifyLink'>Verify Email Address</a>
            <p>This link expires in 24 hours.</p>
        </body>
        </html>
        ";
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email failed: {$mail->ErrorInfo}");
        return false;
    }
}