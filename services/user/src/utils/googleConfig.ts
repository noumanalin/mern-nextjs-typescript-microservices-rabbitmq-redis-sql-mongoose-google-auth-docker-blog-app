import { google } from 'googleapis'
import 'dotenv/config'

const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;

export const oauth2client = new google.auth.OAuth2( google_client_id, google_client_secret, "postmessage")
