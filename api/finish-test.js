```javascript
import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { code, sessionId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "缺少提取码"
      });
    }

    const result = await sql`
      SELECT *
      FROM access_codes
      WHERE code = ${code}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "提取码不存在"
      });
    }

    const accessCode = result.rows[0];

    if (accessCode.used) {
      return res.status(403).json({
        success: false,
        message: "这个提取码已经失效"
      });
    }

    await sql`
      UPDATE access_codes
      SET used = TRUE,
          session_id = ${sessionId || null},
          used_at = NOW()
      WHERE code = ${code}
    `;

    return res.status(200).json({
      success: true,
      message: "测试完成，提取码已失效"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "服务器错误"
    });
  }
}
```
