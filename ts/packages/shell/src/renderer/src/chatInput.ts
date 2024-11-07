// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { _arrayBufferToBase64, ChatView } from "./chatView";
import {
    iconMicrophone,
    iconMicrophoneListening,
    iconMicrophoneDisabled,
    iconCamera,
    iconAttach,
    iconSend,
    iconCopilot,
} from "./icon";
import { getClientAPI } from "./main";
import { setContent } from "./setContent";
import { SettingsView } from "./settingsView";
import { recognizeOnce } from "./speech";
import { getSpeechToken } from "./speechToken";

export interface ExpandableTextareaHandlers {
    onSend: (text: string) => void;
    altHandler?: (eta: ExpandableTextarea, event: KeyboardEvent) => void;
    onChange?: (eta: ExpandableTextarea) => void;
    onFocus?: (eta: ExpandableTextarea) => void;
    onBlur?: (eta: ExpandableTextarea) => void;
    onKeydown?: (eta: ExpandableTextarea, event: KeyboardEvent) => boolean;
}

export class ExpandableTextarea {
    private textEntry: HTMLSpanElement;
    private inputContainer: HTMLDivElement;
    private entryHandlers: ExpandableTextareaHandlers;

    constructor(
        id: string,
        className: string,
        handlers: ExpandableTextareaHandlers,
        sendButton?: HTMLButtonElement,
    ) {
        this.entryHandlers = handlers;
        this.inputContainer = document.createElement("div");
        this.inputContainer.className = "chat-input-container";
        this.textEntry = document.createElement("span");
        this.textEntry.className = className;
        this.textEntry.classList.add("chat-input-empty");
        this.textEntry.contentEditable = "true";
        this.textEntry.role = "textbox";
        this.textEntry.id = id;

        this.textEntry.addEventListener("keyup", () => {
            if (this.textEntry.innerText.length > 0) {
                this.textEntry.classList.remove("chat-input-empty");
            } else {
                this.textEntry.classList.add("chat-input-empty");
            }
        });
        this.textEntry.addEventListener("keydown", (event) => {
            if (this.entryHandlers.onKeydown !== undefined) {
                if (!this.entryHandlers.onKeydown(this, event)) {
                    event.preventDefault();
                    return false;
                }
            }
            if (event.key === "Enter") {
                event.preventDefault();
                this.send(sendButton);
            } else if (
                event.altKey &&
                this.entryHandlers.altHandler !== undefined
            ) {
                this.entryHandlers.altHandler(this, event);
            } else if (event.key == "Escape") {
                this.textEntry.textContent = "";
                event.preventDefault();
            }
            return true;
        });
        this.textEntry.addEventListener("input", () => {
            if (this.entryHandlers.onChange !== undefined) {
                this.entryHandlers.onChange(this);
            }

            if (sendButton !== undefined) {
                sendButton.disabled = this.textEntry.innerHTML.length == 0;
            }
        });
        this.textEntry.addEventListener("focus", () => {
            if (this.entryHandlers.onFocus !== undefined) {
                this.entryHandlers.onFocus(this);
                this.addClass("has-focus");
            }
        });
        this.textEntry.addEventListener("blur", () => {
            if (this.entryHandlers.onBlur !== undefined) {
                this.entryHandlers.onBlur(this);
            }
        });
    }

    addClass(className: string) {
        if (!this.textEntry.classList.contains(className))
        this.textEntry.classList.add(className);
    }

    removeClass(className: string) {
        if (this.textEntry.classList.contains(className))
        this.textEntry.classList.remove(className);
    }

    getEditedText() {
        return this.getTextEntry().innerText.trim();
    }

    getTextEntry() {
        return this.textEntry;
    }

    getContainer() {
        return this.inputContainer;
    }

    setContent(content: string | null) {
        if (this.textEntry.textContent !== content) {
            this.textEntry.textContent = content;
        }

        // Set the cursor to the end of the text
        const r = document.createRange();
        r.setEnd(this.textEntry.childNodes[0], content?.length ?? 0);
        r.collapse(false);
        const s = document.getSelection();
        if (s) {
            s.removeAllRanges();
            s.addRange(r);
        }
    }

