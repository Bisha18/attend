/**
 * Face verification helper — calls the Python face-service.
 */

const FACE_SERVICE_URL = (process.env.FACE_SERVICE_URL || 'http://localhost:8001').replace(/\/+$/, '');

/**
 * Verify a student's face against their registered embedding.
 * @param {string} studentId - MongoDB ObjectId as string
 * @param {string} imageBase64 - Base64-encoded selfie from app camera
 * @returns {{ verified: boolean, confidence: number }}
 */
export async function verifyFace(studentId, imageBase64) {
  try {
    const response = await fetch(`${FACE_SERVICE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        image: imageBase64,
      }),
      signal: AbortSignal.timeout(120000), // Verification can take time on CPU
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        verified: false,
        confidence: 0,
        message: error.detail || `Face service error (HTTP ${response.status})`,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Face verification failed:', error.message);
    return {
      verified: false,
      confidence: 0,
      message: `Face service unavailable: ${error.message}`,
    };
  }
}

/**
 * Register a student's face embedding.
 * @param {string} studentId - MongoDB ObjectId as string
 * @param {string} imageBase64 - Base64-encoded selfie from app camera
 * @returns {{ success: boolean, message: string }}
 */
export async function registerFace(studentId, imageBase64) {
  try {
    const response = await fetch(`${FACE_SERVICE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        image: imageBase64,
      }),
      signal: AbortSignal.timeout(120000), // Registration can take time on CPU
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.detail || `Face service error (HTTP ${response.status})`,
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Face registration failed:', error.message);
    return {
      success: false,
      message: `Face service unavailable: ${error.message}`,
    };
  }
}

/**
 * Check if a student has a registered face.
 * @param {string} studentId - MongoDB ObjectId as string
 * @returns {{ registered: boolean }}
 */
export async function checkFaceStatus(studentId) {
  try {
    const response = await fetch(`${FACE_SERVICE_URL}/status/${studentId}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { registered: false };
    return await response.json();
  } catch {
    return { registered: false };
  }
}
