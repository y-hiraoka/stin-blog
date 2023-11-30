export function extractYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2]) {
    return match[2];
  } else {
    return null;
  }
}