    replaceTextAtCursor(
        text: string,
        cursorOffset: number = 0,
        length: number = 0,
    ) {
        const s = document.getSelection();
        if (s) {
            if (s.rangeCount > 1) {
                return;
            }
            const currentRange = s.getRangeAt(0);
            if (!currentRange.collapsed) {
                return;
            }
            if (currentRange.startContainer === this.textEntry.childNodes[0]) {
                const currentText = this.textEntry.innerText;
                let offset = currentRange.startOffset + cursorOffset;
                if (offset < 0 || offset > currentText.length) {
                    return;
                }
                const prefix = this.textEntry.innerText.substring(0, offset);
                const suffix = this.textEntry.innerText.substring(
                    offset + length,
                );
                this.textEntry.innerText = prefix + text + suffix;

                const newRange = document.createRange();
                newRange.setEnd(
                    this.textEntry.childNodes[0],
                    prefix.length + text.length,
                );
                newRange.collapse(false);
                const s = document.getSelection();
                if (s) {
                    s.removeAllRanges();
                    s.addRange(newRange);
                }
            }
        }
    }
    send(sendButton?: HTMLButtonElement) {
        const text = this.getTextEntry().innerHTML;
        if (text.length > 0) {
            this.entryHandlers.onSend(text);
            this.textEntry.innerText = "";
            if (sendButton) {
                sendButton.disabled = true;
                this.addClass("chat-input-empty");
            }
        }
    }

    public focus() {
        setTimeout(() => this.textEntry.focus(), 0);
    }
}

export function questionInput(
    chatView: ChatView,
    questionId: number,
    message: string,
    id: string,
    settingsView: SettingsView,
) {
    // use this to type replacement JSON object for action
    // first make a container div
    const replacementContainer = document.createElement("div");
    replacementContainer.className = "replacement-container";
    // then add a title div to it
    const title = document.createElement("div");
    title.className = "replacement-title";
    setContent(title, message, settingsView);
    replacementContainer.appendChild(title);
    // then add a replacement div to it
    const textarea = new ExpandableTextarea(
        "replacementDiv",
        "replacement-textarea",
        {
            onSend: (html) => {
                // REVIEW: text is from innerHTML, is that ok?
                chatView.answer(questionId, html, id);
            },
        },
    );
    const replacementDiv = textarea.getTextEntry();
    setTimeout(() => {
        replacementDiv.focus();
    }, 0);
    replacementContainer.appendChild(textarea.getTextEntry());

    return replacementContainer;
}

export class ChatInput {
    private inputContainer: HTMLDivElement;
    textarea: ExpandableTextarea;
    private micButton: HTMLButtonElement;
    attachButton: HTMLLabelElement;
    camButton: HTMLButtonElement;
    private dragTemp: string | undefined = undefined;
    private fileInput: HTMLInputElement;
    public dragEnabled: boolean = true;
    sendButton: HTMLButtonElement;
    newChatButton: HTMLButtonElement;
    // private separator: HTMLDivElement;
    // private separatorContainer: HTMLDivElement;
    constructor(
        inputId: string,
        buttonId: string,
        chatView: ChatView,
        messageHandler: (message: string) => void,
        onChange?: (eta: ExpandableTextarea) => void,
        onKeydown?: (eta: ExpandableTextarea, event: KeyboardEvent) => boolean,
    ) {
        this.inputContainer = document.createElement("div");
        this.inputContainer.className = "chat-input";
        this.sendButton = document.createElement("button");
        this.sendButton.appendChild(iconSend());
        this.sendButton.className = "chat-send-button";
        this.sendButton.type = "submit";
        this.sendButton.onclick = () => {
            this.textarea.send();
        };
        this.sendButton.disabled = true;
        const self = this;
        this.textarea = new ExpandableTextarea(
            inputId,
            "user-textarea scroll_enabled",
            {
                onSend: messageHandler,
                onChange,
                onKeydown,
                onFocus: self.onFocus.bind(self),
                onBlur: self.onBlur.bind(self),
            },
            this.sendButton,
        );

        this.textarea.getTextEntry().ondragenter = (e: DragEvent) => {
            if (!this.dragEnabled) {
                return;
            }

            e.preventDefault();
            console.log(e);

            if (this.dragTemp === undefined) {
                this.dragTemp = this.textarea.getTextEntry().innerHTML;
            }

            console.log("enter " + this.dragTemp);

            this.textarea.getTextEntry().innerText = "Drop image files here...";
            this.textarea.getTextEntry().classList.add("chat-input-drag");
        };

        this.textarea.getTextEntry().ondragleave = (e: DragEvent) => {
            if (!this.dragEnabled) {
                return;
            }

            this.textarea.getTextEntry().classList.remove("chat-input-drag");

            if (this.dragTemp) {
                this.textarea.getTextEntry().innerHTML = this.dragTemp;
                this.dragTemp = undefined;
            }
            e.preventDefault();

            console.log("leave " + this.dragTemp);
        };

        this.textarea.getTextEntry().ondrop = async (e: DragEvent) => {
            if (!this.dragEnabled) {
                return;
            }

            console.log(e);

            this.textarea.getTextEntry().classList.remove("chat-input-drag");
            if (this.dragTemp) {
                this.textarea.getTextEntry().innerHTML = this.dragTemp;
            } else {
                this.clear();
            }

            this.dragTemp = undefined;

            if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
                this.loadImageFile(e.dataTransfer.files[0]);
            }

            e.preventDefault();
        };

        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.classList.add("chat-message-hidden");
        this.fileInput.id = "image_upload";
        this.inputContainer.append(this.fileInput);
        this.fileInput.accept = "image/*,.jpg,.png,.gif";
        this.fileInput.onchange = () => {
            if (this.fileInput.files && this.fileInput.files?.length > 0) {
                this.loadImageFile(this.fileInput.files[0]);
            }
        };

