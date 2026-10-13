/**
 * TIẾNG HÀN MR LEE — Cấu hình Web Firebase.
 * Dùng với auth-firebase.js và auth-status.js trên GitHub Pages.
 * Đây là cấu hình phía trình duyệt, KHÔNG phải khóa quản trị Firebase.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyAZU8pN7_Ha6rp6sT7olMxiW_boGwsYBBw",
  authDomain: "tieng-han-mr-lee.firebaseapp.com",
  projectId: "tieng-han-mr-lee",
  storageBucket: "tieng-han-mr-lee.firebasestorage.app",
  messagingSenderId: "1052440062089",
  appId: "1:1052440062089:web:1a8df27dca86e942193e58",
  measurementId: "G-4EK61ZS5KT"
};

export const isFirebaseConfigured =
  Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId) &&
  !Object.values(firebaseConfig).some(value => String(value).includes("THAY_BANG"));
