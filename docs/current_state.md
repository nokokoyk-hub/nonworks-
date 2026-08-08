# Current State

最終更新: 2026-08-08 20:14 JST

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
- LUMEN公開URL: `https://nonworks.online/lumen/`
- LUMEN PR: `https://github.com/nokokoyk-hub/nonworks-/pull/3`（2026-08-08にSquash merge済み）
- LUMEN本番コミット: `a73993b feat: LUMEN没入型サンプルサイトを公開 (#3)`

## LUMEN 公開実装

- 作業ブランチ: `codex/lumen-preview`
- PR: `https://github.com/nokokoyk-hub/nonworks-/pull/3`（Squash merge済み）
- Preview URL: `https://nonworks-git-codex-lumen-preview-kannari-norikos-projects.vercel.app/lumen/`
- Production URL: `https://nonworks.online/lumen/`
- 公開物コミット: `996e5c9 feat: LUMENサンプルサイトをプレビュー用ブランチへ追加`
- 最新コミット: `36020d3 feat: 公式トップへLUMEN紹介導線と音響改善を追加`
- 追加: `lumen/` の静的サイト一式（33ファイル）
- 除外: LUMENから参照されない旧NORDLYS画像13点
- 変更: 公式トップのWORKSへLUMEN紹介カードと `/lumen/` 導線を追加
- 音響: 55Hzの芯、110Hz・220Hzの可聴倍音、短い起動音、`AudioContext` running確認、コンプレッサー、停止フェード
- 変更なし: `nordlys/`、法務ページ、問い合わせフォーム
- 安全表示: 架空のデジタルアートミュージアムを題材にしたサンプルサイトであることを明記

## LUMEN Preview検証済み

- Vercel Previewデプロイ: `READY`
- デスクトップ: 1265 × 720
- モバイル: 375 × 812
- INDEXの開閉と `03 ENTER THE WORD` への章移動
- INFOの架空サイト注記
- SOUND OFF / ON切替
- SOUND ONはAudioContextのrunning確認後のみ表示
- のんが最新Previewを実スピーカーで試聴し、起動音とアンビエントが聞こえることを受け入れ確認
- 公式トップのLUMENカードから `/lumen/` への遷移
- WebGL canvas 1点の生成
- モバイルの横方向のはみ出しなし
- ブラウザログ: エラー・警告なし
- PreviewとProductionのGit tree SHA一致: `a565e5a1fe8982f3b3eac28612a5f2dba45a1132`

## 本番検証済み

- Next.js型チェック、Lint、静的ビルド
- Vercel Productionデプロイ成功
- `https://nonworks.online/nordlys/` のタイトル、H1、主要セクション表示
- モバイルメニューと横方向のはみ出しなし
- 予約モーダルの入力から `REQUEST RECEIVED` まで
- 本番予約モーダルに `Demo form — no information will be sent.` を表示
- 公式トップから `/nordlys/` への遷移
- Vercel Production `dpl_ZZq6jvRDP7xPJJS9GDDm9dJbCEp4`: READY、`nonworks.online` alias反映
- 本番公式トップのLUMENカードと `/lumen/` への遷移
- 本番LUMENのタイトル、H1、WebGL canvas 1点、SOUND OFF → ON
- 本番1280×720で横方向のはみ出しなし
- 本番LUMENのブラウザエラー・警告なし
- 本番画像13点がHTTP 200
- ブラウザのエラー・警告なし

## 次に行うこと

- iPhone Safari / Android Chrome / reduced-motion / 低GPU端末で追加確認する
- Lighthouse、OGP、404、Sitemapの公開後監査を行う
- LUMENとNORDLYSからNON WORKS公式トップへ戻る明示導線を追加するか判断する
- Next.jsソースと `nordlys/`・`lumen/` の静的出力を同じ更新単位で管理する
