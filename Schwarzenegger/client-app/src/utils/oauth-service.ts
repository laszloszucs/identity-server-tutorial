import axios, { AxiosResponse } from "axios";
import { LoginResponse } from '@/models/login-response.model';

const baseUrl = "https://localhost:44300";
let openIdConfig: any = null;

async function getOpenIdConfiguration() {
  return axios({
    url: baseUrl + "/.well-known/openid-configuration",
    data: null,
    method: "GET"
  });
}

async function sendForm(formData) {
  return await axios({
    url: openIdConfig.token_endpoint,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" }
  });
}

async function getToken(user: any): Promise<AxiosResponse<any>> {
  const formData = new FormData();
  formData.set("grant_type", "password");
  formData.append("client_id", "schwarzenegger_spa");
  formData.append("scope", "schwarzenegger_api");
  formData.append("username", user.username);
  formData.append("password", user.password);
  return await sendForm(formData);
}

async function getTokenByRefreshToken(refreshToken: string): Promise<AxiosResponse<any>> {
  const formData = new FormData();
  formData.set("grant_type", "refresh_token");
  formData.append("client_id", "schwarzenegger_spa");
  formData.append("refresh_token", refreshToken);
  return await sendForm(formData);
}

async function loginWithPassword(user: any): Promise<LoginResponse> {
  openIdConfig = (await getOpenIdConfiguration()).data;
  return (await getToken(user)).data;
}

async function refreshLogin(refreshToken: string): Promise<LoginResponse> {
  openIdConfig = (await getOpenIdConfiguration()).data;
  return (await getTokenByRefreshToken(refreshToken)).data;
}

async function identity() {
  return await axios.get("https://localhost:44300/api/identity");
}

export default { loginWithPassword, refreshLogin, identity };
