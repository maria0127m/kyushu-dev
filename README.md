# kyushu-dev

九州大学の学内ネットワークにいるかどうかを記録・公開する Web サイトです。

公開URL：

```text
https://kyushu-dev.kyudai.workers.dev
```

このリポジトリは [`inaniwaudon/tsukuba-yokohama-dev`](https://github.com/inaniwaudon/tsukuba-yokohama-dev) をもとに、九州大学向けに設定を変更したものです。

## これは何？

九州大学の学内ネットワークから定期的にチェックインすることで、各ユーザーが現在九州大学内にいるかどうかを記録・表示する Web アプリです。

各ユーザーのページは、以下の形式で表示されます。

```text
https://kyushu-dev.kyudai.workers.dev/@screenname
```

例：

```text
https://kyushu-dev.kyudai.workers.dev/@maria
```

## 判定方法

* `133.5.0.0/16` からの接続を九州大学内と判定します
* それ以外の IP アドレスからの接続は学外と判定します
* VPN 経由の場合、出口 IP が `133.5.0.0/16` でなければ学外判定になります
* 判定にはアクセス元 IP を使いますが、IP アドレス自体は保存しません
* 保存されるのは「九州大学内」または「学外」という判定結果です

## 初めて使う人向け：利用開始手順

### 1. サイトにアクセスする

以下のURLを開きます。

```text
https://kyushu-dev.kyudai.workers.dev
```

### 2. アカウントを作成する

トップページの登録フォームから、以下を入力して登録します。

* ID
* 名前
* ひとこと

IDはURLに使われます。

例として、IDを `murai` にすると、個人ページは以下になります。

```text
https://kyushu-dev.kyudai.workers.dev/@murai
```

### 3. トークンを控える

登録すると、チェックイン用のトークンが発行されます。

このトークンは、あとで自動チェックイン設定に使います。

注意：

* トークンは他人に見せないでください
* GitHubやSNSに貼らないでください
* スクリーンショットに写さないようにしてください
* 漏れた可能性がある場合は、ページ上部の設定からトークンを再発行してください

## 手動でチェックインする方法

PowerShellやターミナルから、以下を実行します。

```bash
curl -X POST "https://kyushu-dev.kyudai.workers.dev/api/checkins" \
  -H "Authorization: <YOUR_TOKEN>"
```

`<YOUR_TOKEN>` は、自分のトークンに置き換えてください。

Windows の PowerShell では、`curl` ではなく `curl.exe` を使う方が安全です。

```powershell
curl.exe -X POST "https://kyushu-dev.kyudai.workers.dev/api/checkins" -H "Authorization: <YOUR_TOKEN>"
```

成功すると、以下のような返答が返ります。

```json
{"count":1}
```

このあと自分のページを再読み込みすると、最終更新時刻が変わります。

## Windowsで自動チェックインする方法

Windowsでは、PowerShellスクリプトとタスクスケジューラを使って自動チェックインできます。

### 1. スクリプト用フォルダを作る

以下の場所にフォルダを作ります。

```text
C:\Users\maria\kyushu-checkin
```

自分のユーザー名が `maria` ではない場合は、自分のユーザー名に置き換えてください。

### 2. チェックイン用スクリプトを作る

以下のファイルを作成します。

```text
C:\Users\maria\kyushu-checkin\kyushu-checkin.ps1
```

中身は以下です。

```powershell
$ErrorActionPreference = "Stop"

$token = "<YOUR_TOKEN>"
$url = "https://kyushu-dev.kyudai.workers.dev/api/checkins"

Invoke-RestMethod `
  -Method POST `
  -Uri $url `
  -Headers @{ Authorization = $token } | Out-Null
```

`<YOUR_TOKEN>` を自分のトークンに置き換えてください。

### 3. 手動で実行テストする

PowerShellで以下を実行します。

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\maria\kyushu-checkin\kyushu-checkin.ps1"
```

エラーが出なければ成功です。

サイトを再読み込みして、最終更新時刻が変わっているか確認してください。

### 4. PowerShell画面を出さないためのファイルを作る

自動実行のたびにPowerShell画面が出るのを防ぐため、以下のファイルを作ります。

```text
C:\Users\maria\kyushu-checkin\run-hidden.vbs
```

中身は以下です。

```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""C:\Users\maria\kyushu-checkin\kyushu-checkin.ps1""", 0, False
```

### 5. タスクスケジューラに登録する

PowerShellで以下を実行します。

```powershell
$script = "C:\Users\maria\kyushu-checkin\run-hidden.vbs"

$action = New-ScheduledTaskAction `
  -Execute "wscript.exe" `
  -Argument "`"$script`""

$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes 10) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName "KyushuDevCheckin" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Check in to kyushu-dev every 10 minutes"
```

これで、PCが起動している間は10分ごとに自動チェックインされます。

### 6. タスクを手動で実行する

```powershell
Start-ScheduledTask -TaskName "KyushuDevCheckin"
```

### 7. タスクを確認する

```powershell
Get-ScheduledTask -TaskName "KyushuDevCheckin"
```

### 8. 自動チェックインを止める

一時停止する場合：

```powershell
Disable-ScheduledTask -TaskName "KyushuDevCheckin"
```

完全に削除する場合：

```powershell
Unregister-ScheduledTask -TaskName "KyushuDevCheckin" -Confirm:$false
```

## macOSで自動チェックインする方法

macOSでは `launchd` を使って自動チェックインできます。

### 1. `dev.kyudai.plist` をダウンロードする

このリポジトリにある以下のファイルを使います。

```text
dev.kyudai.plist
```

### 2. トークンを書き換える

ファイル内の

```text
$YOUR_TOKEN
```

を、自分のトークンに置き換えます。

### 3. `LaunchAgents` に保存する

```bash
cp dev.kyudai.plist ~/Library/LaunchAgents/dev.kyudai.plist
```

### 4. 読み込む

```bash
launchctl load ~/Library/LaunchAgents/dev.kyudai.plist
```

これで定期的にチェックインされます。

## サインインについて

ブラウザのCookieはURLごとに別管理されます。

そのため、URLが変わった場合やブラウザを変えた場合は、再度サインインが必要になることがあります。

ただし、アカウント作成をやり直す必要はありません。

登録済みのユーザーは、発行済みのトークンを使ってサインインしてください。

## 設定の変更

自分のページ上部を開くと、以下を変更できます。

* 名前
* ひとこと
* 公開設定
* 一覧への表示
* 過去記録の表示
* トークン再発行

## 注意事項

* トークンは秘密情報です
* トークンをGitHubにpushしないでください
* 研究室や知人に配布する場合も、自分のトークンは共有しないでください
* 自動チェックインは、PCが起動している間だけ動きます
* PCがスリープ中、電源OFF中、ネットワーク未接続の場合は実行されません
* 九大学内ネットワーク外で実行されると、学外として記録されます

## 開発者向け：構成

### フロントエンド

* Vite
* React
* React Router

### バックエンド

* Hono
* Cloudflare Workers
* Cloudflare D1

`/api` 以下に API を、それ以外のパスにフロントエンドをルーティングします。

## 開発者向け：ローカル開発

```bash
cd frontend
yarn
yarn run watch

cd ../hono
cp wrangler.jsonc.sample wrangler.jsonc
yarn
yarn run dev
```

## 開発者向け：デプロイ

```bash
cd frontend
yarn run build

cd ../hono
yarn run deploy
```

または、Wranglerを直接使う場合：

```bash
cd frontend
npm run build

cd ../hono
npx wrangler deploy
```

## GitHubに変更を反映する方法

変更後は以下を実行します。

```bash
git status
git add .
git commit -m "Update documentation"
git push origin main
```

`hono` フォルダ内にいる状態で `frontend` の変更を追加したい場合は、例えば以下のように指定します。

```bash
git add ../frontend/index.html ../frontend/src/components/UserPage.tsx
```

## ライセンス

Copyright (c) 2025 いなにわうどん.

This project is released under the MIT License. See [LICENSE](./LICENSE).

MIT ライセンスに従って、自由に使用・再配布等を行うことができます。
