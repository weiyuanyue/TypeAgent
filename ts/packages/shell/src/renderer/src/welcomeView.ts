import { ChatView } from "./chatView";

export class WelcomeView extends HTMLElement {
  private chatView: ChatView | undefined;

  constructor() {
    super();
    this.connectedCallback = this.connectedCallback.bind(this);
  }

  connectedCallback() {
    this.render();
    const checkMsgCountTimer = setInterval(() => {
      if (this.chatView?.getUserMessageCount()) {
        const welcomeSection = this.querySelector("#welcome-section") as HTMLElement | null;
        if (welcomeSection) {
          welcomeSection.classList.add("hidden");
          clearInterval(checkMsgCountTimer);
        }
      }
    }, 500);
  }

  clickPrompt(event: MouseEvent) {
    const currentTarget = event.currentTarget as HTMLElement;
    const query = currentTarget?.dataset.query;
    if (query) {
      query.split(";").forEach((q) => {
        this.chatView?.addUserMessage(q);
      });
      
      const welcomeSection = this.querySelector("#welcome-section") as HTMLElement | null;
      if (welcomeSection) {
        welcomeSection.classList.add("hidden");
      }
    }
  }

  setChatView(chatView) {
    this.chatView = chatView;
  }

  render() {
    this.innerHTML = `
    <section class="welcome-section" id="welcome-section">
      <h1>I thought you’d enjoy</h1>
      <div class="welcome-grid">
        <button class="grid-child-btn welcome-btn-1" type="submit" data-query="open paint">
          <div class="grid-child welcome-cover">
            <img class="welcome-img" src="https://copilot.microsoft.com/th?id=ODSWG.a0b672f5-fe18-4863-bba0-f4895a1d0b43&forceJpeg=1&o=6">
            <div class="welcome-title">
              <h2>Play some music</h2>
            </div>
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-2" type="submit" data-query="open Bing News in browser">
          <div class="grid-child">
            <img class="welcome-img" src="./assets/news.jpeg">
            <div class="welcome-title">
              <h2>Explore what's happening worldwide today</h2>
            </div>
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-3" type="submit" data-query="@config agent desktop; launch the camera app.">
          <div class="grid-child">
            <img class="welcome-img" src="./assets/camera.jpeg">
            <div class="welcome-title">
              <h2>See beyond the ordinary with your camera</h2>
            </div>
          </div>
        </button>
      </div>
    </section>
    `;
    this.querySelectorAll('#welcome-section .grid-child-btn').forEach((element) => {
      element.addEventListener('click', (event) => {
        this.clickPrompt(event as MouseEvent);
      });
    });
  }
}