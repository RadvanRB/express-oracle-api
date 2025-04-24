import * as express from "express";

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === "jwt") {
    // Pro začátek vrátíme mock uživatele - později implementujeme JWT ověření
    return Promise.resolve({
      id: 1,
      name: "Test User",
      roles: ["user"]
    });
  }

  return Promise.reject(new Error("Unknown security name"));
}
