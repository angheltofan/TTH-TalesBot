# TTH - Tale Bot (Tales & Tech Helper)

**TTH (Tale Bot)** este o aplicație web progresivă (PWA) construită cu **React** și **Vite**, care utilizează **Google Gemini Live API** pentru a oferi o interacțiune vocală naturală, în timp real, cu copiii. Robotul poate juca diverse jocuri educative, spune povești și testa cunoștințele generale, totul într-un mediu controlat și prietenos.

## ✨ Funcționalități Principale

*   **🗣️ Interacțiune Vocală în Timp Real:** Folosește noua capabilitate Gemini Live (WebSocket) pentru latență minimă și conversații fluide.
*   **🎮 Moduri de Joc Multiple:**
    *   **Magic Jinn:** Robotul ghicește animalul la care se gândește copilul.
    *   **Cultură Generală:** Întrebări trivia adaptate vârstei.
    *   **Logică și Matematică:** Exerciții de "gimnastică a minții".
    *   **Creator de Povești:** Crearea unei povești colaborative, frază cu frază.
*   **📱 Suport PWA:** Poate fi instalată ca aplicație nativă pe telefoane și tablete (iOS/Android).
*   **⚙️ Configurare Dinamică:** Prompt-urile și personalitatea robotului sunt încărcate din Google Sheets, permițând actualizarea conținutului fără redeploy.
*   **🎨 Interfață Vizuală:** Avatar animat, vizualizator audio reactiv și design adaptat pentru copii.

## 🛠️ Tehnologii Utilizate

*   **Frontend:** React 18 (TypeScript), Tailwind CSS
*   **Build Tool:** Vite
*   **AI:** `@google/genai` (Gemini Multimodal Live API)
*   **Audio:** Web Audio API (procesare PCM 16kHz/24kHz)
*   **Icons:** Lucide React, React Icons

Aplicația folosește API-ul Gemini Live care este în stadiu *preview*. Ocazional pot apărea întreruperi sau limitări de cotă (Rate Limits) în funcție de cheia API utilizată.

---
Dezvoltat cu ❤️ pentru Tales & Tech.
