# Current State

最終更新: 2026-11-11 15:40 JST

## 正本

- GitHub: `nokokoyk-hub/nonworks-`
- 本番ブランチ: `main`
- ホスティング: Vercel（`main` pushで本番デプロイ、それ以外のブランチpushでPreview）
- 本番URL: `https://nonworks.online/`

## いま進行中：LUMEN の作り直し（Preview段階・本番は未反映）

- 作業ブランチ: `codex/lumen-pop-preview`（`origin/main` の `0777e12` から作成）
- 状態: 実装・テスト・レビュー済み。**のんのPreview受け入れ待ち**。`main` と本番 `https://nonworks.online/lumen/` は旧LUMENのまま
- PR: `https://github.com/nokokoyk-hub/nonworks-/pull/7`（Draft）
- Preview URL: `https://nonworks-git-codex-lumen-pop-preview-kannari-norikos-projects.vercel.app/lumen/`（Vercelのログインが必要。ログイン無しで見るには共有リンクを発行する。発行した共有リンクは約23時間で切れる）
- 初回Previewデプロイ: `dpl_2FfXCRuUPY5k3w8AP8bJvtJSxRXd`（コミット `7d215c4`、READY）
- きっかけ: のんの判断「今のLUMENは見る人を選ぶ。躍動感があって誰が見ても楽しいものにしたい」。さわれる試作3案（花火／はねる／ながれる）から **B案「はねる」** を承認（2026-11-11）

### 新LUMENの中身

- コンセプト: さわれる光のミュージアム「光で、あそぼう。」。目のついたカラフルな図形がはねまわり、つかんで投げる・タップで増やすことができる
- 構成: オープニング → あそびかた → 6つの へや → チケット → アクセス → この作品について
- **ビルド無しの手書き**（HTML / CSS / Canvas 2D / Web Audio、ライブラリなし）。外部読み込みは Google Fonts（Dela Gothic One、Zen Maru Gothic）だけ
- **このリポの `lumen/` がそのまま正本**。直すときは `lumen/` のファイルを直接編集する（更新手順は `docs/ai_handoff.md`）
- 容量: 旧版 約2.6MB・33ファイル → 新版 約150KB・11ファイル（うち共有用画像が63KB）

| ファイル | 役割 |
|---|---|
| `lumen/index.html` | ページ本体。SVGキャラの部品、ヘッダー、全画面メニュー、6セクション、フッター |
| `lumen/css/lumen.css` | 色・書体の変数（先頭の `:root`）、色面、アニメ、レスポンシブ、reduced-motion、JS無効時の表示 |
| `lumen/js/playground.js` | オープニングの物理あそび場。手触りの数値は先頭の `TUNE` に日本語コメント付きで集約 |
| `lumen/js/sound.js` | Web Audio。`window.LumenSound`（`supported` `enabled` `toggle()` `bounce(size01, strength)` `pop()` `note(i)` `arpeggio()` `stretch()` `slide()`） |
| `lumen/js/site.js` | スクロール表示、メニュー、音ボタン、うごきボタン、へやタイル、チケットの紙ふぶき |
| `lumen/404.html` | 「まいごです」ページ（下の「効いていないファイル」を参照） |
| `lumen/og.png` | SNS共有用の画像（1200×630） |
| `lumen/icon.svg` `manifest.webmanifest` `robots.txt` `sitemap.xml` | アイコンと付帯ファイル |

### 仕様の要点

- マウス: 押した場所に図形があればつかんで投げる、無ければ5こ増える
- タッチ: 指の下に図形がある時だけつかむ（ページはスクロールしない）。図形の無い所の縦スワイプはページがスクロールする。動かさず短く離したタップ（10px未満・400ms未満）だけ増える
- 図形は、上はヘッダーの下端、下は `.hero-foot`（ボタン・ヒント・マーキー）の上端の間で動く
- 図形の量は画面の面積で決める（はじめ約15%、増やしても約28%まで。超えると古い図形から消える）
- 音は最初OFF。ボタンを押し、AudioContext が `running` になったのを確認できた時だけ「おと ON」。音は300Hz以上（小さいスピーカーでも聞こえる高さ）。ONにした直後に「音が出ないときは、マナーモードと音量をたしかめてね」を5秒表示
- 「うごき ON / OFF」でページ全体の動きを止められる（PCはヘッダー、スマホは全画面メニューの中）。OFFの間は図形をつかめず（スマホでは必ずページがスクロールする）、増やす操作だけが効く。紙ふぶきも出ない
- キーボードでは、カウンター横の「＋5こ ふやす」ボタンで遊べる（キャンバス自体は飾り扱い）
- `prefers-reduced-motion` ではCSSアニメ・マーキー・紙ふぶきを止め、図形はゆっくり動く
- JSが無効でも本文とナビは読める
- JSの失敗への備えは3段: ①`site.js` が読み込めない・途中で止まった時は、3秒後に本文が見える（`<head>` 内のインライン1行と `window.LumenSiteReady`）。②`site.js` の中は機能ごとに区切ってあり、1つが失敗しても他は動く。③スクロール表示の準備が失敗したら本文を全部表示し、メニューの準備が失敗したらナビのリンクをそのまま見せる（`html.no-menu`）
- 架空の施設である注記、NON WORKSトップへ戻る導線、サイト制作相談（`/#contact`）への導線を維持

