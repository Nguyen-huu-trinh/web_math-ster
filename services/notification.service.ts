import {

notificationRepository,

CreateNotificationDto

}

from "@/repositories/notification.repository";

export class NotificationService{

    create(data:CreateNotificationDto){

        return notificationRepository.create(data);

    }

    assign(id:string,userIds:string[]){

        return notificationRepository.assign(id,userIds);

    }

    myNotifications(id:string){

        return notificationRepository.myNotifications(id);

    }

}

export const notificationService=
new NotificationService();