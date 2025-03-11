/**
 * Utility functions for working with Cloudinary
 */

/**
 * Extract a public_id from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} The public_id or null if not found
 */
export function getPublicIdFromUrl(url) {
    if (!url) return null;

    try {
        // Parse the URL to extract the path
        const urlObj = new URL(url);
        const path = urlObj.pathname;

        // Extract everything after "/upload/"
        const uploadIndex = path.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        // Get the path after "/upload/"
        const afterUpload = path.substring(uploadIndex + 8); // 8 is the length of "/upload/"

        // Remove any transformations (v1, w_100, etc.)
        const parts = afterUpload.split('/');
        const filteredParts = parts.filter(part => !part.includes('_'));

        // Join the remaining parts and remove the file extension
        const publicIdWithExt = filteredParts.join('/');
        const extIndex = publicIdWithExt.lastIndexOf('.');

        return extIndex !== -1
            ? publicIdWithExt.substring(0, extIndex)
            : publicIdWithExt;
    } catch (error) {
        console.error('Error extracting public_id from URL:', error);
        return null;
    }
}

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
}

/**
 * Extract user ID from a Cloudinary avatar URL or public ID
 * @param {string} urlOrId - Cloudinary URL or public ID
 * @returns {string|null} - User ID or null if not found
 */
export function extractUserIdFromAvatarResource(urlOrId) {
    if (!urlOrId) return null;

    try {
        // Try to find "user_" in the string
        const userPattern = /user_([a-zA-Z0-9]+)/;
        const match = urlOrId.match(userPattern);

        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting user ID:', error);
        return null;
    }
}

/**
 * Generate Cloudinary transformation URL for optimized avatar delivery
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Transformed URL
 */
export function getOptimizedAvatarUrl(url, options = {}) {
    if (!isCloudinaryUrl(url)) return url;

    const {
        width = 250,
        height = 250,
        format = 'auto',
        quality = 'auto'
    } = options;

    try {
        // Find the upload part of the URL
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return url;

        // Insert transformation parameters
        const transformations = `w_${width},h_${height},c_fill,g_face,f_${format},q_${quality}`;
        const baseUrl = url.substring(0, uploadIndex + 8); // +8 for "/upload/"
        const restUrl = url.substring(uploadIndex + 8);

        return `${baseUrl}${transformations}/${restUrl}`;
    } catch (error) {
        console.error('Error generating optimized URL:', error);
        return url;
    }
}
