import BEM from "../bem";
import html from "../htmlTemplateTag";
import "./styles.scss";
import { YouTubeAPIResponse } from "./types";

const widgetBem = BEM("youtube-video-feed-widget");
const itemBem = BEM("youtube-video-item");

/**
 * The API endpoint for retrieving the most recent videos.
 */
const ENDPOINT = `https://scs-app-backend-481f8.web.app/api/v1/youtube`;

const createWidgets = () => {
  "use strict";

  const widgetContainers = widgetBem.select();

  const fetchYoutubeFeed = () => {
    widgetBem.modify({ state: "loading" });

    for (const widget of widgetContainers) {
      widget.innerHTML = html`<div class="${widgetBem("loading")}">
        Loading...
      </div>`;
    }

    fetch(ENDPOINT)
      .then((data) => data.json())
      .then(async (response: YouTubeAPIResponse) => {
        const videoData =
          "videos" in response && response.videos ? response.videos : [];
        return videoData.flatMap((videoObject) => {
          const videoID = videoObject.snippet.resourceId.videoId;
          if (typeof videoID !== "string") return [];
          const container = document.createElement("section");
          container.classList.add(
            ...itemBem.classes,
            ...BEM.pageContent({ "major-column": "left" }).classes
          );
          container.innerHTML = html`
            <div class="${itemBem("left")}">
              <div class="${BEM.imgAspectRatio(["9-16"])}">
                <iframe
                  src="https://www.youtube.com/embed/${videoID}"
                  class="${itemBem("iframe")}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  title="${videoObject.snippet.title}"
                  frameborder="0"
                ></iframe>
              </div>
            </div>
            <div class="${itemBem("right")}">
              <h3 class="${itemBem("title")}">${videoObject.snippet.title}</h3>
              ${videoObject.snippet.description
                ? html`<p class="${itemBem("description")}">
                    ${videoObject.snippet.description}
                  </p>`
                : ""}
            </div>
          `;
          return [container];
        });
      })
      .then((videoElements: HTMLElement[]) => {
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

        widgetBem.modify({ state: "loaded" });
      })
      .catch(() => {
        const div = document.createElement("div");
        div.classList.add(widgetBem("errored").className);
        div.innerHTML = html`
          <div>There was a problem getting the YouTube videos.</div>
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
          button.addEventListener("click", fetchYoutubeFeed);

          widgetContainers[i].appendChild(clone);
        }
      });
  };

  fetchYoutubeFeed();
};

export default createWidgets;
