export class LoginMsg {
    t: number = 1
    login: string
    password: string

    constructor(login: string, password: string) {
        this.login = login
        this.password = password
    }
}
