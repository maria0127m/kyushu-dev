# kyushu-dev

九州大学の学内ネットワークにいるかどうかを記録・公開する Web サイトです。

このリポジトリは [`inaniwaudon/tsukuba-yokohama-dev`](https://github.com/inaniwaudon/tsukuba-yokohama-dev) をもとに、九州大学向けに設定を変更したものです。

## 仕様・使い方

### 判定

* `133.5.0.0/16` からの接続を九州大学内と判定します
* それ以外の IP アドレスからの接続は学外と判定します
* VPN 経由の場合、出口 IP が `133.5.0.0/16` でない場合は学内判定されません
* 判定にはアクセス元 IP を利用しますが、IP アドレス自体は記録しません

### 初回登録

* ユーザー登録時にトークンが発行されます
* 次回以降のチェックインにはトークンが必要です
* トークンは Cookie に保存されます
* 学内限定で初回登録を許可する運用にする場合は、初回登録 API 側でも学内 IP 制限を有効にしてください

### 設定

ページを上にスクロールすると、以下の設定を編集できます。

* スクリーンネーム
* 名前
* ひとこと
* 公開状態

  * 公開
  * 非公開
  * 学内限定
  * 一覧への表示
  * 過去の記録の表示
* トークン再発行

  * 現在のトークンを失効させ、新しいトークンを発行します

### 記録

以下の POST リクエストを送信すると、その時点で九州大学内にいるかどうかが記録されます。

```bash
curl -X POST https://<YOUR_DOMAIN>/api/checkins \
  -H "Authorization: <YOUR_TOKEN>"
```

* レートリミットは 100 回/時間です
* IP アドレスは保存されず、学内・学外の判定結果のみが記録されます

### macOS を使用している場合

`launchd` を用いることで、上記のチェックインコマンドを定期実行できます。

1. `dev.yokohama.tsukuba.plist` をダウンロードします
2. `$YOUR_TOKEN` を自分のトークンに書き換えます
3. チェックイン先 URL を `https://<YOUR_DOMAIN>/api/checkins` に書き換えます
4. `~/Library/LaunchAgents` に保存します
5. 以下を実行します

```bash
launchctl load ~/Library/LaunchAgents/dev.yokohama.tsukuba.plist
```

ファイル名を変更する場合は、`launchctl load` で指定するファイル名もあわせて変更してください。

### 記録の確認

各ユーザーの記録は、以下の形式の URL から確認できます。

```text
https://<YOUR_DOMAIN>/@screenname
```

## 開発

### フロントエンド

* Vite
* React
* React Router

### バックエンド

* Hono
* Cloudflare Workers
* Cloudflare D1

`/api` 以下に API を、それ以外のパスにフロントエンドをルーティングします。

### ローカル開発

```bash
cd frontend
yarn
yarn run watch  # hono/dist に自動ビルド

cd ../hono
cp wrangler.jsonc.sample wrangler.jsonc
yarn
yarn run dev
```

### デプロイ

```bash
cd frontend
yarn run build

cd ../hono
yarn run deploy
```

## ライセンス

Copyright (c) 2025 いなにわうどん.

This project is released under the MIT License. See [LICENSE](./LICENSE).

MIT ライセンスに従って、自由に使用・再配布等を行うことができます。
