import RequestHandler from "./requestHandler";

class RoleService {
  private static instance: RoleService;
  private readonly path = "roles";

  constructor() {
    if (RoleService.instance) {
      return RoleService.instance;
    }
    RoleService.instance = this;

    return this;
  }

  async get() {
    return await RequestHandler.get(this.path);
  }

  async insert(data) {
    return await RequestHandler.post(this.path, data);
  }

  async update(data) {
    return await RequestHandler.put(this.path, data);
  }

  async delete(id) {
    return await RequestHandler.delete(this.path, id);
  }

  async getClaims() {
    return await RequestHandler.get(`${this.path}/claims`);
  }
}

const instance = new RoleService();

export default instance;
