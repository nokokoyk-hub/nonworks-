# NON WORKS 屋号サイト

個人開発の工房「NON WORKS」の公式サイト。

- 本番URL: https://nonworks.online
- 構成: 公式トップ・法務ページ・LUMENは手書きの静的HTML（ビルド無し）、NORDLYSはNext.jsの静的出力
- ホスティング: Vercel（`main` への push で自動デプロイ）
- お問い合わせフォーム: Formspree

## 掲載アプリ

| アプリ | URL |
|---|---|
| お受験マネージャー | https://ojuken-manager.com/ |
| まなびの木 | https://manabinoki.net/ |
| soul-backup | https://soul-backup.vercel.app |
| NORDLYS（架空のポートフォリオ作品） | https://nonworks.online/nordlys/ |
| LUMEN（架空の「さわれる光のミュージアム」） | https://nonworks.online/lumen/ |

## NORDLYS

- 配信物: `nordlys/`
- ソース: Next.js 16 / React 19 / GSAP
- ビルド: ソース側で `npm run build` を実行し、生成された `out/` の中身を `nordlys/` へ配置
- 公開注記: 架空施設のデモであり、予約フォームは情報を送信しない

## LUMEN

- 配信物であり正本: `lumen/`（手書きのHTML / CSS / Canvas 2D / Web Audio、ライブラリなし、ビルド無し）
- 直し方: `lumen/` のファイルを直接編集する。手触りの数値は `lumen/js/playground.js` 先頭の `TUNE`
- 確認: リポのルートで `python3 -m http.server 8765` → `http://localhost:8765/lumen/`
- 公開注記: 架空のミュージアムを題材にしたサンプルサイト
- 旧版（Next.js / Three.js）のビルド手順は廃止。詳しくは `docs/ai_handoff.md`

## 編集メモ

- デザイン: ダーク基調のスチール（無機質）×ロゴの赤ドット（コーラル）が差し色
- ロゴ "nw." はインラインSVGで再現（ファビコンも同じSVG）
- 各アプリの説明文・営業時間・住所などは `index.html` を直接編集
