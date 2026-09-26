import express, { Router } from 'express';
import dotenv from 'dotenv';
import Handle_Zalo_WebHook from './handle';

dotenv.config();

const service_zalo_webhook: Router = express.Router();

const handle_zalo_webHook = new Handle_Zalo_WebHook();

service_zalo_webhook.get('/zalo/webhook', handle_zalo_webHook.get_Data);

service_zalo_webhook.post('/zalo/webhook', handle_zalo_webHook.post_Data);

service_zalo_webhook.get('/zalo/token_callback', handle_zalo_webHook.token_Callback);

export default service_zalo_webhook;
