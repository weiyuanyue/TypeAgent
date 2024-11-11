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
      const welcomeSection = this.querySelector("#welcome-section") as HTMLElement | null;
      if (welcomeSection) {
        if (this.chatView?.getUserMessageCount()) {
          welcomeSection.classList.add("hidden");
        } else if (this.chatView?.getUserMessageCount() === 0) {
          welcomeSection.classList.remove("hidden");
        }
      } else {
        clearInterval(checkMsgCountTimer);
      }
    }, 1000);
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

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  render() {
    const list = [{
      title: "Your next musical obsession awaits here",
      query: "play some classical music",
      cover: "./assets/music.jpeg",
    }, {
      title: "Explore what's happening worldwide today",
      query: "go to New York Times in browser",
      cover: "./assets/news.jpeg",
    }, {
      title: "See beyond the ordinary with your camera",
      query: "@config agent desktop; launch the camera app.",
      cover: "./assets/camera.jpeg",
    }, {
      title: "Begin your art journey here",
      query: "@config agent desktop; open paint.",
      cover: "./assets/paint.jpeg",
    }];

  const shuffledList = this.shuffleArray(list);

    this.innerHTML = `
    <section class="welcome-section" id="welcome-section">
      <h1>Welcome to Chati</h1>
      <div class="welcome-grid">
        <button class="grid-child-btn welcome-btn-2" type="submit" data-query="${shuffledList[0].query}">
          <div class="grid-child">
            <div class="welcome-title">
              <h2>${shuffledList[0].title}</h2>
            </div>
            <img class="welcome-img" src="${shuffledList[0].cover}">
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-3" type="submit" data-query="${shuffledList[1].query}">
          <div class="grid-child">
            <div class="welcome-title">
              <h2>${shuffledList[1].title}</h2>
            </div>
            <img class="welcome-img" src="${shuffledList[1].cover}">
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-2" type="submit" data-query="${shuffledList[2].query}">
          <div class="grid-child">
            <img class="welcome-img" src="${shuffledList[2].cover}">
            <div class="welcome-title">
              <h2>${shuffledList[2].title}</h2>
            </div>
          </div>
        </button>
        <button class="grid-child-btn welcome-btn-3" type="submit" data-query="${shuffledList[3].query}">
          <div class="grid-child">
            <img class="welcome-img" src="${shuffledList[3].cover}">
            <div class="welcome-title">
              <h2>${shuffledList[3].title}</h2>
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