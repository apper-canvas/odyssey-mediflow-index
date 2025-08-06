const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Supported file types for medical documents
const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/dicom': 'dicom',
  'application/dicom': 'dicom'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const documentService = {
  async validateFile(file) {
    const errors = [];

    // Check file type
    if (!SUPPORTED_TYPES[file.type]) {
      errors.push(`File type ${file.type} is not supported. Supported types: PDF, JPEG, PNG, DICOM`);
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum limit of 10MB`);
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      errors.push('File must have a valid name');
    }

    return {
      isValid: errors.length === 0,
      errors,
      type: SUPPORTED_TYPES[file.type]
    };
  },

  async processFiles(files, defaultCategory = 'Medical Records') {
    await delay(200);
    
    const processedFiles = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = await this.validateFile(file);

      if (!validation.isValid) {
        errors.push({
          fileName: file.name,
          errors: validation.errors
        });
        continue;
      }

      // Create file URL (in real app, this would upload to server/cloud storage)
      const fileUrl = URL.createObjectURL(file);
      
      // Generate preview for images
      let preview = null;
      if (file.type.startsWith('image/')) {
        preview = fileUrl;
      }

      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        category: file.category || defaultCategory,
        url: fileUrl,
        preview: preview
      });
    }

    return {
      processedFiles,
      errors
    };
  },

  getFileIcon(fileType) {
    if (fileType?.startsWith('image/')) {
      return 'Image';
    }
    if (fileType === 'application/pdf') {
      return 'FileText';
    }
    return 'File';
  },

  getCategoryColor(category) {
    switch (category) {
      case 'Lab Reports':
        return 'success';
      case 'Imaging':
        return 'info';
      case 'Medical Records':
        return 'secondary';
      default:
        return 'secondary';
    }
  },

  getSupportedTypes() {
    return Object.keys(SUPPORTED_TYPES);
  },

  getMaxFileSize() {
    return MAX_FILE_SIZE;
  }
};