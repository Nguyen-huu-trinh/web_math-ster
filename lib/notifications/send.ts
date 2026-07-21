import {

notificationService

}

from "@/services/notification.service";

export async function notifyStudent(

userId:string,

title:string,

message:string,

type:string

){

const notification=

await notificationService.create({

title,

message,

type

});

await notificationService.assign(

notification.id,

[userId]

);

}