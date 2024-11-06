import { ChatView } from "./chatView";

export class WelcomeView extends HTMLElement {
  private chatView: ChatView | undefined;

  constructor() {
    super();
    this.connectedCallback = this.connectedCallback.bind(this);
  }

  connectedCallback() {
    this.render();
    setTimeout(() => {
      const welcomeSection = this.querySelector("#welcome-section") as HTMLElement | null;
      if (welcomeSection) {
        welcomeSection.classList.remove("hidden");
      }
    }, 200);
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
    if (currentTarget?.dataset.query) {
      this.chatView?.addUserMessage(currentTarget?.dataset.query);
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
    <section class="welcome-section hidden" id="welcome-section">
      <h1>I thought you’d enjoy</h1>
      <div class="welcome-grid">
        <button class="grid-child-btn welcome-btn-1" type="submit" data-query="open paint">
          <div class="grid-child welcome-cover">
            <img class="welcome-img" src="https://copilot.microsoft.com/th?id=ODSWG.a0b672f5-fe18-4863-bba0-f4895a1d0b43&forceJpeg=1&o=6">
            <div class="welcome-title">
              <h2>Video games to play with a beginner</h2>
            </div>
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-2" type="submit" data-query="Hello">
          <div class="grid-child">
            <img class="welcome-img" src="https://copilot.microsoft.com/th?id=ODSWG.8560a21b-2168-4271-ba59-7eb919214814&forceJpeg=1&o=6">
            <div class="welcome-title">
              <h2>Video games to play with a beginner</h2>
            </div>
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-3" type="submit" data-query="open notepad">
          <div class="grid-child">
            <img class="welcome-img" src="https://copilot.microsoft.com/th?id=ODSWG.fda6d0cf-c590-43cb-bb01-53a0100e33d8&forceJpeg=1&o=6">
            <div class="welcome-title">
              <h2>Video games to play with a beginner</h2>
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