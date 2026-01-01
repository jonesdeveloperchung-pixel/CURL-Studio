# 🎨 UI/UX Design Specification: CURL Studio

## 1. Design Philosophy
- **"Studio" Aesthetic**: Use the Glassmorphism style from the reference (`glass` class), featuring semi-transparent backgrounds, subtle borders, and background blurs.
- **Visual Feedback**: Use gradients (`gradient-text`) for headers and high-contrast indicators for status codes.
- **Efficiency**: Multi-pane layout with immediate visual response for command generation and execution metadata.

---

## 2. Interface Layout (The "Gemini Studio" Layout)

### 2.1 Navigation Sidebar (Left)
- **Compact & Expanded Modes**: 20px (icons only) or 64px (with labels) width.
- **Branding**: Gradient logo icon with "CURL Studio" title.
- **Nav Items**: Collections, History, Environments, and a "Terminal" view.

### 2.2 Request Workspace (Top Pane)
- **URL Bar Section**: 
  - Method Selector: Styled dropdown with bold colored text (e.g., Blue-400 for GET).
  - URL Input: Dark recessed input field (`bg-slate-900`).
  - Send Button: Large primary button with `Send` icon and loading state.
- **Tabbed Request Editor**:
  - **Params & Headers**: Key-Value table with checkboxes for enabling/disabling fields and a "Trash" icon on hover.
  - **Body**: Recessed monospace text area for JSON/Raw data.
  - **Live Preview**: Terminal-style box at the bottom showing the generated `curl` or `PowerShell` command.

### 2.3 Response Workspace (Bottom Pane)
- **Metadata Header**: Displays Status (Green/Red), Execution Time (ms), and Response Size (KB).
- **Body Viewer**: Pretty-printed JSON with `blue-300` text on a dark background.

---

## 3. Visual Components (Based on Reference)

### 3.1 Color Palette
- **Background**: Deep Indigo/Slate (`bg-slate-950/50`).
- **Glass Panels**: `bg-white/5` with `backdrop-blur-md` and `border-white/5`.
- **Accents**: 
  - Primary: `blue-600` (Send button).
  - Secondary: `purple-600` (Branding).
  - Neutral: `slate-400` (Subtitles/Icons).

### 3.2 Typography
- **UI**: Inter or Sans-serif for navigation and labels.
- **Data**: JetBrains Mono or monospace for URLs, JSON, and Terminal previews.

---

## 4. User Interaction Flows
1. **Command Generation**: As the user types the URL or adds headers, the "Terminal Preview" at the bottom updates instantly.
2. **Flavor Switching**: Toggle button next to the preview box switches the syntax between `Standard Curl` and `PowerShell`.
3. **Execution**: "Send" button triggers a backend execution, showing a pulsing loader in the button and sidebar.

---

## 5. Accessibility & Responsiveness
- **Keyboard Shortcuts**: `Ctrl + Enter` to Send, `Ctrl + S` to Save.
- **Responsive Design**: Sidebar collapses on smaller screens; vertical layout switches to horizontal on wide monitors.
- **Contrast**: Adherence to WCAG AA standards for text readability.

---

## 6. Deliverables
- **Component Mockups**: High-fidelity React components.
- **Icon Set**: Lucide-React implementation.
- **Theming Logic**: Tailwind configuration for Dark/Light mode.