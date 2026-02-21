# Deploy Note

使用 VitePress 建立的技術筆記站，所有筆記內容放在 `docs/`，並透過 GitHub Actions 自動部署到 GitHub Pages。

## 專案結構

```text
.
├─ docs/
│  ├─ .vitepress/
│  │  ├─ config.ts
│  │  └─ theme/
│  │     ├─ index.ts
│  │     └─ style.css
│  ├─ index.md
│  ├─ markdown-examples.md
│  └─ api-examples.md
├─ .github/
│  └─ workflows/
│     └─ deploy-docs.yml
├─ package.json
└─ LICENSE
```

## 筆記站實作方式

- 所有 Markdown 筆記皆放在 `docs/`。
- VitePress 設定檔在 `docs/.vitepress/config.ts`。
- `config.ts` 會在啟動與 build 時掃描檔案系統，自動產生 sidebar。
- `config.ts` 會自動依 GitHub Actions 環境計算 `base`，避免 GitHub Pages 子路徑部署時發生 CSS/JS 404。
- GitHub Actions 會在 `main` 有新 commit 時，自動 build 與部署到 GitHub Pages（`.github/workflows/deploy-docs.yml`）。
- `docs/.vitepress/theme/index.ts` 透過 `medium-zoom` 全域啟用「點擊圖片放大」。

## 全域圖片放大設定

對應檔案：

- `docs/.vitepress/theme/index.ts`
- `docs/.vitepress/theme/style.css`

目前行為：

- 所有筆記內容區（`.vp-doc`）中的圖片，都可點擊放大。
- 切換頁面後會自動重新綁定，不需要每篇手動設定。
- 若圖片在連結內（`<a><img /></a>`）或帶有 `.no-zoom`，會自動排除放大。

若某張圖不想啟用放大，請在 Markdown 中改用 HTML 並加上 `no-zoom`：

```html
<img src="./image.png" alt="示意圖" class="no-zoom" />
```

## Sidebar Item 形成規則

對應檔案：`docs/.vitepress/config.ts`

1. 掃描 `docs/`，忽略隱藏檔案/資料夾與 `.vitepress`。
2. 支援遞迴子資料夾（多層資料夾）。
3. 每個資料夾都會建立成一個群組（即使只有 `overview.md`）。
4. 每個資料夾內的 `.md` 會變成 item 連結。
5. 根目錄 `index.md` 不放入 sidebar（首頁仍由 `/` 進入）。
6. 根目錄其他 `.md`（例如 `promptfile.md`）會放在「根目錄」群組。
7. 目錄與檔案以 `zh-Hant` locale 排序。
8. 根層資料夾群組預設收合（collapsed）。

## 資料夾收合設定

位置：`docs/.vitepress/config.ts`

- 變數：`expandedTopLevelDirs`
- 預設：根層資料夾全部收合

若要讓特定資料夾預設展開，可改成：

```ts
const expandedTopLevelDirs = new Set<string>(['Copilot'])
```

## 安裝與執行

### 環境需求

- Node.js 18+
- npm

### 安裝

```bash
npm ci
```

### 本機開發

```bash
npm run docs:dev
```

啟動後可在終端機顯示的本機網址瀏覽。

### Build

```bash
npm run docs:build
```

輸出目錄為：`docs/.vitepress/dist`

### Build 後預覽

```bash
npm run docs:preview
```

## 如何使用

1. 在 `docs/` 新增或編輯 `.md` 筆記。
2. 若要分門別類，直接建立子資料夾並放入 `.md`。
3. 重新啟動或重新整理開發站後，sidebar 會依規則自動更新。
4. `docs/index.md` 作為首頁，不會出現在 sidebar。

## 自動部署

- Workflow：`.github/workflows/deploy-docs.yml`
- 觸發條件：push 到 `main`
- 流程：`npm ci` -> `npm run docs:build` -> 部署 `docs/.vitepress/dist` 到 GitHub Pages
- `base` 行為：
  - GitHub Actions + 專案頁面（例如 `owner/deploy-note`）會自動使用 `/<repo>/`。
  - 使用者/組織頁面 repo（`*.github.io`）或本機環境使用 `/`。

## License

本專案採用 [MIT License](LICENSE)。
