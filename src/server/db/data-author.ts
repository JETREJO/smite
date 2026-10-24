/** Who writes the data: the user from the app, or Claude while testing ("npm run dev:claude"). */
export type DataAuthor = "user" | "claude";

export function getDataAuthor(): DataAuthor {
  return process.env.DATA_AUTHOR === "claude" ? "claude" : "user";
}
