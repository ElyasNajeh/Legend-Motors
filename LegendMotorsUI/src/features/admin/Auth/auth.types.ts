export type User = {
    id : number,
    username : string,
    email : string
}

export type LoginRequest = {
    email : string,
    password : string
}

export type LoginResponse = {
    message : string,
    username : string,
    access_token : string,
    token_type : string,
    expires_in : number
}

export type RefreshResponse = {
    message : string,
    access_token : string,
    token_type : string,
    expires_in : number
}

export type MessageResponse = {
    message: string
}

