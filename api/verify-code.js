import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED);

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
        message: "请输入提取码"
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const result = await sql`
      SELECT id, code, used
      FROM access_codes
      WHERE code = ${cleanCode}
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "提取码不存在"
      });
    }

    const accessCode = result[0];

    if (accessCode.used) {
      return res.status(403).json({
        success: false,
        message: "这个提取码已经失效"
      });
    }

    return res.status(200).json({
      success: true,
      message: "验证成功"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "服务器错误，请稍后再试"
    });
  }
}
