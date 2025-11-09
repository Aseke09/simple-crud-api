export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export interface CreateUserDto {
  username: unknown;
  age: unknown;
  hobbies: unknown;
}

export interface UpdateUserDto {
  username: unknown;
  age: unknown;
  hobbies: unknown;
}
