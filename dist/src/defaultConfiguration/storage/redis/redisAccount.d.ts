import { DefaultConfigurationConfigs } from '../../defaultConfiguration';
import DefaultConfigAccount from '../../account';
export default function getRedisAccount(config: DefaultConfigurationConfigs): {
    new (): {
        authenticate(username: string, password: string): Promise<DefaultConfigAccount>;
        create(email: string, password: string, username: string, webID: string): Promise<void>;
        changePassword(username: string, password: string): Promise<void>;
        key(name: string): string;
        generateForgotPassword(username: string): Promise<{
            email: string;
            uuid: string;
        }>;
        getForgotPassword(uuid: string): Promise<string>;
        deleteForgotPassword(uuid: string): Promise<void>;
        forgotPasswordKey(name: string): string;
    };
};