### 検証済み（ローカル、Chromiumのエミュレーション）

- 1280×760 と 390×780 でコンソールの警告・エラー0件、320〜1440pxで横はみ出し0
- つかむ・投げる・増やす・縦スワイプのスクロール・二重発火なし・上限、メニューの開閉とフォーカス、音ボタン、タイル6枚、紙ふぶき、アンカーが固定ヘッダーに隠れないこと
- reduced-motion、JS無効、`site.js` の読み込み失敗・途中エラー
- 色のコントラストはすべてWCAG AA以上
- 広い画面から狭い画面へのリサイズで、図形が壁の外に出ないこと
- 公式トップと `/nordlys/` に影響がないこと（差分は `lumen/`、公式トップのLUMENカード、docs、READMEだけ）

### Vercel Previewで確認済み（2026-11-11、1280×760 と 390×780）

- タイトル、H1、図形の数の表示、クリックで15→20に増えること、Google Fonts 2書体の読み込み、横はみ出し0
- `/lumen`（末尾スラッシュ無し）もリダイレクト無しの200で正しく表示される（CSS・JSを絶対パスにしているため）
- `/lumen/og.png` が200、公式トップと `/nordlys/` が200、公式トップのLUMENカードから `/lumen/` へ遷移
- ページ自体のコンソール警告・エラーは0件
- `/lumen/存在しないURL` はVercel標準の404になる（`lumen/404.html` は使われない。下の「効いていないファイル」のとおり）

### まだ確かめられていないこと

- **iPhone Safari / Android Chrome の実機**での「つかむ」と「スクロール」の仕分け、慣性スクロール中のタッチ
- **実際の音の聞こえ方**（機械で確認できたのは、鳴る経路と周波数まで）。iPhoneのマナーモード時の挙動
- 120Hzの画面での速さ（計算上は60Hzと同じになるようにしてある）
- 指2本を同時に使った操作

### 効いていないファイル（旧LUMEN・NORDLYSも同じ構造）

- `lumen/robots.txt`: クローラーが読むのはサイト直下の `/robots.txt` だけなので、ここに置いても効かない
- `lumen/404.html`: 存在しないURLで自動的に表示されるのはサイト直下の `/404.html` だけ（Previewで確認済み）。直接開いた時にしか見えない
- 直すならサイト直下に置く必要があり、公式トップ全体に関わる。別の作業として、のんに確認してから行う

## 公開中（本番）

- 公式トップ `index.html`、`tokushoho.html`、`privacy.html`: 手書きの静的HTML。お問い合わせはFormspree
- NORDLYS: `https://nonworks.online/nordlys/`。Next.jsの静的出力。PR #1、本番コミット `3db5129`。架空施設・予約情報を送信しないデモであることを明記
- LUMEN（旧版）: `https://nonworks.online/lumen/`。Next.js / Three.js の静的出力。PR #3・#5、本番コミット `13ff9ea`。**今回のPRをマージすると新版に置き換わる**

## 旧LUMENについて

- 黒地・英語の詩・WebGL（Three.js）・55Hzを芯にした音、という作風だった
- 新版のマージで退役する。配信物は Git の履歴（`13ff9ea` 時点の `lumen/`）から取り出せる
- 旧版のNext.jsソースはこのリポに無い（ローカル側の `43ead82`）。**新版には使わない**。旧版の経緯は `docs/digests/2026-08-08-lumen-preview.md` と `2026-08-09-lumen-site-links.md`

## 次に行うこと

1. のんがPreviewを確認する（特にiPhone実機の触り心地と、音の聞こえ方）
2. 受け入れ後、PRをReady化して `main` へ統合し、本番 `/lumen/` と公式トップのカードを確認する
3. マージ後、この文書・`ai_handoff.md`・`north_star.md` の「Preview段階」の記述を「本番公開済み」に直す
4. NORDLYSから公式トップへ戻る導線、NORDLYSのソースを正本へ移す件は未着手のまま
