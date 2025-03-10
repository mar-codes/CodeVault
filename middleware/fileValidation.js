export const validateImageUpload = async (req) => {
    if (!req.file) {
        throw new Error('No file provided');
    }

    const file = req.file;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPG, PNG and WebP images are allowed');
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size too large. Maximum size is 5MB');
    }

    if (file.size === 0) {
        throw new Error('File is empty');
    }

    // You could add more checks here like:
    // - Malware scanning
    // - Image dimension validation
    // - File name sanitization
    // - MIME type verification
    
    return true;
};
