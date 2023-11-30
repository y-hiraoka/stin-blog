export function extractYouTubeVideoId(url: string): string | null {
  const matched =
    /^https?:\/\/(www\.)?youtube\.com\/watch\?(.*&)?v=(?<videoId>[^&]+)/.exec(url) ??
    /^https?:\/\/youtu\.be\/(?<videoId>[^?]+)/.exec(url) ??
    /^https?:\/\/(www\.)?youtube\.com\/embed\/(?<videoId>[^?]+)/.exec(url);

  if (matched?.groups?.videoId) {
    return matched.groups.videoId;
  } else {
    return null;
  }
}
