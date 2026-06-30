/**
 * Validation Module
 * Client-side validation rules for all forms
 * Note: These are duplicated in Firestore Security Rules for server-side enforcement
 */

/**
 * Validate NIP format
 * @param {string} nip
 * @returns {{ valid: boolean, message: string }}
 */
export function validateNIP(nip) {
  if (!nip || typeof nip !== 'string') {
    return { valid: false, message: 'NIP wajib diisi' };
  }
  const cleaned = nip.trim();
  if (cleaned.length < 5 || cleaned.length > 30) {
    return { valid: false, message: 'NIP harus antara 5-30 karakter' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(cleaned)) {
    return { valid: false, message: 'NIP hanya boleh berisi huruf, angka, titik, underscore, dan strip' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password wajib diisi' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf kecil' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf besar' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password harus mengandung angka' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate rating value
 * @param {number} rating
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRating(rating) {
  if (typeof rating !== 'number' || !Number.isInteger(rating)) {
    return { valid: false, message: 'Rating harus berupa angka bulat' };
  }
  if (rating < 1 || rating > 5) {
    return { valid: false, message: 'Rating harus antara 1-5' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate comment/feedback text
 * @param {string} text
 * @returns {{ valid: boolean, message: string }}
 */
export function validateComment(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: 'Komentar wajib diisi' };
  }
  const cleaned = text.trim();
  if (cleaned.length < 3) {
    return { valid: false, message: 'Komentar minimal 3 karakter' };
  }
  if (cleaned.length > 500) {
    return { valid: false, message: 'Komentar maksimal 500 karakter' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate menu name
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function validateMenuName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Nama menu wajib diisi' };
  }
  const cleaned = name.trim();
  if (cleaned.length < 3) {
    return { valid: false, message: 'Nama menu minimal 3 karakter' };
  }
  if (cleaned.length > 100) {
    return { valid: false, message: 'Nama menu maksimal 100 karakter' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate nutrition value
 * @param {number} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message: string }}
 */
export function validateNutrition(value, fieldName) {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, message: `${fieldName} harus berupa angka` };
  }
  if (value < 0) {
    return { valid: false, message: `${fieldName} tidak boleh negatif` };
  }
  if (value > 10000) {
    return { valid: false, message: `${fieldName} tidak boleh lebih dari 10000` };
  }
  return { valid: true, message: '' };
}

/**
 * Validate image file
 * @param {File} file
 * @returns {{ valid: boolean, message: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, message: 'File gambar wajib dipilih' };
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Format gambar harus JPG, PNG, atau WebP' };
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, message: 'Ukuran gambar maksimal 5MB' };
  }
  return { valid: true, message: '' };
}
