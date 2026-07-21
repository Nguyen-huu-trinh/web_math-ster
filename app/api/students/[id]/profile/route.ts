import { NextRequest } from "next/server";

import { studentService } from "@/services/student.service";

import { success } from "@/lib/api/api-response";

import { handleError } from "@/lib/api/handle-error";

import { requireTeacher } from "@/lib/auth/teacher";

interface Props{

    params:Promise<{

        id:string

    }>

}

export async function GET(

    request:NextRequest,

    {params}:Props

){

    try{

        await requireTeacher();

        const {id}=await params;

        return success(

            await studentService.getProfile(id)

        );

    }

    catch(error){

        return handleError(error);

    }

}