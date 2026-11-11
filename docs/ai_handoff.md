# AI Handoff

最終更新: 2026-11-11 15:19 JST

## 次回の開始地点

1. `git status -sb` と現在ブランチを確認する
2. `docs/current_state.md` と `docs/north_star.md` を読む
3. 新LUMENは2026-11-11にPR #7で本番公開済み（本番コミット `f5fe872`）。のんの実機での感想（iPhoneの触り心地、音、図形の量）をまだ聞けていなければ、まず聞く
4. 直す時は `main` から新しい `codex/` ブランチを切り、Vercel Previewでのんが受け入れてから統合する

## LUMENの更新方法（2026-11-11 から）

**LUMENはこのリポの `lumen/` がそのまま正本。ビルドは無い。ファイルを直接編集する。**

- `docs/digests/2026-08-*` と `docs/changelog-entry-2026-08-*` に出てくるLUMENの手順は、旧版（廃止）のもの。記録として残してあるだけなので、従わない

- 旧手順（別の場所にあるNext.jsソースで `npm run build` → `out/` を `lumen/` へ同期）は**廃止**。やると手書き版が丸ごと上書きされて消える
- 旧版のNext.jsソース（ローカル側の `43ead82`）は新版に使わない

### どこを直すか

| 直したいもの | 場所 |
|---|---|
| 文言、セクションの追加・並び | `lumen/index.html` |
| 色、書体 | `lumen/css/lumen.css` 先頭の `:root` |
| レイアウト、アニメ、スマホ表示 | `lumen/css/lumen.css` |
| 図形の速さ・はね方・数・大きさなどの手触り | `lumen/js/playground.js` 先頭の `TUNE`（1行ずつ日本語コメントあり） |
| 音の高さ・音量・鳴る頻度 | `lumen/js/sound.js` |
| メニュー、音ボタン、うごきボタン、へやタイル、紙ふぶき | `lumen/js/site.js` |

### 確認のしかた

1. リポのルートで `python3 -m http.server 8765` を実行し、`http://localhost:8765/lumen/` を開く（CSS・JSは `/lumen/...` の絶対パスで読むので、必ずリポのルートから配信する）
2. PC幅（1280×760）とスマホ幅（390×780、タッチあり）で、コンソールの警告・エラー0件、横はみ出し0を確認する
3. つかんで投げる／空きをタップして増える／スマホで図形の無い所を縦スワイプするとページがスクロールする、を実際に操作する
4. 公式トップ `http://localhost:8765/` のLUMENカードから `/lumen/` へ行けることを確認する
5. ブランチをpushしてVercel Previewで見る。**実機のiPhoneと、実際のスピーカーでの音は人が確かめる**（機械では分からない）

### 壊しやすい所

- `index.html` の `<head>` にあるインライン1行（`html` に `js` クラスを付け、3秒後に `window.LumenSiteReady` が無ければ外す）と、`site.js` の最後の `window.LumenSiteReady = true`。本文が透明のまま残らないための仕組みなので、片方だけ消さない
- scriptの順番: `sound.js` は `site.js` より前に置く。`site.js` は起動した時に `window.LumenSound` があるかを見て、音ボタンを出すか決めるため（`playground.js` は音を鳴らすたびに探すので、順番には左右されない）
- キャンバスの `touch-action: pan-y` と、`playground.js` の `touchstart`（`passive:false`）の組み合わせ。図形の上だけ `preventDefault` することで、「つかむ」と「ページのスクロール」を両立している
- 音は300Hz以上にしてある。2026-08-08に、旧LUMENの最初の音（48Hz中心）が小さいスピーカーで聞こえなかった失敗があるため（旧版はその後55Hz＋倍音に直して公開した）。「おと ON」の表示は AudioContext が `running` になったのを確認してから
- iPhoneのマナーモードでも鳴るように、音をONにする時に `navigator.audioSession.type = 'playback'` を設定している。副作用として、ほかのアプリで流している音楽が止まったり小さくなったりすることがある
- 音の鳴りすぎ防止は2系統（図形同士がぶつかる音／人が押した時の音）。人が押した時の音は、必ず「押した時の音」側（`sound.js` の `'ui'`）に入れる
- **ファイルをまたぐ約束**。名前を変える時は両側を直す（片側だけ変えるとエラーも出ずに機能だけ止まる）
  - `site.js` が付け外しする `html.is-paused` と `lumenmotion` イベント → `playground.js` が読む（「うごき」ボタン）
  - `sound.js` が出す `lumensound` イベント → `site.js` が受ける（音ボタンの表示）
  - `site.js` が失敗時に付ける `html.no-menu` → `lumen.css` が読む（メニューが作れなかった時に、ナビのリンクをそのまま見せる）
  - `playground.js` が探す要素: `#playground`、`#count`、`#spawn-btn`、`#top` の中の `.hero-foot`、`.site-header`
- 動きを止める対象の一覧は `lumen.css` に2つある（`html.is-paused` 用と `prefers-reduced-motion` 用）。ループするアニメを足したら両方に入れる
- 「うごき OFF」の間は、図形をつかめないようにしてある（つかめるとスマホでページがスクロールできなくなる）。増やす操作だけは効いて、止まった絵を1回描き直す
- `lumen/index.html` と `lumen/404.html` は、SVGキャラの部品（`<symbol>`）を同じ内容で持っている。キャラの形を変える時は両方を直す
- フッターの `Fictional museum / Portfolio demonstration.` と「LUMENは架空の施設です」の注記、チケット欄の「架空のミュージアムです」の注記は消さない
- ヘッダーの `NON WORKS ↗`（`/`）、「この作品について」の `/#works` と `/#contact` への導線は残す

### 補足

- 初回実装では、`index.html` を組み立てるための下書きスクリプトを作業用の一時フォルダで使った。リポには入れていない。**今後は `lumen/index.html` を直接編集する**
- `lumen/robots.txt` と `lumen/404.html` はサブディレクトリにあるため効いていない（詳細は `docs/current_state.md`）
- VercelのPreviewはログインが必要。のんがスマホ実機で見る時は、共有リンク（約23時間有効）を発行して渡す

## NORDLYSの更新方法

NORDLYSはNext.jsの静的出力。ソース側で以下を行う。

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `out/` の中身をこのリポジトリの `nordlys/` へ同期
5. 公式トップからの導線と `/nordlys/` をローカル静的サーバーで確認

`basePath` と `assetPrefix` は `/nordlys`。ここを変えると画像・CSS・JSの配信パスが壊れるため、公開パス変更時以外は触らない。

現時点のNext.jsソースはローカル側のコミット `0ffdf6e` にあり、この公開リポジトリには静的出力だけが入っている。次の機能変更前に、ソースをGitHub上の永続的な正本へ移す方針を決めること。

## 注意

- `main` は本番。変更は `codex/` ブランチで作り、Vercel Previewでのんが受け入れてから統合する
- ブランチ・commit・pushを報告するときは、リポのルート、ブランチ名、remote、GitHub URL、公開 `main` との関係をセットで示す（2026-08-08の取り違えの教訓）
- NORDLYSは架空施設。フッターの `Fictional property — portfolio demonstration only.` を削除しない。予約フォームはデモで、外部送信処理は無い
- 公式トップのFormspreeフォーム、法務ページ、公式トップ本体のデザインは、LUMENの作業では触らない
