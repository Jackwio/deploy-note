# Deploy Note

使用 VitePress 建立的技術筆記站，所有筆記內容放在 `docs/`，並透過 GitHub Actions 自動部署到 GitHub Pages。

## 專案結構

```text
.
├─ docs/
│  ├─ .vitepress/
│  │  └─ config.ts
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
- GitHub Actions 會在 `main` 有新 commit 時，自動 build 與部署到 GitHub Pages（`.github/workflows/deploy-docs.yml`）。

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

## License

本專案採用 [MIT License](LICENSE)。
