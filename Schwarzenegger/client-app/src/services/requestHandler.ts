import axios from "axios";
import notify from "devextreme/ui/notify";
import vue from "./../main";

class RequestHandler {
  private static instance: RequestHandler;
  private apiUrl = "https://localhost:44300/api/";

  constructor() {
    if (RequestHandler.instance) {
      return RequestHandler.instance;
    }
    RequestHandler.instance = this;

    return this;
  }

  fullUrl(path: string, id = null): string {
    path = path.replace(/^\/+|\/+$/g, ""); // Leszedi a felesleges /-eket a path-ből
    return `${this.apiUrl}${path}${id ? `/${id}` : ""}`; // Ha van id paraméter, akkor /id-vel kiegészíti
  }

  async get(path: string, id = null) {
    try {
      const response = await axios.get(this.fullUrl(path, id));
      return response.data;
    } catch (error) {
      await this.error(error);
      return null;
    }
  }

  async post(path: string, data: any) {
    try {
      const response = await axios.post(this.fullUrl(path), data);
      return response.data;
    } catch (error) {
      await this.error(error);
      return null;
    }
  }

  async put(path: string, data: string) {
    // TODO put-nál benne van az id a data-ban
    try {
      const response = await axios.put(this.fullUrl(path), data);
      return response.data;
    } catch (error) {
      await this.error(error);
      return null;
    }
  }

  async delete(path: string, id: any) {
    try {
      debugger;
      const response = await axios.delete(this.fullUrl(path, id));
      return response.data;
    } catch (error) {
      await this.error(error);
      return null;
    }
  }

  async error(error: any) {
    let errorMessage = null;
    if (error.isAxiosError) {
      errorMessage = error.message;
    } else {
      errorMessage = error.response.data.error_description;
    }
    notify(
      {
        message: vue.$te("error." + errorMessage)
          ? vue.$t("error." + errorMessage)
          : errorMessage,
        position: {
          at: "top",
          offset: "0 40"
        }
      },
      "error",
      3000
    );
  }
}

const instance = new RequestHandler();

export default instance;
