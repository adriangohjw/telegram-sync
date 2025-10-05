import type { MediaFile, TelegramMessage } from "./types";

export const extractMediaFiles = (message: TelegramMessage): MediaFile[] => {
  const mediaFiles: MediaFile[] = [];

  // Handle photos (get the largest size)
  // When Telegram sends a photo message, it provides multiple sizes of the same image in an array.
  // The photo array is ordered from smallest to largest, with the last item being the highest resolution.
  if (message.photo && message.photo.length > 0) {
    const largestPhoto = message.photo[message.photo.length - 1];
    if (largestPhoto) {
      mediaFiles.push({
        fileId: largestPhoto.file_id,
        fileName: `photo_${message.message_id}.jpg`,
        mimeType: "image/jpeg",
        ...(largestPhoto.file_size && { fileSize: largestPhoto.file_size }),
        type: "photo",
      });
    }
  }

  // Handle videos
  if (message.video) {
    mediaFiles.push({
      fileId: message.video.file_id,
      fileName: message.video.file_name || `video_${message.message_id}.mp4`,
      mimeType: message.video.mime_type || "video/mp4",
      ...(message.video.file_size && { fileSize: message.video.file_size }),
      type: "video",
    });
  }

  // Handle documents
  // When user sends an image that is too large or high resolution,
  // Telegram will treat it as a document to reduce quality.
  if (message.document) {
    const isVideo = message.document.mime_type?.startsWith("video/");
    const isImage = message.document.mime_type?.startsWith("image/");

    if ((isVideo || isImage) && message.document.mime_type) {
      mediaFiles.push({
        fileId: message.document.file_id,
        fileName:
          message.document.file_name || `document_${message.message_id}`,
        mimeType: message.document.mime_type,
        ...(message.document.file_size && {
          fileSize: message.document.file_size,
        }),
        type: isVideo ? "video" : "photo",
      });
    }
  }

  return mediaFiles;
};