        this.newChatButton = document.createElement("button");
        this.newChatButton.appendChild(iconCopilot());
        this.newChatButton.className = "chat-input-button";
        this.newChatButton.type = "button";
        this.newChatButton.addEventListener("click", () => {
            chatView.clear();
        });
        this.inputContainer.append(this.newChatButton);

        this.micButton = document.createElement("button");
        this.micButton.appendChild(iconMicrophone());
        this.micButton.id = buttonId;
        this.micButton.className = "chat-input-button";
        this.micButton.type = "button";
        this.micButton.addEventListener("click", async () => {
            const useLocalWhisper =
                await getClientAPI().getLocalWhisperStatus();
            if (useLocalWhisper) {
                recognizeOnce(
                    undefined,
                    inputId,
                    buttonId,
                    messageHandler,
                    useLocalWhisper,
                );
            } else {
                recognizeOnce(
                    await getSpeechToken(),
                    inputId,
                    buttonId,
                    messageHandler,
                );
            }
        });

        const listeningMic = iconMicrophoneListening();
        listeningMic.className = "chat-message-hidden";
        this.micButton.appendChild(listeningMic);

        const disabledMic = iconMicrophoneDisabled();
        disabledMic.className = "chat-message-hidden";
        this.micButton.appendChild(disabledMic);

        this.camButton = document.createElement("button");
        this.camButton.appendChild(iconCamera());
        this.camButton.className = "chat-input-button";
        this.camButton.type = "button";
        this.attachButton = document.createElement("label");
        this.attachButton.htmlFor = this.fileInput.id;
        this.attachButton.appendChild(iconAttach());
        this.attachButton.className = "chat-input-button";

        getSpeechToken().then((result) => {
            if (result == undefined) {
                const button = document.querySelector<HTMLButtonElement>(
                    `#${buttonId}`,
                )!;
                button.disabled = true;
                button.children[0].classList.add("chat-message-hidden");
                button.children[1].classList.add("chat-message-hidden");
                button.children[2].classList.remove("chat-message-hidden");
            }
        });

        this.textarea.getContainer().appendChild(this.textarea.getTextEntry());
        this.textarea.getContainer().appendChild(this.sendButton);
        this.inputContainer.appendChild(this.textarea.getContainer());
        this.inputContainer.appendChild(this.attachButton);
        this.inputContainer.appendChild(this.camButton);
        this.inputContainer.appendChild(this.micButton);
    }

    async loadImageFile(file: File) {
        let buffer: ArrayBuffer = await file.arrayBuffer();

        let dropImg: HTMLImageElement = document.createElement("img");
        let mimeType = file.name
            .toLowerCase()
            .substring(file.name.lastIndexOf(".") + 1, file.name.length);

        if (file.name.toLowerCase().endsWith(".jpg")) {
            mimeType = "jpeg";
        }

        const supportedMimeTypes: Set<string> = new Set<string>([
            "jpg",
            "jpeg",
            "png",
        ]);
        if (!supportedMimeTypes.has(mimeType)) {
            console.log(`Unsupported MIME type for '${file.name}'`);
            this.textarea.getTextEntry().innerText = `Unsupported file type '${mimeType}'. Supported types: ${Array.from(supportedMimeTypes).toString()}`;
            return;
        }
        dropImg.src =
            `data:image/${mimeType};base64,` + _arrayBufferToBase64(buffer);

        dropImg.className = "chat-input-dropImage";

        this.textarea.getTextEntry().append(dropImg);

        if (this.sendButton !== undefined) {
            this.sendButton.disabled =
                this.textarea.getTextEntry().innerHTML.length == 0;
        }
        this.textarea.focus();
    }

    clear() {
        this.textarea.getTextEntry().innerText = "";
        this.dragTemp = undefined;
    }

    getInputContainer() {
        return this.inputContainer;
    }
    onFocus() {
        this.inputContainer.classList.add("chat-input-focus");
    }
    onBlur() {
        if (this.textarea.getTextEntry().innerText?.length === 0) {
            setTimeout(() => {
                this.getInputContainer()?.classList.remove("chat-input-focus");
            }, 500);
        }
    }

    public focus() {
        this.textarea.focus();
    }
}
