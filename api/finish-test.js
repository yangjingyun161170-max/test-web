import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "缺少提取码"
      });
    }

    // 查找提取码
    const result = await sql`
      SELECT *
      FROM test_codes
      WHERE code = ${code}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "提取码不存在"
      });
    }

    const testCode = result.rows[0];

    // 如果已经使用过，则不能再次使用
    if (testCode.used === true) {
      return res.status(403).json({
        success: false,
        message: "这个提取码已经失效"
      });
    }

    // 标记为已使用
    await sql`
      UPDATE test_codes
      SET used = true,
          used_at = NOW()
      WHERE code = ${code}
    `;

    return res.status(200).json({
      success: true,
      message: "测试已完成，提取码已失效"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "服务器错误"
    });
  }
}
