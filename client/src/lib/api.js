// Empty string = same origin (server hosts the client, or Vite's dev proxy).
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * Upload + process with real progress. XHR tracks the upload phase; the rest
 * is server-side encoding (handled by an indeterminate bar in the UI).
 */
export function uploadAndProcess(file, onUploadProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/process`);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          blob: xhr.response,
          outputSize:
            Number(xhr.getResponseHeader("X-Output-Size")) || xhr.response.size,
        });
      } else {
        xhr.response
          .text()
          .then((text) => {
            let message = "Something went wrong on the server.";
            try {
              message = JSON.parse(text).error || message;
            } catch {
              /* keep default */
            }
            reject(new Error(message));
          })
          .catch(() => reject(new Error("Processing failed. Try again.")));
      }
    };

    xhr.onerror = () =>
      reject(new Error("Couldn't reach the server. Check your connection and try again."));
    xhr.ontimeout = () => reject(new Error("The request timed out. Try a smaller file."));

    const formData = new FormData();
    formData.append("media", file);
    xhr.send(formData);
  });
}

export const IMAGE_EXTS = ["jpg", "jpeg", "png"];
export const VIDEO_EXTS = ["mp4", "mov", "avi", "mkv", "webm"];
export const MAX_INPUT_BYTES = 50 * 1024 * 1024;

export function getFileType(file) {
  if (!file) return null;
  const ext = file.name.split(".").pop().toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return "image";
  if (VIDEO_EXTS.includes(ext)) return "video";
  return null;
}
