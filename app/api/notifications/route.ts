import { NextRequest } from "next/server";

import {

created,

success

}

from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

import { requireTeacher } from "@/lib/auth/teacher";

import {

notificationService

}

from "@/services/notification.service";

import {

CreateNotificationSchema

}

from "@/validators/notification.schema";

export async function POST(

request:NextRequest

){

try{

await requireTeacher();

const body=

await request.json();

const value=

CreateNotificationSchema.parse(body);

const notification=

await notificationService.create({

title:value.title,

message:value.message,

type:value.type

});

await notificationService.assign(

notification.id,

value.userIds

);

return created(notification);

}

catch(error){

return handleError(error);

}

}

export async function GET(){

try{

await requireTeacher();

return success([]);

}

catch(error){

return handleError(error);

}

}