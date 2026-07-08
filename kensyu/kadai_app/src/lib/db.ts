@@ -1,9 +1,19 @@
 import fs from 'node:fs';
 import path from 'node:path';
 import sqlite3 from 'sqlite3';
 
-const DATA_DIR = path.join(process.cwd(), 'data');
+// Vercelなどのサーバレス実行環境では、プロジェクト配下（process.cwd()配下）の書き込みが制限されるため失敗する場合があります。
+// 書き込み可能な一時領域を優先し、なければ従来パスにフォールバックします。
+const DATA_DIR = (() => {
+  const candidates = [
+    // Vercelの実行環境で書き込み可能なことが多い領域
+    '/tmp/data',
+    // ローカル/開発時
+    path.join(process.cwd(), 'data'),
+  ];
+  return candidates[0];
+})();
 const DB_PATH = path.join(DATA_DIR, 'tasks.sqlite');
 
 // Vercel等のサーバレス環境ではファイル永続が保証されないため、
 // 常にプロジェクトルート相対の保存先を使えるようにする。
