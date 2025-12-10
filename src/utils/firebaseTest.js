// Firebase Configuration Test
// This file can be used to test Firebase configuration without running the full app

import { storage } from '../config/firebaseConfig';
import { calculateFileHash, validateFile } from '../services/firebaseStorageService';

// Test Firebase Storage connection
export const testFirebaseConnection = () => {
  try {
    console.log('Firebase Storage initialized:', !!storage);
    console.log('Storage bucket:', storage.bucket);
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};

// Test file validation
export const testFileValidation = () => {
  // Create a mock file for testing
  const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  
  const validation = validateFile(mockFile);
  console.log('File validation test:', validation);
  return validation.isValid;
};

// Test hash calculation
export const testHashCalculation = async () => {
  try {
    const mockFile = new File(['test content for hashing'], 'test.txt', { type: 'text/plain' });
    const hash = await calculateFileHash(mockFile);
    console.log('Hash calculation test:', hash);
    return !!hash;
  } catch (error) {
    console.error('Hash calculation failed:', error);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log('Running Firebase tests...');
  
  const connectionTest = testFirebaseConnection();
  const validationTest = testFileValidation();
  const hashTest = await testHashCalculation();
  
  const allPassed = connectionTest && validationTest && hashTest;
  
  console.log('All tests passed:', allPassed);
  return allPassed;
};

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  runAllTests();
}
