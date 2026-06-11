# kyushu-dev

九州大学の学内ネットワークにいるかどうかを記録・表示する Web サイトです。

公開URL：

```text
https://kyushu-dev.kyudai.workers.dev
```

このリポジトリは [`inaniwaudon/tsukuba-yokohama-dev`](https://github.com/inaniwaudon/tsukuba-yokohama-dev) をもとに、九州大学向けに設定を変更したものです。

## これは何？

九州大学の学内ネットワークから定期的にチェックインすることで、各ユーザーが現在九州大学内にいるかどうかを記録・表示する Web アプリです。

<div align="center"> 
 <img width="600" alt="個人ページの表示例" src="https://github.com/user-attachments/assets/a14e5902-7d41-4f59-a0e0-295cb4539d40" />
 <br />
 <span style="font-size: 11px; color: #777;">
 <p><small>　オレンジ：学内　／　グレー：学外　／　グレー：記録なし   </small></p>
 </span>
  <br />
  <br />
</div>


各ユーザーのページは以下の形式で表示されます。

```text
https://kyushu-dev.kyudai.workers.dev/@screenname
```

例：

```text
https://kyushu-dev.kyudai.workers.dev/@murai
```

## 判定方法

* `133.5.0.0/16` からの接続を九州大学内と判定します
* それ以外の IP アドレスからの接続は学外と判定します
* VPN 経由の場合、出口 IP が `133.5.0.0/16` でなければ学外判定になります
* 判定にはアクセス元 IP を使いますが、IP アドレス自体は保存しません
* 保存されるのは「九州大学内」または「学外」という判定結果です

## プライバシーと閲覧範囲

このアプリは、利用者の在学・在室・所在に近い情報を扱う可能性があります。

そのため、運用方針は以下の通りです。

* 初回登録は九州大学の学内ネットワークからのみ可能です
* 「みんなのきろく」は、登録済みユーザーのみ閲覧できます
* 各ユーザーは公開設定を変更できます

  * 公開
  * 学内限定
  * 非公開
* IP アドレス自体は保存しません
* チェックイン用トークンは秘密情報として扱ってください

## 初めて使う人向け：利用開始手順

### 1. サイトにアクセスする

以下のURLを開きます。

```text
https://kyushu-dev.kyudai.workers.dev
```

### 2. アカウントを作成する

九州大学の学内Wi-Fi、または学内ネットワークにつないだ状態で、アカウントを作成します。

登録時に入力するもの：

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
* 漏れた可能性がある場合は、アカウント設定からトークンを再発行してください

### 4. サインインする

別のブラウザや別の端末で使う場合は、発行済みのトークンを使ってサインインします。

アカウントを作り直す必要はありません。

## 手動でチェックインする方法

### macOS / Linux / Git Bash の場合

ターミナルで以下を実行します。

```bash
curl -X POST "https://kyushu-dev.kyudai.workers.dev/api/checkins" \
  -H "Authorization: <YOUR_TOKEN>"
```

`<YOUR_TOKEN>` は、自分のトークンに置き換えてください。

### Windows PowerShell の場合

Windows PowerShell では、`curl` ではなく `curl.exe` を使う方が安全です。

```powershell
curl.exe -X POST "https://kyushu-dev.kyudai.workers.dev/api/checkins" -H "Authorization: <YOUR_TOKEN>"
```

`<YOUR_TOKEN>` は、自分のトークンに置き換えてください。

成功すると、以下のような返答が返ります。

```json
{"count":1}
```

そのあと自分のページを再読み込みすると、最終更新時刻が変わります。


## Windowsで自動チェックインする方法

Windowsでは、PowerShellスクリプトとタスクスケジューラを使って自動チェックインできます。

### 1. スクリプト用フォルダを作る

エクスプローラーで、以下のようなフォルダを作ります。

```text
C:\Users\<USERNAME>\kyushu-checkin
```

`<USERNAME>` は自分のWindowsユーザー名に置き換えてください。

例：

```text
C:\Users\murai\kyushu-checkin
```

### 2. チェックイン用スクリプトを作る

以下のファイルを作ります。

```text
C:\Users\<USERNAME>\kyushu-checkin\kyushu-checkin.ps1
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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\kyushu-checkin\kyushu-checkin.ps1"
```

エラーが出なければ成功です。

サイトを再読み込みして、最終更新時刻が変わっているか確認してください。

### 4. PowerShell画面を出さないためのファイルを作る

自動実行のたびにPowerShell画面が出るのを防ぐため、以下のファイルを作ります。

```text
C:\Users\<USERNAME>\kyushu-checkin\run-hidden.vbs
```

中身は以下です。

```vbscript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & CreateObject("WScript.Shell").ExpandEnvironmentStrings("%USERPROFILE%") & "\kyushu-checkin\kyushu-checkin.ps1""", 0, False
```

### 5. タスクスケジューラに登録する

PowerShellで以下を実行します。

```powershell
$script = "$env:USERPROFILE\kyushu-checkin\run-hidden.vbs"

$action = New-ScheduledTaskAction `
  -Execute "wscript.exe" `
  -Argument "`"$script`""

$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes 5) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
  -TaskName "KyushuDevCheckin" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Check in to kyushu-dev every 5 minutes"
