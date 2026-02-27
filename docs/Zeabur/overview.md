# Zeabur 部署問題

若未連結 GitHub，Zeabur 需要手動設定 Dockerfile 才能部署。

請依照以下步驟設定：

1.  前往服務的 Settings，將 Root Directory 設定為 `.` (或 Dockerfile 所在目錄)。
2.  前往 Settings > Dockerfile，手動指定 Dockerfile (或直接貼上 Dockerfile 內容)。
3.  點擊 Redeploy Service 重新部署。

並確認您的服務是否確實監聽在 `0.0.0.0`。
