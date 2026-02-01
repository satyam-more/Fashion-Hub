/**
 * Password Strength Checker
 * Evaluates password strength and provides feedback
 */

const checkPasswordStrength = (password) => {
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[@$!%*?&#^()_+=\-\[\]{}|\\:;"'<>,.\/~`]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }
  
  // Penalty for common patterns
  if (/^(.)\1+$/.test(password)) {
    score -= 2;
    feedback.push('Avoid repeating characters');
  }
  
  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    score -= 1;
    feedback.push('Avoid sequential characters');
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', 'Password1!', '12345678', 'Qwerty123!', 'Admin123!',
    'Welcome1!', 'Letmein1!', 'Password123!', 'Admin@123'
  ];
  
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
    score -= 3;
    feedback.push('Password is too common');
  }
  
  // Determine strength level
  let strength = 'weak';
  let color = '#dc2626'; // red
  
  if (score >= 7) {
    strength = 'strong';
    color = '#16a34a'; // green
  } else if (score >= 5) {
    strength = 'medium';
    color = '#f59e0b'; // orange
  }
  
  return {
    score: Math.max(0, Math.min(score, 10)), // Clamp between 0-10
    strength,
    color,
    feedback: feedback.length > 0 ? feedback : ['Password meets requirements'],
    isValid: score >= 5
  };
};

// Password policy requirements
const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&#^()_+=-[]{}|\\:;"\'<>,.\/~`',
  forbiddenPatterns: [
    'password',
    '12345678',
    'qwerty',
    'admin',
    'letmein',
    'welcome'
  ]
};

const getPasswordPolicyDescription = () => {
  return {
    requirements: [
      `Minimum ${passwordPolicy.minLength} characters`,
      `Maximum ${passwordPolicy.maxLength} characters`,
      'At least one uppercase letter (A-Z)',
      'At least one lowercase letter (a-z)',
      'At least one number (0-9)',
      `At least one special character (${passwordPolicy.specialChars})`,
      'Cannot be a common password',
      'Cannot contain only repeating characters'
    ],
    tips: [
      'Use a mix of letters, numbers, and symbols',
      'Avoid personal information',
      'Use a unique password for each account',
      'Consider using a passphrase',
      'Use a password manager'
    ]
  };
};

module.exports = {
  checkPasswordStrength,
  passwordPolicy,
  getPasswordPolicyDescription
};