```

これで、PCが起動している間は5分ごとに自動チェックインされます。

### 6. タスクを手動で実行する

```powershell
Start-ScheduledTask -TaskName "KyushuDevCheckin"
```

### 7. タスクの状態を確認する

```powershell
Get-ScheduledTaskInfo -TaskName "KyushuDevCheckin"
```

確認するポイント：

```text
LastRunTime      : 最後に実行された時刻
LastTaskResult   : 0 なら成功
NextRunTime      : 次に実行される予定時刻
```

### 8. 自動チェックインを止める

一時停止する場合：

```powershell
Disable-ScheduledTask -TaskName "KyushuDevCheckin"
```

再開する場合：

```powershell
Enable-ScheduledTask -TaskName "KyushuDevCheckin"
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

チェックイン先URLは以下です。

```text
https://kyushu-dev.kyudai.workers.dev/api/checkins
```

### 3. `LaunchAgents` に保存する

```bash
cp dev.kyudai.plist ~/Library/LaunchAgents/dev.kyudai.plist
```

### 4. 読み込む

```bash
launchctl load ~/Library/LaunchAgents/dev.kyudai.plist
```

これで定期的にチェックインされます。

停止する場合：

```bash
launchctl unload ~/Library/LaunchAgents/dev.kyudai.plist
```

## よくあるトラブル

### サイトで「現在：不明」になる

最後のチェックインから時間が経っている可能性があります。

自動チェックインが動いているか確認してください。

Windowsの場合：

```powershell
Get-ScheduledTaskInfo -TaskName "KyushuDevCheckin"
```

`LastTaskResult` が `0` なら、直近の実行は成功しています。

### PowerShellのウィンドウが毎回出る

`run-hidden.vbs` 経由で実行する設定にしてください。

タスクスケジューラの実行対象が `powershell.exe` ではなく、`wscript.exe` になっていれば、基本的にウィンドウは出ません。

### `curl` がうまく動かない

Windows PowerShellでは `curl` が別コマンドとして解釈されることがあります。

以下のように `curl.exe` を使ってください。

```powershell
curl.exe -X POST "https://kyushu-dev.kyudai.workers.dev/api/checkins" -H "Authorization: <YOUR_TOKEN>"
```

### サブドメイン変更後に更新されなくなった

`kyushu-checkin.ps1` の中のURLが古い可能性があります。

以下になっているか確認してください。

```powershell
$url = "https://kyushu-dev.kyudai.workers.dev/api/checkins"
```

### トークンを再発行したら更新されなくなった

`kyushu-checkin.ps1` の中のトークンも新しいものに変更してください。

```powershell
$token = "<YOUR_TOKEN>"
```

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
git add ../frontend/src/components/TopPage.tsx
```

## ライセンス

Copyright (c) 2025 いなにわうどん.

This project is released under the MIT License. See [LICENSE](./LICENSE).

MIT ライセンスに従って、自由に使用・再配布等を行うことができます。
