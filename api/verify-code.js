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
        message: "请输入提取码"
      });
    }

    // 查询提取码
    const result = await sql`
      SELECT *
      FROM access_codes
      WHERE code = ${code}
      LIMIT 1
    `;

    // 提取码不存在
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "提取码不存在"
      });
    }

    const accessCode = result.rows[0];

    // 提取码已经使用
    if (accessCode.used) {
      return res.status(403).json({
        success: false,
        message: "这个提取码已经失效"
      });
    }

    // 记录当前测试 session
    await sql`
      UPDATE access_codes
      SET session_id = ${sessionId || null}
      WHERE code = ${code}
    `;

    // 验证成功
    return res.status(200).json({
      success: true,
      message: "验证成功"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "服务器错误"
    });
  }
}
