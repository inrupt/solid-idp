import { DefaultConfigurationConfigs } from '../../defaultConfiguration';
import DefaultConfigAccount from '../../account';
export default function getFilesystemAccount(config: DefaultConfigurationConfigs): Promise<{
    new (): {
        authenticate(username: string, password: string): Promise<DefaultConfigAccount>;
        create(email: string, password: string, username: string, webID: string): Promise<void>;
        changePassword(username: string, password: string): Promise<void>;
        userLocation(webID: string): string;
        userFileName(webID: string): string;
        userByEmailLocation(email: string): string;
        forgotPasswordLocation(name: string): string;
        getUser(username: string): Promise<any>;
        generateForgotPassword(username: string): Promise<{
            email: string;
            uuid: string;
        }>;
        getForgotPassword(uuid: string): Promise<string>;
        deleteForgotPassword(uuid: string): Promise<void>;
    };
}>;
