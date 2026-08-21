<?php

declare(strict_types=1);


/* =========================================================
   RESPONSE
========================================================= */

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');


function sendJson(
    bool $success,
    string $message,
    int $statusCode = 200
): never {
    http_response_code($statusCode);

    echo json_encode(
        [
            'success' => $success,
            'message' => $message,
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* =========================================================
   REQUEST METHOD
========================================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(
        false,
        'Method not allowed.',
        405
    );
}


/* =========================================================
   CONFIG
   Reads companyName + email directly from config/config.js
========================================================= */

$configPath = __DIR__ . '/config/config.js';

if (!is_file($configPath) || !is_readable($configPath)) {
    sendJson(
        false,
        'Website configuration could not be loaded.',
        500
    );
}


$configContents = file_get_contents($configPath);

if ($configContents === false) {
    sendJson(
        false,
        'Website configuration could not be loaded.',
        500
    );
}


/* Email */

$recipientEmail = '';

if (
    preg_match(
        '/\bemail\s*:\s*["\']([^"\']+)["\']/i',
        $configContents,
        $emailMatch
    )
) {
    $recipientEmail = trim($emailMatch[1]);
}


if (
    !$recipientEmail ||
    !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)
) {
    sendJson(
        false,
        'The website contact email is not configured correctly.',
        500
    );
}


/* Company name */

$companyName = 'Walk-In Tub Service';

if (
    preg_match(
        '/\bcompanyName\s*:\s*["\']([^"\']+)["\']/i',
        $configContents,
        $companyMatch
    )
) {
    $configuredCompanyName = trim($companyMatch[1]);

    if ($configuredCompanyName !== '') {
        $companyName = $configuredCompanyName;
    }
}


/* =========================================================
   HELPERS
========================================================= */

function cleanText(
    mixed $value,
    int $maxLength = 255
): string {
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);

    $value = str_replace(
        ["\0", "\r"],
        '',
        $value
    );

    $value = strip_tags($value);

    if (function_exists('mb_substr')) {
        return mb_substr(
            $value,
            0,
            $maxLength,
            'UTF-8'
        );
    }

    return substr(
        $value,
        0,
        $maxLength
    );
}


function cleanMultilineText(
    mixed $value,
    int $maxLength = 3000
): string {
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);

    $value = str_replace(
        ["\0", "\r"],
        '',
        $value
    );

    $value = strip_tags($value);

    if (function_exists('mb_substr')) {
        return mb_substr(
            $value,
            0,
            $maxLength,
            'UTF-8'
        );
    }

    return substr(
        $value,
        0,
        $maxLength
    );
}


/* =========================================================
   FORM VALUES
========================================================= */

$name = cleanText(
    $_POST['name'] ?? '',
    120
);

$email = cleanText(
    $_POST['email'] ?? '',
    254
);

$postcode = cleanText(
    $_POST['postcode'] ?? '',
    40
);

$service = cleanText(
    $_POST['service'] ?? '',
    80
);

$message = cleanMultilineText(
    $_POST['message'] ?? '',
    3000
);

$formSource = cleanText(
    $_POST['form_source'] ?? 'website',
    80
);


/* =========================================================
   VALIDATION
========================================================= */

if ($name === '') {
    sendJson(
        false,
        'Please enter your name.',
        422
    );
}


if (
    $email === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    sendJson(
        false,
        'Please enter a valid email address.',
        422
    );
}


$allowedServices = [
    'walk-in-tub' => 'Walk-in tub',
    'installation' => 'Walk-in tub installation',
    'replacement' => 'Walk-in tub replacement',
    'features' => 'Walk-in tub feature comparison',
];


if (
    $service === '' ||
    !array_key_exists($service, $allowedServices)
) {
    sendJson(
        false,
        'Please select what you are interested in.',
        422
    );
}


/*
 * Prevent email-header injection.
 */

if (
    preg_match('/[\r\n]/', $email) ||
    preg_match('/[\r\n]/', $name)
) {
    sendJson(
        false,
        'Invalid form data.',
        422
    );
}


/* =========================================================
   EMAIL CONTENT
========================================================= */

$serviceLabel = $allowedServices[$service];

$safeCompanyName = preg_replace(
    '/[\r\n]+/',
    ' ',
    $companyName
);

if (!$safeCompanyName) {
    $safeCompanyName = 'Walk-In Tub Service';
}


$subject = sprintf(
    'New website request — %s',
    $serviceLabel
);


$emailBody = implode(
    PHP_EOL,
    [
        'New website enquiry',
        '',
        'Website: ' . $safeCompanyName,
        'Form source: ' . $formSource,
        '',
        'Name: ' . $name,
        'Email: ' . $email,
        'ZIP / Postal code: ' . ($postcode !== '' ? $postcode : 'Not provided'),
        'Interested in: ' . $serviceLabel,
        '',
        'Project details:',
        $message !== '' ? $message : 'Not provided',
        '',
        '---',
        'Submitted: ' . date('Y-m-d H:i:s'),
    ]
);


/* =========================================================
   EMAIL HEADERS
========================================================= */

$encodedCompanyName = $safeCompanyName;

if (function_exists('mb_encode_mimeheader')) {
    $encodedCompanyName = mb_encode_mimeheader(
        $safeCompanyName,
        'UTF-8'
    );
}


$encodedSubject = $subject;

if (function_exists('mb_encode_mimeheader')) {
    $encodedSubject = mb_encode_mimeheader(
        $subject,
        'UTF-8'
    );
}


$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',

    sprintf(
        'From: %s Website <%s>',
        $encodedCompanyName,
        $recipientEmail
    ),

    sprintf(
        'Reply-To: %s <%s>',
        $name,
        $email
    ),

    'X-Mailer: PHP/' . phpversion(),
];


/* =========================================================
   SEND EMAIL
========================================================= */

$mailSent = mail(
    $recipientEmail,
    $encodedSubject,
    $emailBody,
    implode("\r\n", $headers)
);


if (!$mailSent) {
    sendJson(
        false,
        'Your request could not be sent right now. Please try again later.',
        500
    );
}


/* =========================================================
   SUCCESS
========================================================= */

sendJson(
    true,
    'Successfully sent. Thank you — we’ll get back to you by email.'
);
