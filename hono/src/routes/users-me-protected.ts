import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from "uuid";
import { getCookie } from "hono/cookie";

import { fetchUser, updateUser } from "../libs/db/user";
import {
  authMiddleware,
  getIdToken,
  hashToken,
  setCookieToken,
} from "../libs/token";
import { Bindings, screenNameRegexStr } from "../libs/utils";

// 認証が必要なエンドポイント
export const usersMeProtected = new Hono<{
  Bindings: Bindings;
  Variables: {
    userId: string;
  };
}>();

// ユーザ情報を取得
usersMeProtected.get("/", authMiddleware(true, "cookie"), async (c) => {
  const userId = c.get("userId");
  const user = await fetchUser({ type: "id", value: userId }, c.env.DB);
  if (!user) {
    return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
  }
  return c.json(user);
});

// ユーザ情報を更新
const patchParamSchema = z.object({
  screenName: z
    .string()
    .regex(new RegExp(`^${screenNameRegexStr}$`))
    .optional(),
  name: z.string().optional(),
  message: z.string().optional(),
  visibility: z.enum(["public", "private", "internal"]).optional(),
  listed: z.boolean().optional(),
  displaysPast: z.boolean().optional(),
});

usersMeProtected.patch(
  "/",
  authMiddleware(true, "cookie"),
  zValidator("json", patchParamSchema),
  async (c) => {
    const id = c.get("userId");
    const { screenName, name, message, visibility, listed, displaysPast } =
      c.req.valid("json");

    // ID の重複をチェック
    if (screenName) {
      const user = await fetchUser(
        { type: "screen_name", value: screenName },
        c.env.DB
      );
      if (user && user.id !== id) {
        return c.json(
          { error: "The specified ID already used", type: "ID_ALREADY_USED" },
          400
        );
      }
    }

    await updateUser(
      id,
      { screenName, name, message, visibility, listed, displaysPast },
      c.env.DB
    );
    return c.json({
      id,
      screenName,
      name,
      message,
      visibility,
      listed,
      displaysPast,
    });
  }
);

// 現在のトークンを表示
usersMeProtected.get(
  "/token/current",
  authMiddleware(true, "cookie"),
  async (c) => {
    const idToken = getCookie(c, "token");

    if (!idToken) {
      return c.json({ error: "Token not found", type: "TOKEN_NOT_FOUND" }, 401);
    }

    return c.text(idToken);
  }
);

// トークン再発行
usersMeProtected.get("/token", authMiddleware(true, "cookie"), async (c) => {
  const userId = c.get("userId");
  const token = uuidv4();
  const hashedToken = hashToken(token);
  await updateUser(userId, { hashedToken }, c.env.DB);

  const newIdToken = getIdToken(userId, token);
  setCookieToken(c, newIdToken);
  return c.text(newIdToken);
});
