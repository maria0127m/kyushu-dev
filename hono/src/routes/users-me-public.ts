import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { v4 as uuidv4 } from "uuid";
import { deleteCookie } from "hono/cookie";

import { fetchUser, insertUser } from "../libs/db/user";
import {
  authMiddleware,
  getIdToken,
  hashToken,
  setCookieToken,
} from "../libs/token";
import { Bindings, getIP, isInternalIP, screenNameRegexStr } from "../libs/utils";

// 認証が不要なエンドポイント
export const usersMePublic = new Hono<{ Bindings: Bindings }>();

// ユーザを作成
const postParamSchema = z.object({
  screenName: z.string().regex(new RegExp(`^${screenNameRegexStr}$`)),
  name: z.string(),
  message: z.string(),
  visibility: z.enum(["public", "private", "internal"]),
  listed: z.boolean(),
  displaysPast: z.boolean(),
});

usersMePublic.post("/", zValidator("json", postParamSchema), async (c) => {
  const { screenName, name, message, visibility, listed, displaysPast } =
    c.req.valid("json");

  const ip = getIP(c);

  if (!isInternalIP(ip)) {
    return c.json(
      {
        error: "Registration is allowed only from Kyushu University network",
        type: "INTERNAL_ONLY",
      },
      403
    );
  }

  // ID の重複をチェック
  const user = await fetchUser(
    { type: "screen_name", value: screenName },
    c.env.DB
  );
  if (user) {
    return c.json(
      { error: "The specified ID already used", type: "ID_ALREADY_USED" },
      400
    );
  }

  const id = uuidv4();
  const token = uuidv4();
  const hashedToken = hashToken(token);
  await insertUser(
    id,
    screenName,
    name,
    message,
    visibility,
    listed,
    displaysPast,
    hashedToken,
    c.env.DB
  );

  const idToken = getIdToken(id, token);
  setCookieToken(c, idToken);
  return c.json(
    {
      id,
      screenName,
      name,
      message,
      visibility,
      listed,
      displaysPast,
      hashedToken,
      idToken,
    },
    201
  );
});

// サインイン
usersMePublic.post(
  "/signin",
  authMiddleware(true, "authorization"),
  async (c) => {
    const userId = c.get("userId")!;
    const user = await fetchUser({ type: "id", value: userId }, c.env.DB);
    if (!user) {
      return c.json({ error: "User not found", type: "USER_NOT_FOUND" }, 404);
    }
    const idToken = c.req.header("authorization");
    setCookieToken(c, idToken!);
    return c.json(user);
  }
);

// サインアウト
usersMePublic.post("/signout", async (c) => {
  deleteCookie(c, "token", {
    secure: true,
    path: "/",
  });
  return c.body(null, 204);
});
