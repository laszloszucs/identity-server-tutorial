export class User {
  // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
  constructor(
    id?: string,
    userName?: string,
    fullName?: string,
    email?: string,
    phoneNumber?: string,
    isEnabled?: boolean,
    isLockedOut?: boolean,
    roles?: string[],
    isAdmin?: boolean
  ) {
    this.id = id;
    this.userName = userName;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.isEnabled = isEnabled;
    this.isLockedOut = isLockedOut;
    this.roles = roles;
    this.isAdmin = isAdmin;
  }

  get friendlyName(): string {
    return this.fullName || this.userName;
  }

  public id: string;
  public userName: string;
  public fullName: string;
  public email: string;
  public phoneNumber: string;
  public isEnabled: boolean;
  public isLockedOut: boolean; // TODO Kizárva
  public roles: string[];
  public isAdmin: boolean;
}

export class InsertUser {
  constructor(
    userName?: string,
    fullName?: string,
    email?: string,
    phoneNumber?: string,
    isEnabled?: boolean,
    isLockedOut?: boolean,
    roles?: string[],
    isAdmin?: boolean
  ) {
    this.userName = userName;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.isEnabled = isEnabled;
    this.isLockedOut = isLockedOut;
    this.roles = roles;
    this.isAdmin = isAdmin;
  }

  public userName: string;
  public fullName: string;
  public email: string;
  public phoneNumber: string;
  public isEnabled: boolean;
  public isLockedOut: boolean; // TODO Kizárva
  public roles: string[];
  public isAdmin: boolean;
}
