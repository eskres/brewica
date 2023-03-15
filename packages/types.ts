export interface IUser {
    username: string;
    emailAddress: string;
    password: string;
    passwordConf: string;
    token?: string;
    verified?: boolean;
    expiresAt?: Date;
};

export interface ISignIn {
    emailAddress: string;
    password: string;
}