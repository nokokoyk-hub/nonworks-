# NON WORKS 屋号サイト

個人開発の工房「NON WORKS」の公式サイト。

- 本番URL: https://nonworks.online
- 構成: 公式トップと法務ページは静的HTML、作品ページはNext.jsの静的出力
- ホスティング: Vercel（`main` への push で自動デプロイ）
- お問い合わせフォーム: Formspree

## 掲載アプリ

| アプリ | URL |
|---|---|
| お受験マネージャー | https://ojuken-manager.com/ |
| まなびの木 | https://manabinoki.net/ |
| soul-backup | https://soul-backup.vercel.app |
| NORDLYS（架空のポートフォリオ作品） | https://nonworks.online/nordlys/ |
| LUMEN（架空のデジタルアートミュージアム） | https://nonworks.online/lumen/ |

## NORDLYS

- 配信物: `nordlys/`
- ソース: Next.js 16 / React 19 / GSAP
- ビルド: ソース側で `npm run build` を実行し、生成された `out/` の中身を `nordlys/` へ配置
- 公開注記: 架空施設のデモであり、予約フォームは情報を送信しない

## LUMEN

- 配信物: `lumen/`
- ソース: Next.js 16 / React 19 / Three.js / GSAP
- ビルド: ソース側で `npm run build` を実行し、生成された `out/` のうちLUMENに必要なファイルを `lumen/` へ配置
- 公開注記: 架空のデジタルアートミュージアムを題材にしたサンプルサイト

## 編集メモ

- デザイン: ダーク基調のスチール（無機質）×ロゴの赤ドット（コーラル）が差し色
- ロゴ "nw." はインラインSVGで再現（ファビコンも同じSVG）
- 各アプリの説明文・営業時間・住所などは `index.html` を直接編集
