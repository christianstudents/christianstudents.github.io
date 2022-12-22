import BEM from "../bem";
import html from "../htmlTemplateTag";
import "./styles.scss";
import videojs from "video.js";
import { InstagramVideoMedia } from "./types";

const widgetBem = BEM("instagram-video-feed-widget");
const videoBem = BEM("instagram-video");

/**
 * The target "area" that a video in the feed should take up, in rem^2 units.
 *
 * If a video has an aspect ratio of `w:h`, it will maintain its aspect ratio and have dimensions
 * such that the total area that the video takes up on screen (`w` * `h`) is `TARGET_AREA` rem^2
 * units. This makes it so that even for portrait, landscape, and square videos, they all feel
 * roughly the same size to the user, and we don't give unnecessary importance to one video (by
 * making it bigger) just because its aspect ratio happens to be different.
 */
const TARGET_AREA = 225; // 15rem * 15rem for square videos; other ratios are scaled appropriately
/**
 * The maximum height a video can be, in rem units.
 *
 * If we rely *only* on `TARGET_AREA` to scale the video up or down, we'd have problems with extreme
 * rectangular videos. Consider a case where we get a video with a ridiculous aspect ratio of 1:9999
 * (which obviously wouldn't actually happen considering we control the videos that get posted to
 * Instagram, but just as an example). If we scaled the video's dimension to take up `TARGET_AREA`
 * units of area, because the video is so tall and skinny, we'd likely end up with a video thousands
 * of pixels tall, messing up the flow of the page. Having a `MAX_HEIGHT` ensures that videos never
 * exceed this height. They still keep their aspect ratio though, so it's possible that the video
 * will have to have its total area scaled down to be less than `TARGET_AREA` to maintain that
 * aspect ratio and maximum height limit.
 * @see {@link MAX_WIDTH}
 */
const MAX_HEIGHT = 25;
/**
 * The maximum width a video can be, in rem units.
 *
 * Same as `MAX_HEIGHT`, but for the width. We can usually allow a greater maximum width than height
 * because the videos are lined up in a scrollable horizontal row, so having a wider video will just
 * shift the other videos in the row over by a few rem units, but it won't mess up the flow of the
 * rest of the page (since the height of the row will still be, at most, `MAX_HEIGHT` rem units).
 * @see {@link MAX_HEIGHT}
 */
const MAX_WIDTH = 35;

/**
 * The maximum number of posts to display. This is just the upper limit; the API is allowed to
 * return fewer posts than this if there aren't enough.
 */
const LIMIT = 12;

/**
 * The API endpoint for retrieving the most recent videos.
 */
const ENDPOINT = `https://scs-app-backend-481f8.web.app/api/v1/instagram/videos?limit=${LIMIT}`;

