# Drone Imagery Upload Setup Guide

This guide explains how to set up and use the drone imagery upload functionality in the Blue Carbon Registry application.

## Overview

The drone imagery upload feature allows NGOs to securely upload drone-captured images and videos to Firebase Storage, with cryptographic hashing for blockchain verification. The uploaded files are stored off-chain while their hashes are prepared for on-chain transactions.

## Features

- **Secure File Upload**: Upload images and videos to Firebase Storage
- **Progress Tracking**: Real-time upload progress with visual indicators
- **File Validation**: Client-side validation for file type and size
- **Cryptographic Hashing**: SHA-256 hash calculation for blockchain verification
- **Metadata Storage**: File metadata including size, type, and timestamps
- **Unique File Paths**: Organized storage structure with project-based paths

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Storage in your project
3. Set up Storage Rules for security:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/drone_imagery/{projectId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Get your Firebase configuration from Project Settings > General > Your apps
5. Update your `.env` file with the Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. Install Dependencies

The required dependencies are already installed:
- `firebase`: Firebase SDK for storage operations
- `crypto-js`: For cryptographic hash calculations

### 3. File Structure

```
src/
├── config/
│   └── firebaseConfig.js          # Firebase configuration
├── services/
│   └── firebaseStorageService.js  # Storage service with upload functions
├── components/
│   └── DroneImageryUpload.js      # Upload component
└── pages/
    └── NGODashboard.js            # Updated with upload integration
```

## Usage

### For NGOs

1. **Access the Upload Feature**:
   - Log in to the NGO Dashboard
   - Click "New Project" or edit an existing project
   - Scroll to the "Drone Imagery" section

2. **Upload Files**:
   - Click "Choose File" to select image or video files
   - Supported formats: Images (JPG, PNG, GIF, WebP) and Videos (MP4, MOV, AVI)
   - Maximum file size: 100MB
   - Click "Upload File" to start the upload process

3. **Monitor Progress**:
   - Watch the progress bar during upload
   - View upload success/error notifications
   - See file hash and download URL upon completion

4. **Manage Uploaded Files**:
   - View uploaded files in the list
   - Click "View File" to open the file in a new tab
   - Click "Remove" to delete files from the project

### For Developers

#### Upload Service API

```javascript
import { uploadDroneImagery, calculateFileHash, validateFile } from '../services/firebaseStorageService';

// Upload a file
const result = await uploadDroneImagery(file, projectId, onProgress);

// Calculate file hash
const hash = await calculateFileHash(file);

// Validate file
const validation = validateFile(file);
```

#### Upload Result Structure

```javascript
{
  success: true,
  downloadURL: "https://firebasestorage.googleapis.com/...",
  fileHash: "a1b2c3d4e5f6...", // SHA-256 hash
  metadata: {
    name: "drone_image.jpg",
    size: 2048576,
    contentType: "image/jpeg",
    timeCreated: "2024-01-15T10:30:00.000Z",
    updated: "2024-01-15T10:30:00.000Z",
    fullPath: "images/drone_imagery/project123/1642248600000_drone_image.jpg"
  },
  filePath: "images/drone_imagery/project123/1642248600000_drone_image.jpg"
}
```

## Security Features

### File Validation
- **Type Validation**: Only image and video files are allowed
- **Size Validation**: Maximum file size of 100MB
- **Name Validation**: Files must have valid names

### Cryptographic Hashing
- **SHA-256 Algorithm**: Industry-standard cryptographic hash function
- **Client-side Calculation**: Hash calculated before upload for security
- **Blockchain Ready**: Hash can be directly used in smart contract calls

### Storage Security
- **Unique File Paths**: Prevents file conflicts and unauthorized access
- **Project-based Organization**: Files organized by project ID
- **Timestamped Names**: Prevents filename collisions

## Integration with Blockchain

The uploaded drone imagery is prepared for blockchain integration:

1. **File Upload**: Files are uploaded to Firebase Storage
2. **Hash Calculation**: SHA-256 hash is calculated for each file
3. **Metadata Storage**: File metadata is stored locally
4. **Blockchain Preparation**: Hash and URL are ready for smart contract calls

### Example Smart Contract Integration

```javascript
// The file hash can be used in Aptos smart contract calls
const projectData = {
  name: "Mangrove Restoration",
  location: "Sundarbans, Bangladesh",
  hectares: 150,
  droneImageryHash: "a1b2c3d4e5f6...", // From upload result
  droneImageryURL: "https://firebasestorage.googleapis.com/...", // From upload result
  // ... other project data
};

// Submit to blockchain
await submitProjectToBlockchain(projectData);
```

## Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check Firebase configuration in `.env` file
   - Verify Firebase Storage rules
   - Check file size and type requirements

2. **Hash Calculation Error**:
   - Ensure file is not corrupted
   - Check browser compatibility with FileReader API

3. **Progress Not Updating**:
   - Check Firebase Storage connection
   - Verify upload task is not cancelled

### Debug Mode

Enable debug logging by adding to your browser console:
```javascript
localStorage.setItem('debug', 'firebase:*');
```

## File Storage Structure

Files are stored in Firebase Storage with the following structure:

```
images/drone_imagery/
├── project_123/
│   ├── 1642248600000_drone_image_1.jpg
│   ├── 1642248601000_drone_video_1.mp4
│   └── 1642248602000_drone_image_2.png
└── project_456/
    ├── 1642248700000_survey_video.mp4
    └── 1642248701000_aerial_photo.jpg
```

## Performance Considerations

- **File Size Limits**: 100MB maximum per file
- **Concurrent Uploads**: Multiple files can be uploaded simultaneously
- **Progress Tracking**: Real-time progress updates for large files
- **Error Handling**: Graceful error handling with user feedback

## Future Enhancements

- **Batch Upload**: Upload multiple files at once
- **Image Compression**: Automatic image optimization
- **Thumbnail Generation**: Generate preview thumbnails
- **Cloud Processing**: Server-side image processing
- **Version Control**: Track file versions and changes

