/** Who created and who last changed a row: the user, Claude's tests or db/seed.sql. */
export type RecordAuthor = "user" | "claude" | "seed";

export interface Authorship {
  createdBy: RecordAuthor;
  updatedBy: RecordAuthor;
}
