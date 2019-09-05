import Redis from 'ioredis';
import { DefaultConfigurationConfigs } from '../../defaultConfiguration';
export default function getRedisAdapter(config: DefaultConfigurationConfigs): {
    new (name: string): {
        name: string;
        client: Redis.Redis;
        upsert(id: string, payload: any, expiresIn: number): Promise<void>;
        find(id: string): Promise<any>;
        findByUid(uid: string): Promise<any>;
        findByUserCode(userCode: string): Promise<any>;
        destroy(id: string): Promise<void>;
        revokeByGrantId(grantId: string): Promise<void>;
        consume(id: string): Promise<void>;
        key(id: string): string;
    };
};
