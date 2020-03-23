import store from "../store";
import { PermissionValues } from "@/models/permission.model";
import { Role } from "@/models/role.model";
import { InsertUser } from "@/models/user.model";
import RequestHandler from "./requestHandler";

export type RolesChangedOperation = "add" | "delete" | "modify";
export interface RolesChangedEventArg {
  roles: Role[] | string[];
  operation: RolesChangedOperation;
}

class AccountService {
  private static instance: AccountService;
  public static readonly roleAddedOperation: RolesChangedOperation = "add";
  public static readonly roleDeletedOperation: RolesChangedOperation = "delete";
  public static readonly roleModifiedOperation: RolesChangedOperation =
    "modify";

  private readonly path = "account/users";

  constructor() {
    if (AccountService.instance) {
      return AccountService.instance;
    }
    AccountService.instance = this;

    return this;
  }

  // getUserAndRoles(userId?: string) {

  //     return forkJoin(
  //         this.accountEndpoint.getUserEndpoint<User>(userId),
  //         this.accountEndpoint.getRolesEndpoint<Role[]>());
  // }

  async getUsers() {
    return await RequestHandler.get(this.path);
  }

  async insertUser(insertUser: InsertUser) {
    debugger;
    return await RequestHandler.post(this.path, insertUser);
  }

  async updateUser(updateUser: any) {
    return await RequestHandler.put(this.path, JSON.stringify(updateUser));
  }

  async removeUser(id: any) {
    return await RequestHandler.delete(this.path, id);
  }

  async getRoles() {
    return await RequestHandler.get("account/roles");
  }

  // getUsersAndRoles(page?: number, pageSize?: number) {

  //     return forkJoin(
  //         this.accountEndpoint.getUsersEndpoint<User[]>(page, pageSize),
  //         this.accountEndpoint.getRolesEndpoint<Role[]>());
  // }

  // updateUser(user: UserEdit) {
  //     if (user.id) {
  //         return this.accountEndpoint.getUpdateUserEndpoint(user, user.id);
  //     } else {
  //         return this.accountEndpoint.getUserByUserNameEndpoint<User>(user.userName).pipe(
  //             mergeMap(foundUser => {
  //                 user.id = foundUser.id;
  //                 return this.accountEndpoint.getUpdateUserEndpoint(user, user.id);
  //             }));
  //     }
  // }

  // newUser(user: UserEdit) {
  //     return this.accountEndpoint.getNewUserEndpoint<User>(user);
  // }

  // getUserPreferences() {
  //     return this.accountEndpoint.getUserPreferencesEndpoint<string>();
  // }

  // updateUserPreferences(configuration: string) {
  //     return this.accountEndpoint.getUpdateUserPreferencesEndpoint(configuration);
  // }

  // deleteUser(userOrUserId: string | User): Observable<User> {

  //     if (typeof userOrUserId === 'string' || userOrUserId instanceof String) {
  //         return this.accountEndpoint.getDeleteUserEndpoint<User>(userOrUserId as string).pipe<User>(
  //             tap(data => this.onRolesUserCountChanged(data.roles)));
  //     } else {

  //         if (userOrUserId.id) {
  //             return this.deleteUser(userOrUserId.id);
  //         } else {
  //             return this.accountEndpoint.getUserByUserNameEndpoint<User>(userOrUserId.userName).pipe<User>(
  //                 mergeMap(user => this.deleteUser(user.id)));
  //         }
  //     }
  // }

  // unblockUser(userId: string) {
  //     return this.accountEndpoint.getUnblockUserEndpoint(userId);
  // }

  userHasPermissions(permissionValues: PermissionValues[]): boolean {
    let hasPermission = true;
    if (this.currentUser.isAdmin) {
      return true;
    }

    permissionValues.forEach(permissionValue => {
      if (
        !this.permissions.some(
          p => (p as PermissionValues) == (permissionValue as PermissionValues)
        )
      ) {
        hasPermission = false;
      }
    });

    return hasPermission;
  }

  userHasPermission(permissionValue: PermissionValues): boolean {
    return (
      this.currentUser.isAdmin ||
      this.permissions.some(p => p == permissionValue)
    );
  }

  get permissions(): PermissionValues[] {
    return store.getters.userPermissions();
  }

  get currentUser() {
    return store.getters.currentUser();
  }
}

const instance = new AccountService();

export default instance;
