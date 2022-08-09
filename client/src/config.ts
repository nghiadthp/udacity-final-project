// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'r6shujsnf1'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-lvfte2-v.us.auth0.com',
  clientId: 'PylovAC7fl1TY8abD1V8gHLrGG87XAdE',
  callbackUrl: 'http://localhost:3000/callback'
}
