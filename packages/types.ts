import { type FormEventHandler } from "react";

export interface IUser {
    _id?: string;
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

export type Props = {
    password: string
}