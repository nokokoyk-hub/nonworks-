# Current State

最終更新: 2026-08-05 21:35 JST

## 正本

- GitHub: `nokokoyk-hub/nonworks-`
- 本番ブランチ: `main`
- ホスティング: Vercel（`main` pushで自動デプロイ）
- 本番URL: `https://nonworks.online/`

## 公開状態

- 本番ブランチ: `main`
- 公開URL: `https://nonworks.online/nordlys/`
- PR: `https://github.com/nokokoyk-hub/nonworks-/pull/1`（2026-08-05にSquash merge済み）
- 本番コミット: `3db5129 feat: NORDLYSサンプルサイトをnonworks.online配下へ公開`
- 追加: `nordlys/` の静的サイト一式
- 変更: 公式トップのWORKSを2列化し、NORDLYSカードと `/nordlys/` 導線を追加
- 安全表示: 架空施設・ポートフォリオ作品・予約情報を送信しないデモであることを明記

## 本番検証済み

- Next.js型チェック、Lint、静的ビルド
- Vercel Productionデプロイ成功
- `https://nonworks.online/nordlys/` のタイトル、H1、主要セクション表示
- モバイルメニューと横方向のはみ出しなし
- 予約モーダルの入力から `REQUEST RECEIVED` まで
- 本番予約モーダルに `Demo form — no information will be sent.` を表示
- 公式トップから `/nordlys/` への遷移
- 本番画像13点がHTTP 200
- ブラウザのエラー・警告なし

## 次に行うこと

- Next.jsソースと `nordlys/` の静的出力を同じ更新単位で管理する
- 現在ローカル管理のNext.jsソースを、GitHub上の永続的な正本へ移す方針を決める
- 公開後の文言、画像、法務導線を変更した際は本番URLで再検証する
