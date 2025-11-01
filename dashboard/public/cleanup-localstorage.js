// localStorage cleanup utility
// Run this in browser console if you encounter localStorage issues

console.log('🧹 Cleaning localStorage...');

// List current localStorage contents
console.log('📋 Current localStorage contents:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}

// Clean auth-related items
const authKeys = ['auth_token', 'auth_user'];
authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed ${key}`);
  } else {
    console.log(`ℹ️  ${key} not found`);
  }
});

console.log('🎉 localStorage cleanup complete! Refresh the page.');