export class ChangePassword {
  constructor(userId?: any, newPassword?: string, confirmPassword?: string) {
    this.userId = userId;
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }

  public userId: any;
  public newPassword: string;
  public confirmPassword: string;
}
