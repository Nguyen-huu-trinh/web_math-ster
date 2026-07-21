import { z } from "zod";

export const CreateNotificationSchema=z.object({

title:z.string().min(3),

message:z.string().min(5),

type:z.string(),

userIds:z.array(

z.string().uuid()

)

});