import { Request, Response } from 'express';
import process from 'process';
import { HookDataField } from '@src/dataStruct/hookData';
import { sendHookData } from '@src/messageQueue/Producer';
import { getEnv } from '@src/mode';
import { myEnv } from '@src/mode/type';
import axios from 'axios';

const VERIFY_TOKEN = process.env.ZALO_VERIFY_TOKEN!;
const prefix = getEnv() === myEnv.Dev ? '_dev' : '';

class Handle_Zalo_WebHook {
    getData = async (req: Request, res: Response) => {
        console.log('Zalo_WebHook', 'getData', req.query);
        const { verify_token } = req.query;

        if (verify_token === VERIFY_TOKEN) {
            res.status(200).send(verify_token);
            return;
        }

        res.status(403).send('Invalid verify token');
        return;
    };

    postData = (req: Request<unknown, unknown, HookDataField<unknown>>, res: Response) => {
        console.log('Zalo Webhook Event:', req.body);
        const hookDataBody = req.body as HookDataField;

        sendHookData(`zalo_hook_data_queue${prefix}`, hookDataBody);

        res.status(200).json({ received: true });
        return;
    };

    tokenCallback = async (req: Request, res: Response) => {
        const code = req.query.code as string;

        if (!code) {
            res.send('No code');
            return;
        }

        try {
            const tokenRes = await axios.post(
                'https://oauth.zaloapp.com/v4/access_token',
                new URLSearchParams({
                    app_id: process.env.ZALO_APP_ID!,
                    code,
                    grant_type: 'authorization_code',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        secret_key: process.env.ZALO_SECRET_KEY!,
                    },
                }
            );

            const data = tokenRes.data;

            console.log('TOKEN:', data);

            res.json(data);
            return;
        } catch (err: any) {
            console.error(err.response?.data || err.message);
            res.send('Error lấy token');
            return;
        }
    };
}

export default Handle_Zalo_WebHook;
