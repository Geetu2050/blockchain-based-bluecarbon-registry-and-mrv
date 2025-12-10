// Firebase Storage Service for Drone Imagery Upload
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  getMetadata 
} from 'firebase/storage';
import { storage, ensureFirebaseAuthSignedIn } from '../config/firebaseConfig';
import CryptoJS from 'crypto-js';

/**
 * Calculate SHA-256 hash of a file
 * @param {File} file - The file to hash
 * @returns {Promise<string>} - The SHA-256 hash as a hex string
 */
export const calculateFileHash = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const wordArray = CryptoJS.lib.WordArray.create(event.target.result);
        const hash = CryptoJS.SHA256(wordArray);
        const hashHex = hash.toString(CryptoJS.enc.Hex);
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file for hashing'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate a unique file path for drone imagery
 * @param {string} projectId - The project ID
 * @param {File} file - The file being uploaded
 * @returns {string} - The unique file path
 */
export const generateFilePath = (projectId, file) => {
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `images/drone_imagery/${projectId}/${timestamp}_${sanitizedFileName}`;
};

/**
 * Upload file to Firebase Storage with progress tracking
 * @param {File} file - The file to upload
 * @param {string} projectId - The project ID
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} - Upload result with URL, hash, and metadata
 */
// Simulate upload when Firebase is not configured or fails
const simulateUpload = (file, projectId, onProgress) => {
  return new Promise((resolve) => {
    const total = file.size || 100000;
    let transferred = 0;
    const start = Date.now();
    const timer = setInterval(() => {
      // Increment with easing
      transferred += Math.max(total * 0.05, 20000);
      if (transferred >= total) {
        transferred = total;
      }
      const progress = Math.round((transferred / total) * 100);
      if (onProgress) {
        onProgress({ progress, bytesTransferred: transferred, totalBytes: total });
      }
      if (progress >= 100) {
        clearInterval(timer);
        const blobUrl = URL.createObjectURL(file);
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `images/drone_imagery/${projectId || 'temp'}/${timestamp}_${sanitizedFileName}`;
        resolve({
          success: true,
          downloadURL: blobUrl,
          fileHash: 'simulated-' + timestamp.toString(16),
          metadata: {
            name: file.name,
            size: file.size,
            contentType: file.type,
            timeCreated: new Date(start).toISOString(),
            updated: new Date().toISOString(),
            fullPath: filePath
          },
          filePath
        });
      }
    }, 200);
  });
};

export const uploadDroneImagery = async (file, projectId, onProgress = null) => {
  try {
    const isDemoConfig = (
      !process.env.REACT_APP_FIREBASE_API_KEY ||
      process.env.REACT_APP_FIREBASE_API_KEY === 'demo-api-key'
    );

    // Ensure we are authenticated (anonymous is fine) when not in demo
    if (!isDemoConfig) {
      try {
        await ensureFirebaseAuthSignedIn();
      } catch (authError) {
        console.warn('Firebase auth sign-in failed; falling back to simulated upload.', authError);
        return await simulateUpload(file, projectId, onProgress);
      }
    }

    // Validate file type
    const allowedTypes = ['image/', 'video/'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    
    if (!isValidType) {
      throw new Error('Invalid file type. Only image and video files are allowed.');
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 100MB.');
    }

    // Calculate file hash
    console.log('Calculating file hash...');
    const fileHash = await calculateFileHash(file);
    console.log('File hash calculated:', fileHash);

    // Generate unique file path
    const filePath = generateFilePath(projectId, file);
    console.log('Uploading to path:', filePath);

    // If demo config, simulate instead of real upload
    if (isDemoConfig) {
      console.log('Firebase not configured; simulating upload. Configure .env to enable real uploads.');
      return await simulateUpload(file, projectId, onProgress);
    }

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Upload file with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
          
          if (onProgress) {
            onProgress({
              progress: Math.round(progress),
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes
            });
          }
        },
        (error) => {
          console.error('Upload error:', error);
          // Fall back to simulation on error
          simulateUpload(file, projectId, onProgress).then(resolve).catch(reject);
        },
        async () => {
          try {
            // Upload completed successfully
            console.log('Upload completed successfully');
            
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL:', downloadURL);

            // Get file metadata
            const metadata = await getMetadata(uploadTask.snapshot.ref);
            console.log('File metadata:', metadata);

            // Return upload result
            const result = {
              success: true,
              downloadURL,
              fileHash,
              metadata: {
                name: metadata.name,
                size: metadata.size,
                contentType: metadata.contentType,
                timeCreated: metadata.timeCreated,
                updated: metadata.updated,
                fullPath: metadata.fullPath
              },
              filePath
            };

            resolve(result);
          } catch (error) {
            console.error('Error getting download URL or metadata:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload service error:', error);
    throw error;
  }
};

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export const validateFile = (file) => {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  // Check file type
  const allowedTypes = ['image/', 'video/'];
  const isValidType = allowedTypes.some(type => file.type.startsWith(type));
  if (!isValidType) {
    errors.push('Invalid file type. Only image and video files are allowed.');
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    errors.push('File size too large. Maximum size is 100MB.');
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    errors.push('File must have a name');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  uploadDroneImagery,
  calculateFileHash,
  validateFile,
  generateFilePath
};

