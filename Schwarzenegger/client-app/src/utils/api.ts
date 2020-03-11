import axios from "axios";

const baseUrl = "https://localhost:44300";
let openIdConfig: any = null;

async function getOpenIdConfiguration() {
  return axios({
    url: baseUrl + "/.well-known/openid-configuration",
    data: null,
    method: "GET"
  });
}

async function getToken(user: any) {
  const formData = new FormData();
  formData.set("grant_type", "password");
  formData.append("client_id", "schwarzenegger_spa");
  formData.append("scope", "schwarzenegger_api");
  formData.append("username", user.username);
  formData.append("password", user.password);
  return axios({
    url: openIdConfig.token_endpoint,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  });
}

async function login(user: any) {
  openIdConfig = (await getOpenIdConfiguration()).data;
  return (await getToken(user)).data;
}

async function identity() {
  return axios.get("https://localhost:44300/api/identity");
}

export default { login, identity };
