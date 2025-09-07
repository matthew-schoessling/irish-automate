export const baseUrl = "https://api.copper.com/developer_api/v1/";

// Api Token can be found in Copper under Settings > Integrations > Api Keys
const apiToken: string = '';
const apiEmail = "caroline@irishangels.com";
export const headers: HeadersInit = {
  "X-PW-AccessToken": apiToken,
  "X-PW-Application": "developer_api",
  "X-PW-UserEmail": apiEmail,
  "Content-Type": "application/json"
};
