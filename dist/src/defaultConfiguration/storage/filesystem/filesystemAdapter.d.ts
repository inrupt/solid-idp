import { DefaultConfigurationConfigs } from '../../defaultConfiguration';
export default function getFilesystemAdapater(config: DefaultConfigurationConfigs): Promise<{
    new (name: string): {
        name: string;
        filename(id: string): string;
        set(id: string, payload: any, expiresIn?: number): Promise<void>;
        get(id: string): Promise<any>;
        delete(id: string): Promise<void>;
        key(id: string): string;
        destroy(id: string): Promise<void>;
        consume(id: string): Promise<void>;
        find(id: string): Promise<any>;
        findByUid(uid: string): Promise<any>;
        findByUserCode(userCode: string): Promise<any>;
        upsert(id: string, payload: any, expiresIn: number): Promise<void>;
        revokeByGrantId(grantId: string): Promise<void>;
    };
}>;
