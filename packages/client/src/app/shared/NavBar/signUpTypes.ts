type Params = {
    valid: boolean,
    feedback: string
}

export type State = {
    username: Params,
    emailAddress: Params,
    password: Params,
    passwordConf: Params
}

export type Action = {
    field: string,
    valid: boolean,
    feedback: string
}

export type Feedback = {
    empty: string,
    invalid: string
}