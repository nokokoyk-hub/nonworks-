# 2026-08-08 LUMEN Preview作業ダイジェスト

- 公式リポジトリ `nokokoyk-hub/nonworks-` の `main` から `codex/lumen-preview` を作成
- LUMENのNext.js静的出力を `lumen/` 配下へ配置
- 未使用の旧NORDLYS画像13点をLUMEN公開物から除外
- GitHub Draft PR #3を作成
- VercelのブランチPreviewをデスクトップ・モバイルで確認
- 小型スピーカーで聞こえにくい48Hz中心の音響を、可聴倍音・起動音・running確認付きへ改善
- 公式トップのWORKSへLUMEN紹介カードと `/lumen/` 導線を追加

## 検証結果

- ソース側 `npm run typecheck`: 成功
- ソース側 `npm run lint`: 成功
- ソース側 `npm run build`: 成功
- Vercel Previewデプロイ: `READY`
- Preview URL: `https://nonworks-git-codex-lumen-preview-kannari-norikos-projects.vercel.app/lumen/`
- デスクトップ 1265 × 720: 成功
- モバイル 375 × 812: 成功
- INDEX開閉と章移動: 成功
- INFO表示: 成功
- SOUND OFF / ON切替: 成功
- WebGL canvas: 1点生成
- モバイル横方向のはみ出し: なし
- ブラウザエラー・警告: なし
- 公式トップ → `/lumen/` → SOUND ON: 成功
- 公式トップ375×812横方向のはみ出し: なし
- 実スピーカーの音量・聞こえ方: のんの確認待ち
- 本番 `main`: 変更なし
