export class SignedUserDto {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly nickname: string | null,
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