const createWidgets = () => {
  "use strict";

  const widgetContainers = widgetBem.select();

  // Import and load video.js CSS styles by injecting a <link> into the page.
  const styles = document.createElement("link");
  styles.rel = "stylesheet";
  styles.href = "https://unpkg.com/video.js@7/dist/video-js.min.css";
  document.head.appendChild(styles);

  const fetchInstagramFeed = () => {
    widgetBem.modify({ state: "loading" });

    for (const widget of widgetContainers) {
      widget.innerHTML = html`<div class="${widgetBem("loading")}">
        Loading...
      </div>`;
    }

    fetch(ENDPOINT)
      .then((data) => data.json())
      .then(async (videoData: InstagramVideoMedia[]) => {
        const results = await Promise.allSettled(
          videoData.map(
            (videoObject) =>
              new Promise<[container: HTMLElement, video: HTMLVideoElement]>(
                (resolve, reject) => {
                  const container = document.createElement("div");
                  container.classList.add(videoBem.className);
                  container.innerHTML = html`
                    <div
                      data-vjs-player
                      class="${videoBem("video-js-wrapper")}"
                    ></div>
                  `;
                  const video = document.createElement("video");
                  video.classList.add("video-js", "vjs-scs-theme");
                  video.addEventListener("loadedmetadata", function () {
                    // "Short" videos are less than 8.5s long. They get played automatically (on
                    // mute) since they don't use very much data and they're usually just short
                    // looping animations.
                    if (this.duration <= 8.5) {
                      this.setAttribute("data-short-video", "true");
                      this.loop = true;
                    } else {
                      // This is a longer video, so we should disable autoplay and start the video
                      // unmuted, just as you'd expect for a video you have to click on to play.
                      this.autoplay = false;
                      this.muted = false;
                    }
                    this.setAttribute(
                      "data-video-width",
                      (this.videoWidth || 1).toString()
                    );
                    this.setAttribute(
                      "data-video-height",
                      (this.videoHeight || 1).toString()
                    );
                    resolve([container, video]);
                  });
                  video.addEventListener("error", reject);

                  // Start the video off as muted and with autoplay enabled. This will be changed
                  // (to ignore autoplay and be unmuted) if the video is longer than a few seconds.
                  // Browsers typically allow autoplay on videos only when they are muted, so this
                  // just lets the browser know that we intend to autoplay the video, and are muting
                  // it to prevent blocking.
                  video.muted = true;
                  video.autoplay = true;
                  // video.js seems to only work when the <video> has a <source>, so we can't set
                  // the video's `src` attribute directly.
                  video.innerHTML = html`
                    <source src="${videoObject.media_url}" type="video/mp4" />
                  `;
                  video.poster = videoObject.thumbnail_url;
                  container.firstElementChild!.appendChild(video);
                }
              )
          )
        );
        // Get rid of videos that errored out.
        return results.flatMap((result) =>
          result.status === "fulfilled" ? [result.value[0]] : []
        );
      })
      .then((videoElements) => {
        if (videoElements.length === 0) {
          // Add an empty modifier.
          widgetBem.modify({ empty: true, filled: false });

          for (const container of widgetContainers) {
            // Write a message to let the user know it is empty.
            container.innerHTML = html`
              <div class="${widgetBem("no-videos")}">
                No videos found. Check back later for more!
              </div>
            `;
          }
          return [];
        }

        const allVideoElements = videoElements.map(
          (container) => container.querySelector("video")!
        );

        const elementClones = Array.from<typeof videoElements>({
          length: widgetContainers.length,
        });
        elementClones[0] = videoElements;

        for (let i = 1; i < widgetContainers.length; i++) {
          elementClones[i] = Array.from<HTMLElement>({
            length: videoElements.length,
          });
          for (let j = 0; j < videoElements.length; j++) {
            elementClones[i][j] = videoElements[j].cloneNode(
              true
            ) as HTMLElement;
            allVideoElements.push(elementClones[i][i].querySelector("video")!);
          }
        }

        // Add a class indicating that the widget has content.
        widgetBem.modify({ empty: false, filled: true });
        for (let i = 0; i < widgetContainers.length; i++) {
          // Clear the widget container's children.
          widgetContainers[i].textContent = "";

          // Insert each event one-by-one.
          for (const element of elementClones[i]) {
            widgetContainers[i].appendChild(element);
          }
        }

        return allVideoElements;
      })
      .then((videoElements) => {
        for (const video of videoElements) {
          const container = video.parentElement!.parentElement!;
          const width = video.getAttribute("data-video-width") ?? "";
          const height = video.getAttribute("data-video-height") ?? "";

          if (isNaN(+width) || isNaN(+height)) {
            continue;
          }

          let dimensionScaler = Math.sqrt(TARGET_AREA / +width / +height);
          if (dimensionScaler * +width > MAX_WIDTH) {
            dimensionScaler = MAX_WIDTH / +width;
          } else if (dimensionScaler * +height > MAX_HEIGHT) {
            dimensionScaler = MAX_HEIGHT / +height;
          }
          container.style.width = `${+width * dimensionScaler}rem`;
          container.style.height = `${+height * dimensionScaler}rem`;
          video.parentElement!.style.height = "100%";
          video.parentElement!.style.width = "100%";

          videojs(video, {
            fluid: true,
            controls: true,
            language: "en",
            playbackRates: [0.5, 1, 1.5, 2],
          });
        }
      })
      .catch(() => {
        const div = document.createElement("div");
        div.classList.add(widgetBem("errored").className);
        div.innerHTML = html`
          <div>There was a problem getting the Instagram videos.</div>
          <button
            class="${BEM.button({
              bg: "primary",
              text: "lightest",
              hover: "shadow",
            })}"
          >
            Try again
          </button>
        `;

        widgetBem.modify({ state: "errored" });

        for (let i = 0; i < widgetContainers.length; i++) {
          // Clear the widget container's children.
          widgetContainers[i].textContent = "";

          const clone = div.cloneNode(true) as HTMLDivElement;
          const button = clone.querySelector("button")!;
          button.addEventListener("click", fetchInstagramFeed);

          widgetContainers[i].appendChild(clone);
        }
      });
  };

  fetchInstagramFeed();
};

export default createWidgets;
