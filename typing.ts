export default interface ResponseObject{
    success:boolean,
    data: any|null,
    message: string|null,

}

export interface ControllerObject {
    [key:string]:CallableFunction
}