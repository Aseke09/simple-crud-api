import type { CreateUserDto, UpdateUserDto, User } from "./types.js";

export function isUuidV4Like(id: string): boolean {
  // Общая проверка UUID v4 (без строгой криптографической валидации)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function validateCreate(dto: CreateUserDto): { ok: true; value: Omit<User, "id"> } | { ok: false; message: string } {
  const { username, age, hobbies } = dto;

  if (typeof username !== "string" || username.trim() === "") {
    return { ok: false, message: "username is required and must be a non-empty string" };
  }

  if (typeof age !== "number" || !Number.isFinite(age)) {
    return { ok: false, message: "age is required and must be a number" };
  }

  if (!Array.isArray(hobbies) || !hobbies.every((h) => typeof h === "string")) {
    return { ok: false, message: "hobbies is required and must be an array of strings (can be empty)" };
  }

  return { ok: true, value: { username: username.trim(), age, hobbies } };
}

export function validateUpdate(dto: UpdateUserDto): { ok: true; value: Omit<User, "id"> } | { ok: false; message: string } {
  return validateCreate(dto as CreateUserDto);
}
