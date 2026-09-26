import { Request, Response } from 'express';
import process from 'process';
import { Hook_Data_Field } from '@src/data_struct/zalo/hook_data';
import { send_Hook_Data } from '@src/messageQueue/Producer';
import { getEnv } from '@src/mode';
import { myEnv } from '@src/mode/type';

const VERIFY_TOKEN = process.env.ZALO_VERIFY_TOKEN!;
const prefix = getEnv() === myEnv.Dev ? 'dev' : '';

class Handle_Zalo_WebHook {
    get_Data = async (req: Request, res: Response) => {
        console.log('Zalo_WebHook', 'getData', req.query);
        const { verify_token } = req.query;

        if (verify_token === VERIFY_TOKEN) {
            res.status(200).send(verify_token);
            return;
        }

        res.status(403).send('Invalid verify token');
        return;
    };

    post_Data = (req: Request<any, any, Hook_Data_Field<any>>, res: Response) => {
        console.log('Zalo Webhook Event:', req.body);
        const hook_data_body = req.body;

        send_Hook_Data(`zalo_hook_data_queue_${prefix}`, hook_data_body);

        res.status(200).json({ received: true });
        return;
    };

    token_Callback = async (req: Request, res: Response) => {
        const code = req.query.code as string;

        if (!code) {
            res.send('No code');
            return;
        }

        res.send(code);
        return;
    };
}

export default Handle_Zalo_WebHook;
