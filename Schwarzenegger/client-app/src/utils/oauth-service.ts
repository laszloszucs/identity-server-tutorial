import axios from "axios";

let openIdConfig: any;

async function getOpenIdConfiguration() {
  return await axios({
    url: `https://${process.env.VUE_APP_SERVER_HOST}:${process.env.VUE_APP_SERVER_PORT}/.well-known/openid-configuration`,
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

async function getToken(user: any) {
  const formData = new FormData();
  formData.set("grant_type", "password");
  formData.append("client_id", "schwarzenegger_spa");
  formData.append(
    "scope",
    "openid email phone profile offline_access roles schwarzenegger_api"
  );
  formData.append("username", user.username);
  formData.append("password", user.password);
  return await sendForm(formData);
}

async function getTokenByRefreshToken(refreshToken: string) {
  const formData = new FormData();
  formData.set("grant_type", "refresh_token");
  formData.append("client_id", "schwarzenegger_spa");
  formData.append("refresh_token", refreshToken);
  return sendForm(formData);
}

async function loginWithPassword(user: any) {
  openIdConfig = (await getOpenIdConfiguration()).data;
  return (await getToken(user)).data;
}

async function refreshLogin(refreshToken: string) {
  openIdConfig = (await getOpenIdConfiguration()).data;
  return (await getTokenByRefreshToken(refreshToken)).data;
}

export default { loginWithPassword, refreshLogin };
