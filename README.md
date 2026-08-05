# NON WORKS 屋号サイト

個人開発の工房「NON WORKS」の公式サイト。

- 本番URL: https://nonworks.online
- 構成: `index.html` 単体（ビルド無し・依存無し）
- ホスティング: Vercel（`main` への push で自動デプロイ）
- お問い合わせフォーム: Formspree

## 掲載アプリ

| アプリ | URL |
|---|---|
| お受験マネージャー | https://ojuken-manager.com/ |
| まなびの木 | https://manabinoki.net/ |
| soul-backup | https://soul-backup.vercel.app |
| NORDLYS（架空のポートフォリオ作品） | https://nonworks.online/nordlys/ |

## NORDLYS

- 配信物: `nordlys/`
- ソース: Next.js 16 / React 19 / GSAP
- ビルド: ソース側で `npm run build` を実行し、生成された `out/` の中身を `nordlys/` へ配置
- 公開注記: 架空施設のデモであり、予約フォームは情報を送信しない

## 編集メモ

- デザイン: ダーク基調のスチール（無機質）×ロゴの赤ドット（コーラル）が差し色
- ロゴ "nw." はインラインSVGで再現（ファビコンも同じSVG）
- 各アプリの説明文・営業時間・住所などは `index.html` を直接編集
