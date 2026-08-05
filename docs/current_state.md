# Current State

最終更新: 2026-08-05 21:06 JST

## 正本

- GitHub: `nokokoyk-hub/nonworks-`
- 本番ブランチ: `main`
- ホスティング: Vercel（`main` pushで自動デプロイ）
- 本番URL: `https://nonworks.online/`

## このブランチ

- ブランチ: `codex/nordlys-sample-site`
- 追加: `nordlys/` の静的サイト一式
- 変更: 公式トップのWORKSを2列化し、NORDLYSカードと `/nordlys/` 導線を追加
- 安全表示: 架空施設・ポートフォリオ作品・予約情報を送信しないデモであることを明記
- コミット: `2e54864 feat: NORDLYSサンプルサイトを追加`
- ドラフトPR: `https://github.com/nokokoyk-hub/nonworks-/pull/1`

## 検証済み

- Next.js型チェック、Lint、静的ビルド
- `/nordlys/` のPC・スマホ表示
- モバイルメニューと横方向のはみ出しなし
- 予約モーダルの入力から `REQUEST RECEIVED` まで
- 公式トップから `/nordlys/` への遷移
- ブラウザのエラー・警告・画像切れなし
- Vercel Previewビルドチェック成功

## 未完了

- Vercel Previewの実画面確認（Preview Protectionによりログインが必要）
- `main` への統合
- 本番URLの公開後確認
