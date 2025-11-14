export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // result is a data URL: data:image/png;base64,iVBORw0KGgo...
      // We only want the base64 part
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Added Crypto and Share Utilities ---

/**
 * Creates a SHA-256 hash of data and a secret, simulating a signature.
 * @param data The data to sign (as a string).
 * @param secret The secret key to sign with.
 * @returns A hex string representation of the signature.
 */
export const createSignature = async (data: string, secret: string): Promise<string> => {
  const textToEncode = data + secret;
  const textAsBuffer = new TextEncoder().encode(textToEncode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifies a signature against the data and secret.
 * @param data The data that was signed.
 * @param signature The signature to verify.
 * @param secret The secret key used for signing.
 * @returns True if the signature is valid, false otherwise.
 */
export const verifySignature = async (data: string, signature: string, secret: string): Promise<boolean> => {
    const expectedSignature = await createSignature(data, secret);
    return expectedSignature === signature;
};


/**
 * Converts a data URL string to a Blob object.
 * @param dataUrl The data URL to convert.
 * @returns A promise that resolves to a Blob.
 */
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
};