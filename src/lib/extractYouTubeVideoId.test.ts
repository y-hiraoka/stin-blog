import { describe, expect, it } from "vitest";
import { extractYouTubeVideoId } from "./extractYouTubeVideoId";

describe("extractYouTubeVideoId", () => {
  it("通常の視聴ページURLから videoId を取得する", () => {
    const videoId = extractYouTubeVideoId("https://www.youtube.com/watch?v=cyFB7sB6CYs");

    expect(videoId).toBe("cyFB7sB6CYs");
  });

  it("短縮URLから videoId を取得する", () => {
    const videoId = extractYouTubeVideoId("https://youtu.be/cyFB7sB6CYs");

    expect(videoId).toBe("cyFB7sB6CYs");
  });

  it("埋め込みURLから videoId を取得する", () => {
    const videoId = extractYouTubeVideoId("https://www.youtube.com/embed/cyFB7sB6CYs");

    expect(videoId).toBe("cyFB7sB6CYs");
  });

  it("プレイリストURLから videoId を取得する", () => {
    const videoId = extractYouTubeVideoId(
      "https://www.youtube.com/watch?v=cyFB7sB6CYs&list=PLQJNT2fdCJngOJF9JBwv_EbEkOBJnkJ_M",
    );

    expect(videoId).toBe("cyFB7sB6CYs");
  });

  it("他のパラメーターを含むURLから videoId を取得する", () => {
    const videoId = extractYouTubeVideoId(
      "https://www.youtube.com/watch?si=1234567890&v=cyFB7sB6CYs",
    );

    expect(videoId).toBe("cyFB7sB6CYs");
  });

  it("不正なURLから null を取得する", () => {
    const videoId = extractYouTubeVideoId("https://www.youtube.com/");

    expect(videoId).toBe(null);
  });
});
